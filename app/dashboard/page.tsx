import { getProtectedUser } from "../_components/protected-page";
import { createClient } from "../lib/supabase/server";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getProtectedUser("/dashboard");
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.userId).maybeSingle();

  return (
    <DashboardView
      userId={user.userId}
      user={{ displayName: user.displayName, email: user.email }}
      profile={profile}
      signOutHref="/auth/signout"
    />
  );
}
