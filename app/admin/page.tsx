import { AppShell } from "../_ui/AppShell";
import { requireRole } from "../lib/kufuo/session";
import { AdminView } from "./AdminView";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireRole("admin", "/admin");
  return (
    <AppShell role="admin" email={session.email}>
      <AdminView adminId={session.userId} />
    </AppShell>
  );
}
