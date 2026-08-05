import type { Metadata } from "next";
import { MemberWorkspace } from "../_components/MemberWorkspace";
import { getProtectedUser } from "../_components/protected-page";
import { chatGPTSignOutPath } from "../chatgpt-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications — Kufuo | كفو", description: "Founder matches, introductions, messages, and useful community activity." };

export default async function NotificationsPage() { const user = await getProtectedUser("/notifications"); return <MemberWorkspace mode="notifications" user={{ displayName: user.displayName, email: user.email }} signOutHref={chatGPTSignOutPath("/")} />; }
