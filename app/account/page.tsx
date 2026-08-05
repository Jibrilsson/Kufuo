import { chatGPTSignOutPath, getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";
import { AccountView } from "./AccountView";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = process.env.NODE_ENV === "development"
    ? (await getChatGPTUser()) ?? { userId: "preview", displayName: "Salah Jibril", email: "jibrilsson@gmail.com", fullName: "Salah Jibril" }
    : await requireChatGPTUser("/account");

  return (
    <AccountView
      user={{ displayName: user.displayName, email: user.email }}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
