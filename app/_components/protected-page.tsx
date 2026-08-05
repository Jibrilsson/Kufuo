import { getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";

export async function getProtectedUser(returnTo: string) {
  return process.env.NODE_ENV === "development"
    ? (await getChatGPTUser()) ?? { userId: "preview", displayName: "Salah Jibril", email: "jibrilsson@gmail.com", fullName: "Salah Jibril" }
    : requireChatGPTUser(returnTo);
}
