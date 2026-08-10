import { createClient } from "../supabase/client";
import type {
  CommunityPost,
  ConnectionRequest,
  Conversation,
  FounderProfile,
  Idea,
  MemberSettings,
  Message,
  Notification,
} from "./types";

const supabase = () => createClient();

function assert<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export async function loadOwnProfile(userId: string) {
  const { data, error } = await supabase().from("profiles").select("*").eq("id", userId).maybeSingle();
  return assert(data, error) as FounderProfile | null;
}

export async function saveOwnProfile(userId: string, profile: Partial<FounderProfile>) {
  const allowed = {
    id: userId,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    headline: profile.headline,
    bio: profile.bio,
    city: profile.city,
    country_code: profile.country_code ?? "SA",
    role: profile.role,
    linkedin_url: profile.linkedin_url,
    skills: profile.skills ?? [],
    industries: profile.industries ?? [],
    languages: profile.languages ?? [],
    profile_type: profile.profile_type ?? "both",
    availability: profile.availability,
    commitment: profile.commitment,
    startup_stage: profile.startup_stage,
    looking_for: profile.looking_for,
    working_style: profile.working_style,
    decision_style: profile.decision_style,
    equity_approach: profile.equity_approach,
    is_visible: profile.is_visible ?? true,
    onboarding_complete: profile.onboarding_complete ?? false,
    profile_strength: profile.profile_strength ?? 20,
  };
  const { data, error } = await supabase().from("profiles").upsert(allowed).select("*").single();
  return assert(data, error) as FounderProfile;
}

export async function loadDiscovery(userId: string) {
  const client = supabase();
  const [{ data: profiles, error: profileError }, { data: ideas, error: ideaError }, { data: saved, error: savedError }] = await Promise.all([
    client.from("profiles").select("*").neq("id", userId).eq("onboarding_complete", true).eq("is_visible", true).order("updated_at", { ascending: false }),
    client.from("ideas").select("*").eq("status", "open").order("created_at", { ascending: false }),
    client.from("saved_profiles").select("profile_id").eq("user_id", userId),
  ]);
  if (profileError) throw new Error(profileError.message);
  if (ideaError) throw new Error(ideaError.message);
  if (savedError) throw new Error(savedError.message);
  return {
    profiles: (profiles ?? []) as FounderProfile[],
    ideas: (ideas ?? []) as Idea[],
    savedProfileIds: (saved ?? []).map((row) => row.profile_id as string),
  };
}

export async function toggleSavedProfile(userId: string, profileId: string, shouldSave: boolean) {
  const query = shouldSave
    ? supabase().from("saved_profiles").insert({ user_id: userId, profile_id: profileId })
    : supabase().from("saved_profiles").delete().eq("user_id", userId).eq("profile_id", profileId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function requestIntroduction(userId: string, recipientId: string, message: string) {
  const { data, error } = await supabase().from("connection_requests").insert({ requester_id: userId, recipient_id: recipientId, message }).select("*").single();
  return assert(data, error) as ConnectionRequest;
}

export async function loadConnections(userId: string) {
  const client = supabase();
  const { data: requests, error } = await client.from("connection_requests").select("*").or(`requester_id.eq.${userId},recipient_id.eq.${userId}`).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (requests ?? []) as ConnectionRequest[];
  const ids = Array.from(new Set(rows.flatMap((row) => [row.requester_id, row.recipient_id]).filter((id) => id !== userId)));
  if (!ids.length) return { requests: rows, profiles: [] as FounderProfile[] };
  const { data: profiles, error: profileError } = await client.from("profiles").select("*").in("id", ids);
  if (profileError) throw new Error(profileError.message);
  return { requests: rows, profiles: (profiles ?? []) as FounderProfile[] };
}

export async function respondToIntroduction(requestId: string, status: "accepted" | "declined" | "cancelled") {
  const { data, error } = await supabase().from("connection_requests").update({ status }).eq("id", requestId).select("*").single();
  return assert(data, error) as ConnectionRequest;
}

export async function loadConversations(userId: string) {
  const client = supabase();
  const { data: conversations, error } = await client.from("conversations").select("*").or(`participant_a.eq.${userId},participant_b.eq.${userId}`).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (conversations ?? []) as Conversation[];
  const profileIds = Array.from(new Set(rows.map((row) => row.participant_a === userId ? row.participant_b : row.participant_a)));
  const { data: profiles, error: profileError } = profileIds.length
    ? await client.from("profiles").select("*").in("id", profileIds)
    : { data: [], error: null };
  if (profileError) throw new Error(profileError.message);
  const conversationIds = rows.map((row) => row.id);
  const { data: messages, error: messageError } = conversationIds.length
    ? await client.from("messages").select("*").in("conversation_id", conversationIds).order("created_at", { ascending: true })
    : { data: [], error: null };
  if (messageError) throw new Error(messageError.message);
  return { conversations: rows, profiles: (profiles ?? []) as FounderProfile[], messages: (messages ?? []) as Message[] };
}

export async function sendConversationMessage(userId: string, conversationId: string, body: string) {
  const { data, error } = await supabase().from("messages").insert({ author_id: userId, conversation_id: conversationId, body }).select("*").single();
  return assert(data, error) as Message;
}

export async function loadNotifications(userId: string) {
  const { data, error } = await supabase().from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as Notification[];
}

export async function markNotificationsRead(userId: string) {
  const { error } = await supabase().from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", userId).is("read_at", null);
  if (error) throw new Error(error.message);
}

export async function loadSettings(userId: string) {
  const { data, error } = await supabase().from("member_settings").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as MemberSettings | null;
}

export async function saveSettings(userId: string, settings: Omit<MemberSettings, "user_id">) {
  const { data, error } = await supabase().from("member_settings").upsert({ user_id: userId, ...settings }).select("*").single();
  return assert(data, error) as MemberSettings;
}

export async function loadFeed(userId: string) {
  const client = supabase();
  const { data: posts, error } = await client.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  const rows = (posts ?? []) as CommunityPost[];
  const authorIds = Array.from(new Set(rows.map((row) => row.author_id)));
  const postIds = rows.map((row) => row.id);
  const [{ data: authors }, { data: reactions }, { data: comments }, { data: saved }] = await Promise.all([
    authorIds.length ? client.from("profiles").select("*").in("id", authorIds) : Promise.resolve({ data: [] }),
    postIds.length ? client.from("post_reactions").select("post_id,user_id").in("post_id", postIds) : Promise.resolve({ data: [] }),
    postIds.length ? client.from("comments").select("post_id").in("post_id", postIds) : Promise.resolve({ data: [] }),
    postIds.length ? client.from("saved_posts").select("post_id").eq("user_id", userId).in("post_id", postIds) : Promise.resolve({ data: [] }),
  ]);
  const profileMap = new Map(((authors ?? []) as FounderProfile[]).map((profile) => [profile.id, profile]));
  return rows.map((post) => ({
    ...post,
    author: profileMap.get(post.author_id) ?? null,
    reaction_count: (reactions ?? []).filter((row) => row.post_id === post.id).length,
    comment_count: (comments ?? []).filter((row) => row.post_id === post.id).length,
    reacted: (reactions ?? []).some((row) => row.post_id === post.id && row.user_id === userId),
    saved: (saved ?? []).some((row) => row.post_id === post.id),
  }));
}

export async function publishPost(userId: string, body: string, kind: CommunityPost["kind"] = "update") {
  const { data, error } = await supabase().from("posts").insert({ author_id: userId, body, kind }).select("*").single();
  return assert(data, error) as CommunityPost;
}

export async function togglePostReaction(userId: string, postId: string, active: boolean) {
  const query = active
    ? supabase().from("post_reactions").insert({ user_id: userId, post_id: postId, kind: "useful" })
    : supabase().from("post_reactions").delete().eq("user_id", userId).eq("post_id", postId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function toggleSavedPost(userId: string, postId: string, active: boolean) {
  const query = active
    ? supabase().from("saved_posts").insert({ user_id: userId, post_id: postId })
    : supabase().from("saved_posts").delete().eq("user_id", userId).eq("post_id", postId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}
