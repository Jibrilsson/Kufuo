import { chatGPTSignOutPath, getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = process.env.NODE_ENV === "development"
    ? (await getChatGPTUser()) ?? { userId: "preview", displayName: "Salah Jibril", email: "jibrilsson@gmail.com", fullName: "Salah Jibril" }
    : await requireChatGPTUser("/dashboard");

  return (
    <DashboardView
      user={{ displayName: user.displayName, email: user.email }}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
