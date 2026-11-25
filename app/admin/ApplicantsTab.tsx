"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { specialtyLabel, type Expert, type ExpertLevel, type ExpertStatus } from "../lib/kufuo/types";
import { Empty, Field, Notice, Status, errorText, formatDate } from "../_ui/bits";
import { useT } from "../_ui/lang";
import type { AdminData } from "./useAdminData";

const FILTERS: [string, string, string][] = [
  ["queue", "To process", "للمعالجة"],
  ["accepted", "Accepted", "مقبولون"],
  ["rejected", "Not accepted", "غير مقبولين"],
  ["all", "All", "الكل"],
];

const LEVELS: [ExpertLevel, string, string][] = [
  ["associate", "Associate", "مبتدئ"],
  ["professional", "Professional", "محترف"],
  ["senior", "Senior", "خبير أول"],
  ["principal", "Principal", "خبير رئيسي"],
];

type InterviewRow = { id: string; status: string; language: string; attempt: number; created_at: string; completed_at: string | null; interview_results: { transcript: unknown; summary: unknown; criteria_scores: unknown } | null };
type ReviewRow = { id: string; decision: string; level: string | null; notes: string | null; created_at: string };

export function ApplicantsTab({ data, adminId, reload }: { data: AdminData; adminId: string; reload: () => Promise<void> }) {
  const { t, arabic } = useT();
  const [filter, setFilter] = useState("queue");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = data.experts.filter((e) =>
    filter === "all" ? true : filter === "queue" ? ["submitted", "interviewing", "under_review", "draft"].includes(e.status) : e.status === filter
  );
  const selected = data.experts.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="kx-split">
      <div>
        <div className="kx-chips">
          {FILTERS.map(([key, en, ar]) => <button key={key} type="button" className={filter === key ? "is-on" : ""} onClick={() => setFilter(key)}>{t(en, ar)}</button>)}
        </div>
        {list.length ? (
          <ul className="kx-pick-list">
            {list.map((e) => (
              <li key={e.id}>
                <button type="button" className={selectedId === e.id ? "is-active" : ""} onClick={() => setSelectedId(e.id)}>
                  <span><strong>{e.full_name}</strong><small>{specialtyLabel(e.primary_specialty, arabic)} · {e.country_code ?? "—"} · {formatDate(e.created_at, arabic)}</small></span>
                  <Status value={e.status} />
                </button>
              </li>
            ))}
          </ul>
        ) : <Empty title={t("Nobody here", "ما فيه أحد")} />}
      </div>
      <div>
        {selected ? <ApplicantDetail key={selected.id} expert={selected} adminId={adminId} reload={reload} /> : <Empty title={t("Pick an applicant", "اختر متقدم")}>{t("Their profile, interview and review history show here.", "يظهر هنا ملفه ومقابلته وسجل المراجعة.")}</Empty>}
      </div>
    </div>
  );
}

function ApplicantDetail({ expert, adminId, reload }: { expert: Expert; adminId: string; reload: () => Promise<void> }) {
  const { t, arabic } = useT();
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [rates, setRates] = useState({ pay: "", price: "" });
  const [level, setLevel] = useState<ExpertLevel | "">(expert.level ?? "");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const loadDetail = useCallback(async () => {
    const s = createClient();
    const [i, r, rate] = await Promise.all([
      s.from("interviews").select("id, status, language, attempt, created_at, completed_at, interview_results(transcript, summary, criteria_scores)").eq("expert_id", expert.id).order("created_at", { ascending: false }),
      s.from("expert_reviews").select("id, decision, level, notes, created_at").eq("expert_id", expert.id).order("created_at", { ascending: false }),
      s.from("expert_rates").select("*").eq("expert_id", expert.id).maybeSingle(),
    ]);
    setInterviews((i.data ?? []) as unknown as InterviewRow[]);
    setReviews((r.data ?? []) as ReviewRow[]);
    if (rate.data) setRates({ pay: String(rate.data.default_hourly_pay_usd), price: String(rate.data.default_hourly_price_usd) });
  }, [expert.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on selection
    void loadDetail();
  }, [loadDetail]);

  async function run(action: () => PromiseLike<{ error: unknown }>, success: string) {
    setBusy(true);
    setMessage(null);
    const { error } = await action();
    setBusy(false);
    if (error) return setMessage({ kind: "error", text: errorText(error) });
    setMessage({ kind: "success", text: success });
    await Promise.all([reload(), loadDetail()]);
  }

  const s = createClient();

  async function setStatus(status: ExpertStatus) {
    await run(() => s.from("experts").update({ status }).eq("id", expert.id), t("Status updated.", "تم تحديث الحالة."));
  }

  async function invite() {
    const attempt = (interviews[0]?.attempt ?? 0) + 1;
    if (attempt > 3) return setMessage({ kind: "error", text: t("Maximum of 3 interview attempts.", "الحد الأقصى ٣ محاولات للمقابلة.") });
    await run(async () => {
      const created = await s.from("interviews").insert({ expert_id: expert.id, attempt, specialty: expert.primary_specialty, language: expert.languages.includes("ar") ? "ar" : "en" });
      if (created.error) return created;
      return s.from("experts").update({ status: "interviewing" }).eq("id", expert.id);
    }, t("Interview created. Send the expert their interview link.", "انشأت المقابلة. أرسل للخبير رابط المقابلة."));
  }

  async function decide(decision: "accept" | "reject" | "needs_info") {
    if (decision === "accept" && !level) return setMessage({ kind: "error", text: t("Choose a level before accepting.", "اختر المستوى قبل القبول.") });
    if (decision === "accept" && (!rates.pay || !rates.price)) return setMessage({ kind: "error", text: t("Set the default pay and price before accepting.", "حدّد الأجر والسعر الافتراضي قبل القبول.") });
    await run(async () => {
      const review = await s.from("expert_reviews").insert({ expert_id: expert.id, interview_id: interviews[0]?.id ?? null, reviewer_id: adminId, decision, level: level || null, notes: notes.trim() || null });
      if (review.error) return review;
      if (decision === "accept") {
        const rate = await s.from("expert_rates").upsert({ expert_id: expert.id, default_hourly_pay_usd: Number(rates.pay), default_hourly_price_usd: Number(rates.price), updated_by: adminId });
        if (rate.error) return rate;
        return s.from("experts").update({ status: "accepted", level }).eq("id", expert.id);
      }
      if (decision === "reject") return s.from("experts").update({ status: "rejected" }).eq("id", expert.id);
      return s.from("experts").update({ status: "under_review" }).eq("id", expert.id);
    }, t("Decision saved.", "تم حفظ القرار."));
    setNotes("");
  }

  async function saveRates() {
    await run(() => s.from("expert_rates").upsert({ expert_id: expert.id, default_hourly_pay_usd: Number(rates.pay), default_hourly_price_usd: Number(rates.price), updated_by: adminId }), t("Rates saved.", "تم حفظ الأسعار."));
  }

  const margin = rates.pay && rates.price ? Number(rates.price) - Number(rates.pay) : null;

  return (
    <div className="kx-card kx-detail">
      <div className="kx-card-head">
        <div>
          <h2>{expert.full_name}</h2>
          <p className="kx-muted">{expert.headline ?? specialtyLabel(expert.primary_specialty, arabic)}</p>
        </div>
        <Status value={expert.status} />
      </div>
      <dl className="kx-dl">
        <dt>{t("Specialty", "التخصص")}</dt><dd>{specialtyLabel(expert.primary_specialty, arabic)}</dd>
        <dt>{t("Experience", "الخبرة")}</dt><dd>{expert.years_experience ?? "—"} {t("years", "سنة")}</dd>
        <dt>{t("Country / time zone", "الدولة / التوقيت")}</dt><dd>{expert.country_code ?? "—"} · {expert.timezone ?? "—"}</dd>
        <dt>{t("Languages", "اللغات")}</dt><dd>{expert.languages.join(", ") || "—"}</dd>
        <dt>{t("Hours / week", "ساعات أسبوعيًا")}</dt><dd>{expert.weekly_hours_available ?? "—"} {expert.availability_notes ? `· ${expert.availability_notes}` : ""}</dd>
        <dt>LinkedIn</dt><dd>{expert.linkedin_url ? <a href={expert.linkedin_url} target="_blank" rel="noreferrer">{expert.linkedin_url.replace(/^https:\/\/(www\.)?/, "")}</a> : "—"}</dd>
      </dl>
      {expert.bio ? <p className="kx-bio">{expert.bio}</p> : null}

      <h3>{t("Interview", "المقابلة")}</h3>
      {interviews.length ? interviews.map((i) => (
        <div key={i.id} className="kx-interview">
          <div className="kx-card-head"><span>{t("Attempt", "المحاولة")} {i.attempt} · {i.language.toUpperCase()} · {formatDate(i.created_at, arabic)}</span><Status value={i.status} /></div>
          <code className="kx-code">{t("Interview ID for the interviewer link:", "معرّف المقابلة لرابط المحاور:")} {i.id}</code>
          {i.interview_results?.summary ? <pre className="kx-pre">{JSON.stringify(i.interview_results.summary, null, 2)}</pre> : null}
          {i.interview_results?.transcript ? (
            <details><summary>{t("Transcript", "نص المقابلة")}</summary><pre className="kx-pre">{JSON.stringify(i.interview_results.transcript, null, 2)}</pre></details>
          ) : null}
        </div>
      )) : <p className="kx-muted">{t("No interview yet.", "ما فيه مقابلة للحين.")}</p>}
      <div className="kx-inline-actions">
        <button className="button button-small button-secondary" type="button" disabled={busy} onClick={invite}>{t("Create interview", "أنشئ مقابلة")}</button>
        <button className="button button-small button-secondary" type="button" disabled={busy} onClick={() => setStatus("under_review")}>{t("Move to review", "انقل للمراجعة")}</button>
        {expert.status === "accepted" ? <button className="button button-small button-secondary" type="button" disabled={busy} onClick={() => setStatus("paused")}>{t("Pause", "أوقف")}</button> : null}
        {expert.status === "paused" ? <button className="button button-small button-secondary" type="button" disabled={busy} onClick={() => setStatus("accepted")}>{t("Reactivate", "فعّل")}</button> : null}
      </div>

      <h3>{t("Level and default rates", "المستوى والأسعار الافتراضية")}</h3>
      <div className="kx-grid-3">
        <Field label={t("Level", "المستوى")}>
          <select value={level} onChange={(e) => setLevel(e.target.value as ExpertLevel)}>
            <option value="">{t("Choose…", "اختر…")}</option>
            {LEVELS.map(([v, en, ar]) => <option key={v} value={v}>{t(en, ar)}</option>)}
          </select>
        </Field>
        <Field label={t("Expert pay $/hr", "أجر الخبير $/ساعة")}><input type="number" min={1} step={0.5} value={rates.pay} onChange={(e) => setRates((r) => ({ ...r, pay: e.target.value }))} /></Field>
        <Field label={t("Company price $/hr", "سعر الشركة $/ساعة")} hint={margin != null ? `${t("Margin", "الهامش")}: $${margin.toFixed(2)}` : undefined}><input type="number" min={1} step={0.5} value={rates.price} onChange={(e) => setRates((r) => ({ ...r, price: e.target.value }))} /></Field>
      </div>
      {expert.status === "accepted" ? <button className="button button-small button-secondary" type="button" disabled={busy || !rates.pay || !rates.price} onClick={saveRates}>{t("Save rates", "احفظ الأسعار")}</button> : null}

      <h3>{t("Decision", "القرار")}</h3>
      <Field label={t("Reviewer notes", "ملاحظات المراجع")}><textarea rows={3} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <Notice kind={message?.kind ?? "info"}>{message?.text}</Notice>
      <div className="kx-inline-actions">
        <button className="button button-small" type="button" disabled={busy} onClick={() => decide("accept")}>{t("Accept", "اقبل")}</button>
        <button className="button button-small button-secondary" type="button" disabled={busy} onClick={() => decide("needs_info")}>{t("Needs more info", "يحتاج معلومات")}</button>
        <button className="button button-small button-secondary" type="button" disabled={busy} onClick={() => decide("reject")}>{t("Don't accept", "لا تقبل")}</button>
      </div>

      {reviews.length ? (
        <>
          <h3>{t("Review history", "سجل المراجعات")}</h3>
          <ul className="kx-history">
            {reviews.map((r) => <li key={r.id}><strong>{r.decision}</strong>{r.level ? ` · ${r.level}` : ""} · {formatDate(r.created_at, arabic)}{r.notes ? <p>{r.notes}</p> : null}</li>)}
          </ul>
        </>
      ) : null}
    </div>
  );
}
