import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

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
