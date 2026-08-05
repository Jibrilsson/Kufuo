import type { Metadata } from "next";
import { MemberWorkspace } from "../_components/MemberWorkspace";
import { getProtectedUser } from "../_components/protected-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings — Kufuo | كفو", description: "Manage matching, privacy, notifications, language, and account preferences." };

export default async function SettingsPage() { const user = await getProtectedUser("/settings"); return <MemberWorkspace mode="settings" user={{ displayName: user.displayName, email: user.email }} signOutHref="/auth/signout" />; }
