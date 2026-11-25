import { redirect } from "next/navigation";
import { AppShell } from "../../_ui/AppShell";
import { homeFor, requireSignedIn } from "../../lib/kufuo/session";
import { NewCompanyView } from "./NewCompanyView";

export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  const session = await requireSignedIn("/company/new");
  if (session.role) redirect(homeFor(session.role));
  return (
    <AppShell role={null} email={session.email}>
      <NewCompanyView />
    </AppShell>
  );
}
