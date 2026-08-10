import { getProtectedUser } from "../_components/protected-page";
import { createClient } from "../lib/supabase/server";
import { AccountView } from "./AccountView";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getProtectedUser("/account");
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.userId).maybeSingle();

  return (
    <AccountView
      userId={user.userId}
      user={{ displayName: user.displayName, email: user.email }}
      initialProfile={profile}
      signOutHref="/auth/signout"
    />
  );
}
