import type { Metadata } from "next";
import { MemberWorkspace } from "../_components/MemberWorkspace";
import { getProtectedUser } from "../_components/protected-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages — Kufuo | كفو", description: "Private conversations with your founder connections." };

export default async function MessagesPage() { const user = await getProtectedUser("/messages"); return <MemberWorkspace mode="messages" user={{ displayName: user.displayName, email: user.email }} signOutHref="/auth/signout" />; }
