export type Language = "en" | "ar";

export type FounderProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  country_code: string;
  role: string | null;
  linkedin_url: string | null;
  skills: string[];
  industries: string[];
  languages: string[];
  profile_type: "idea" | "skill" | "both";
  availability: string | null;
  commitment: string | null;
  startup_stage: string | null;
  looking_for: string | null;
  working_style: string | null;
  decision_style: string | null;
  equity_approach: string | null;
  is_visible: boolean;
  onboarding_complete: boolean;
  profile_strength: number;
  created_at: string;
  updated_at: string;
};

export type Idea = {
  id: string;
  owner_id: string;
  title: string;
  summary: string;
  stage: string;
  city: string | null;
  skills_needed: string[];
  industries: string[];
  status: "draft" | "open" | "paused" | "closed";
  created_at: string;
  updated_at: string;
};

export type ConnectionRequest = {
  id: string;
  requester_id: string;
  recipient_id: string;
  message: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  connection_request_id: string;
  participant_a: string;
  participant_b: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  author_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type CommunityPost = {
  id: string;
  author_id: string;
  kind: "update" | "idea" | "help" | "opportunity" | "community";
  title: string | null;
  body: string;
  visibility: "community" | "connections";
  created_at: string;
  updated_at: string;
  author?: FounderProfile | null;
  reaction_count?: number;
  comment_count?: number;
  reacted?: boolean;
  saved?: boolean;
};

export type Notification = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  actor_id: string | null;
  created_at: string;
};

export type MemberSettings = {
  user_id: string;
  match_notifications: boolean;
  introduction_notifications: boolean;
  community_notifications: boolean;
  profile_visible: boolean;
  city_visible: boolean;
  preferred_language: Language;
};

export const emptyProfile = (id: string, fullName: string): FounderProfile => ({
  id,
  full_name: fullName,
  avatar_url: null,
  headline: null,
  bio: null,
  city: null,
  country_code: "SA",
  role: null,
  linkedin_url: null,
  skills: [],
  industries: [],
  languages: [],
  profile_type: "both",
  availability: null,
  commitment: null,
  startup_stage: null,
  looking_for: null,
  working_style: null,
  decision_style: null,
  equity_approach: null,
  is_visible: true,
  onboarding_complete: false,
  profile_strength: 20,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
