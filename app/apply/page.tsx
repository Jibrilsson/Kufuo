import { redirect } from "next/navigation";
import { AppShell } from "../_ui/AppShell";
import { homeFor, requireSignedIn } from "../lib/kufuo/session";
import { createClient } from "../lib/supabase/server";
import type { Expert } from "../lib/kufuo/types";
import { ApplyView } from "./ApplyView";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const session = await requireSignedIn("/apply");
  if (session.role && session.role !== "expert") redirect(homeFor(session.role));
  const supabase = await createClient();
  const { data } = await supabase.from("experts").select("*").eq("id", session.userId).maybeSingle();
  return (
    <AppShell role={session.role} email={session.email}>
      <ApplyView userId={session.userId} defaultName={session.name} existing={(data as Expert | null) ?? null} />
    </AppShell>
  );
}
