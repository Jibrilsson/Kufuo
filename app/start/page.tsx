import { redirect } from "next/navigation";
import { AppShell } from "../_ui/AppShell";
import { homeFor, requireSignedIn } from "../lib/kufuo/session";
import { StartView } from "./StartView";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const session = await requireSignedIn("/start");
  if (session.role) redirect(homeFor(session.role));
  return (
    <AppShell role={null} email={session.email}>
      <StartView />
    </AppShell>
  );
}
