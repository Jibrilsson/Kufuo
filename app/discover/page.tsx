import type { Metadata } from "next";
import { MemberWorkspace } from "../_components/MemberWorkspace";
import { getProtectedUser } from "../_components/protected-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Discover — Kufuo | كفو", description: "Discover compatible founders and credible startup ideas." };

export default async function DiscoverPage() { const user = await getProtectedUser("/discover"); return <MemberWorkspace mode="discover" userId={user.userId} user={{ displayName: user.displayName, email: user.email }} signOutHref="/auth/signout" />; }
