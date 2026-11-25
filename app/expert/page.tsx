import { redirect } from "next/navigation";
import { AppShell } from "../_ui/AppShell";
import { requireRole } from "../lib/kufuo/session";
import { createClient } from "../lib/supabase/server";
import type { Expert } from "../lib/kufuo/types";
import { ExpertView } from "./ExpertView";

export const dynamic = "force-dynamic";

export default async function ExpertPage() {
  const session = await requireRole("expert", "/expert");
  const supabase = await createClient();
  const { data } = await supabase.from("experts").select("*").eq("id", session.userId).maybeSingle();
  if (!data) redirect("/apply");
  return (
    <AppShell role="expert" email={session.email}>
      <ExpertView expert={data as Expert} />
    </AppShell>
  );
}
