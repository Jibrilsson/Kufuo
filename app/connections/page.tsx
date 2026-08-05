import type { Metadata } from "next";
import { MemberWorkspace } from "../_components/MemberWorkspace";
import { getProtectedUser } from "../_components/protected-page";
import { chatGPTSignOutPath } from "../chatgpt-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connections — Kufuo | كفو", description: "Manage founder introductions and accepted connections." };

export default async function ConnectionsPage() { const user = await getProtectedUser("/connections"); return <MemberWorkspace mode="connections" user={{ displayName: user.displayName, email: user.email }} signOutHref={chatGPTSignOutPath("/")} />; }
