import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import type { FounderProfile } from "../lib/kufuo/types";

export async function getProtectedUser(returnTo: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);

  const displayName = user.user_metadata.full_name
    ?? user.user_metadata.name
    ?? user.email?.split("@")[0]
    ?? user.phone
    ?? "Kufuo member";

  return {
    userId: user.id,
    displayName,
    fullName: displayName,
    email: user.email ?? user.phone ?? "Verified Kufuo member",
  };
}

export async function getCompletedMember(returnTo: string) {
  const user = await getProtectedUser(returnTo);
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.userId).maybeSingle();
  const profile = data as FounderProfile | null;

  if (!profile?.onboarding_complete) redirect("/onboarding");

  return { user, profile };
}
