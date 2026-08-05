import { getProtectedUser } from "../_components/protected-page";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getProtectedUser("/dashboard");

  return (
    <DashboardView
      user={{ displayName: user.displayName, email: user.email }}
      signOutHref="/auth/signout"
    />
  );
}
