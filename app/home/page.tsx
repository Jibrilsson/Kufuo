import { redirect } from "next/navigation";
import { getSession, homeFor } from "../lib/kufuo/session";

export const dynamic = "force-dynamic";

export default async function HomeRouter() {
  const session = await getSession();
  if (!session) redirect("/login?returnTo=%2Fhome");
  redirect(homeFor(session.role));
}
