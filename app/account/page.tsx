import { getProtectedUser } from "../_components/protected-page";
import { AccountView } from "./AccountView";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getProtectedUser("/account");

  return (
    <AccountView
      user={{ displayName: user.displayName, email: user.email }}
      signOutHref="/auth/signout"
    />
  );
}
