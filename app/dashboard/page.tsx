import { getCompletedMember } from "../_components/protected-page";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, profile } = await getCompletedMember("/dashboard");

  return (
    <DashboardView
      userId={user.userId}
      user={{ displayName: user.displayName, email: user.email }}
      profile={profile}
      signOutHref="/auth/signout"
    />
  );
}
