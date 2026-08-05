import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { AccountView } from "./AccountView";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");

  return (
    <AccountView
      user={{ displayName: user.displayName, email: user.email }}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
