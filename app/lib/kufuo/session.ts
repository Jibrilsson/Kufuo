import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import type { AppRole } from "./types";

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Kufuo";
  return { userId: user.id, email: user.email ?? "", name: String(name), role: (data?.role ?? null) as AppRole | null };
}

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

export function homeFor(role: AppRole | null) {
  if (role === "admin") return "/admin";
  if (role === "company") return "/company";
  if (role === "expert") return "/expert";
  return "/start";
}

/** Sends signed-out visitors to login and people with another role to their own area. */
export async function requireRole(role: AppRole, returnTo: string) {
  const session = await getSession();
  if (!session) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (session.role !== role) redirect(homeFor(session.role));
  return session;
}

export async function requireSignedIn(returnTo: string) {
  const session = await getSession();
  if (!session) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  return session;
}
