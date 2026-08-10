import type { Metadata } from "next";
import { MemberWorkspace } from "../_components/MemberWorkspace";
import { getCompletedMember } from "../_components/protected-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications — Kufuo | كفو", description: "Founder matches, introductions, messages, and useful community activity." };

export default async function NotificationsPage() { const { user } = await getCompletedMember("/notifications"); return <MemberWorkspace mode="notifications" userId={user.userId} user={{ displayName: user.displayName, email: user.email }} signOutHref="/auth/signout" />; }
