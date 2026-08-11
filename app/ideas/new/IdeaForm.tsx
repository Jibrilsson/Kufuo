"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Save } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import { MemberHeader } from "../../_components/MemberHeader";

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export function IdeaForm({ userId, user }: { userId: string; user: { displayName: string; email: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", summary: "", stage: "discovery", city: "", skills: "", industries: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (form.title.trim().length < 3 || form.summary.trim().length < 10) { setError("Add a clear title and a little more context about the idea."); return; }
    setSaving(true);
    const { error: insertError } = await createClient().from("ideas").insert({ owner_id: userId, title: form.title.trim(), summary: form.summary.trim(), stage: form.stage, city: form.city.trim() || null, skills_needed: splitList(form.skills), industries: splitList(form.industries), status: "open" });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return <main className="form-page member-form-page"><MemberHeader user={user} active="opportunities" /><section className="form-card"><span className="side-icon"><Lightbulb size={21} /></span><p className="kicker">Your idea</p><h1>Describe what you want to build.</h1><p>Share enough context for a serious potential cofounder to understand the problem, stage, and missing skills.</p><form onSubmit={submit}><label><span>Idea title *</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={120} placeholder="A simpler returns network for local commerce" /></label><label><span>Problem and opportunity *</span><textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} rows={7} maxLength={1200} placeholder="What problem have you observed, what have you validated, and who do you need?" /></label><div className="form-grid"><label><span>Stage</span><select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}><option value="discovery">Problem discovery</option><option value="validation">Validation</option><option value="mvp">MVP</option><option value="early_revenue">Early revenue</option><option value="growth">Growth</option></select></label><label><span>City</span><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Berlin, Dubai, or Remote" /></label><label><span>Skills needed</span><input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Engineering, Growth, Finance" /></label><label><span>Sectors</span><input value={form.industries} onChange={(event) => setForm({ ...form, industries: event.target.value })} placeholder="Fintech, B2B SaaS" /></label></div>{error && <p className="workspace-error" role="alert">{error}</p>}<button className="button" type="submit" disabled={saving}><Save size={17} />{saving ? "Publishing…" : "Publish the idea"}</button></form></section></main>;
}
