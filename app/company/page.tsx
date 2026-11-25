import { redirect } from "next/navigation";
import { AppShell } from "../_ui/AppShell";
import { requireRole } from "../lib/kufuo/session";
import { createClient } from "../lib/supabase/server";
import type { Company } from "../lib/kufuo/types";
import { CompanyView } from "./CompanyView";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const session = await requireRole("company", "/company");
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, role, companies(id, name, website, billing_email, created_at)")
    .eq("user_id", session.userId)
    .limit(1)
    .maybeSingle();
  const company = (membership?.companies ?? null) as unknown as Company | null;
  if (!company) redirect("/company/new");
  return (
    <AppShell role="company" email={session.email}>
      <CompanyView company={company} userId={session.userId} />
    </AppShell>
  );
}
