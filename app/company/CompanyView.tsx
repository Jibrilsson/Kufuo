"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import {
  APPROVED, SPECIALTIES, hoursLabel, money, specialtyLabel,
  type Booking, type Candidate, type Company, type CompanyRequest, type Expert, type Invoice, type TimeEntry,
} from "../lib/kufuo/types";
import { Empty, Field, Notice, Section, Stat, Status, errorText, formatDate } from "../_ui/bits";
import { useT } from "../_ui/lang";

type Data = {
  requests: CompanyRequest[];
  candidates: Candidate[];
  experts: Record<string, Expert>;
  bookings: Booking[];
  price: Record<string, number>;
  entries: TimeEntry[];
  invoices: Invoice[];
};

const EMPTY: Data = { requests: [], candidates: [], experts: {}, bookings: [], price: {}, entries: [], invoices: [] };

export function CompanyView({ company, userId }: { company: Company; userId: string }) {
  const { t } = useT();
  const [data, setData] = useState<Data>(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [requests, candidates, bookings, terms, entries, invoices] = await Promise.all([
      supabase.from("company_requests").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
      supabase.from("request_candidates").select("*").order("created_at"),
      supabase.from("bookings").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
      supabase.from("booking_company_terms").select("booking_id, hourly_price_usd"),
      supabase.from("time_entries").select("*").order("work_date", { ascending: false }),
      supabase.from("invoices").select("*").eq("company_id", company.id).order("period_start", { ascending: false }),
    ]);
    const experts = await supabase.from("experts").select("*");
    const firstError = requests.error ?? candidates.error ?? bookings.error ?? terms.error ?? entries.error ?? invoices.error ?? experts.error;
    setError(firstError ? errorText(firstError) : "");
    setData({
      requests: (requests.data ?? []) as CompanyRequest[],
      candidates: (candidates.data ?? []) as Candidate[],
      experts: Object.fromEntries(((experts.data ?? []) as Expert[]).map((e) => [e.id, e])),
      bookings: (bookings.data ?? []) as Booking[],
      price: Object.fromEntries((terms.data ?? []).map((r: { booking_id: string; hourly_price_usd: number }) => [r.booking_id, Number(r.hourly_price_usd)])),
      entries: (entries.data ?? []) as TimeEntry[],
      invoices: (invoices.data ?? []) as Invoice[],
    });
    setLoading(false);
  }, [company.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    void load();
  }, [load]);

  const totals = useMemo(() => {
    let approvedHours = 0;
    let approvedCost = 0;
    let pending = 0;
    for (const entry of data.entries) {
      if (APPROVED.includes(entry.status)) {
        approvedHours += Number(entry.hours);
        approvedCost += Number(entry.hours) * (data.price[entry.booking_id] ?? 0);
      } else if (entry.status === "submitted") pending += 1;
    }
    return { approvedHours, approvedCost, pending, active: data.bookings.filter((b) => b.status === "active").length };
  }, [data]);

  const pendingEntries = data.entries.filter((e) => e.status === "submitted");

  return (
    <div className="kx-page">
      <div className="kx-page-head">
        <div>
          <p className="kx-kicker">{t("Company", "الشركة")}</p>
          <h1 className="kx-title">{company.name}</h1>
        </div>
        <button className="button button-lime" type="button" onClick={() => setShowForm((v) => !v)}><Plus size={17} />{t("Request an expert", "اطلب خبير")}</button>
      </div>
      <Notice kind="error">{error}</Notice>
      {loading ? <p className="kx-muted" aria-busy="true">{t("Loading…", "جاري التحميل…")}</p> : null}

      <div className="kx-stats">
        <Stat label={t("Active bookings", "حجوزات فعّالة")} value={String(totals.active)} />
        <Stat label={t("Hours waiting for you", "ساعات تنتظر اعتمادك")} value={String(totals.pending)} />
        <Stat label={t("Approved hours", "ساعات معتمدة")} value={hoursLabel(totals.approvedHours)} />
        <Stat label={t("Approved cost", "تكلفة معتمدة")} value={money(totals.approvedCost)} />
      </div>

      {showForm ? <RequestForm companyId={company.id} userId={userId} onDone={() => { setShowForm(false); void load(); }} /> : null}

      {pendingEntries.length ? (
        <Section title={t("Hours to approve", "ساعات تحتاج اعتماد")}>
          <ApproveHours entries={pendingEntries} bookings={data.bookings} experts={data.experts} price={data.price} onDone={load} />
        </Section>
      ) : null}

      <Section title={t("Your requests", "طلباتك")}>
        {loading ? null : data.requests.length ? (
          <div className="kx-list">
            {data.requests.map((request) => (
              <RequestCard key={request.id} request={request} candidates={data.candidates.filter((c) => c.request_id === request.id)} experts={data.experts} onDone={load} />
            ))}
          </div>
        ) : (
          <Empty title={t("No requests yet", "ما عندك طلبات")}>
            {t("Tell us the specialty, language and hours you need. We'll propose vetted experts, usually within a few days.", "حدّد التخصص واللغة والساعات اللي تحتاجها، ونرشّح لك خبراء موثّقين خلال أيام.")}
          </Empty>
        )}
      </Section>

      {data.bookings.length ? (
        <Section title={t("Bookings", "الحجوزات")}>
          <BookingsTable bookings={data.bookings} experts={data.experts} price={data.price} entries={data.entries} />
        </Section>
      ) : null}

      {data.invoices.length ? (
        <Section title={t("Invoices", "الفواتير")}>
          <InvoicesTable invoices={data.invoices} />
        </Section>
      ) : null}
    </div>
  );
}

function RequestForm({ companyId, userId, onDone }: { companyId: string; userId: string; onDone: () => void }) {
  const { t, arabic } = useT();
  const [form, setForm] = useState({ specialty: "", language: "ar", weekly_hours: "", duration_weeks: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const { error: insertError } = await createClient().from("company_requests").insert({
      company_id: companyId,
      created_by: userId,
      specialty: form.specialty,
      language: form.language,
      weekly_hours: form.weekly_hours ? Number(form.weekly_hours) : null,
      duration_weeks: form.duration_weeks ? Number(form.duration_weeks) : null,
      description: form.description.trim(),
    });
    setBusy(false);
    if (insertError) return setError(errorText(insertError));
    onDone();
  }

  return (
    <form className="kx-card kx-form" onSubmit={submit}>
      <h2>{t("What expertise do you need?", "وش الخبرة اللي تحتاجها؟")}</h2>
      <div className="kx-grid-4">
        <Field label={t("Specialty", "التخصص")}>
          <select required value={form.specialty} onChange={(e) => set("specialty", e.target.value)}>
            <option value="">{t("Choose…", "اختر…")}</option>
            {SPECIALTIES.map(([v, en, ar]) => <option key={v} value={v}>{arabic ? ar : en}</option>)}
          </select>
        </Field>
        <Field label={t("Language", "اللغة")}>
          <select value={form.language} onChange={(e) => set("language", e.target.value)}>
            <option value="ar">{t("Arabic", "العربية")}</option>
            <option value="ar_en">{t("Arabic + English", "العربية والإنجليزية")}</option>
            <option value="en">{t("English", "الإنجليزية")}</option>
          </select>
        </Field>
        <Field label={t("Hours per week", "ساعات أسبوعيًا")}>
          <input type="number" min={1} max={80} value={form.weekly_hours} onChange={(e) => set("weekly_hours", e.target.value)} />
        </Field>
        <Field label={t("For how many weeks", "لكم أسبوع")}>
          <input type="number" min={1} max={104} value={form.duration_weeks} onChange={(e) => set("duration_weeks", e.target.value)} />
        </Field>
      </div>
      <Field label={t("Describe the work", "وصف الشغل")} hint={t("What will the expert do? What does a great fit look like?", "وش بيسوي الخبير؟ ووش مواصفات الشخص المناسب؟")}>
        <textarea required minLength={10} maxLength={4000} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <Notice kind="error">{error}</Notice>
      <div className="kx-actions"><button className="button" type="submit" disabled={busy}>{busy ? t("Sending…", "جاري الإرسال…") : t("Send request", "أرسل الطلب")}</button></div>
    </form>
  );
}

function RequestCard({ request, candidates, experts, onDone }: { request: CompanyRequest; candidates: Candidate[]; experts: Record<string, Expert>; onDone: () => void }) {
  const { t, arabic } = useT();
  const [error, setError] = useState("");

  async function respond(expertId: string, status: "shortlisted" | "declined_by_company") {
    const { error: e } = await createClient().from("request_candidates").update({ status }).eq("request_id", request.id).eq("expert_id", expertId);
    if (e) setError(errorText(e));
    onDone();
  }

  async function close() {
    const { error: e } = await createClient().from("company_requests").update({ status: "closed" }).eq("id", request.id);
    if (e) setError(errorText(e));
    onDone();
  }

  return (
    <div className="kx-card">
      <div className="kx-card-head">
        <div>
          <strong>{specialtyLabel(request.specialty, arabic)}</strong>
          <p className="kx-muted">
            {request.weekly_hours ? `${request.weekly_hours} ${t("hrs/week", "ساعة/أسبوع")} · ` : ""}
            {request.duration_weeks ? `${request.duration_weeks} ${t("weeks", "أسابيع")} · ` : ""}
            {formatDate(request.created_at, arabic)}
          </p>
        </div>
        <div className="kx-inline-actions">
          <Status value={request.status} />
          {request.status !== "closed" ? <button className="kx-link" type="button" onClick={close}>{t("Close", "أغلق")}</button> : null}
        </div>
      </div>
      <p>{request.description}</p>
      <Notice kind="error">{error}</Notice>
      {candidates.length ? (
        <div className="kx-candidates">
          <h3>{t("Proposed experts", "الخبراء المرشحون")}</h3>
          {candidates.map((c) => {
            const expert = experts[c.expert_id];
            return (
              <div key={c.expert_id} className="kx-candidate">
                <div>
                  <strong>{expert?.full_name ?? t("Expert", "خبير")}</strong>
                  <span className="kx-muted">{expert?.headline ?? specialtyLabel(expert?.primary_specialty, arabic)}</span>
                  {expert?.years_experience != null ? <span className="kx-muted">{expert.years_experience} {t("years experience", "سنة خبرة")}{expert.level ? ` · ${expert.level}` : ""}</span> : null}
                  {c.kufuo_note ? <p className="kx-note">{t("Kufuo: ", "كفو: ")}{c.kufuo_note}</p> : null}
                </div>
                <div className="kx-candidate-side">
                  {c.hourly_price_usd ? <strong>{money(c.hourly_price_usd)}/{t("hr", "ساعة")}</strong> : null}
                  <Status value={c.status} />
                  {c.status === "proposed" ? (
                    <div className="kx-inline-actions">
                      <button className="button button-small" type="button" onClick={() => respond(c.expert_id, "shortlisted")}><Check size={15} />{t("Shortlist", "أضف للقائمة")}</button>
                      <button className="button button-small button-secondary" type="button" onClick={() => respond(c.expert_id, "declined_by_company")}><X size={15} />{t("Pass", "لا")}</button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : request.status !== "closed" ? (
        <p className="kx-muted">{t("We're finding experts for this request.", "نبحث عن خبراء لهذا الطلب.")}</p>
      ) : null}
    </div>
  );
}

function ApproveHours({ entries, bookings, experts, price, onDone }: { entries: TimeEntry[]; bookings: Booking[]; experts: Record<string, Expert>; price: Record<string, number>; onDone: () => void }) {
  const { t, arabic } = useT();
  const titles = Object.fromEntries(bookings.map((b) => [b.id, b.title]));
  const [error, setError] = useState("");
  const [disputing, setDisputing] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function approve(id: string) {
    const { error: e } = await createClient().from("time_entries").update({ status: "approved" }).eq("id", id);
    setError(e ? errorText(e) : "");
    onDone();
  }

  async function dispute(id: string) {
    if (!reason.trim()) return setError(t("Add a reason so the expert knows what to fix.", "اكتب السبب عشان الخبير يعرف وش يعدّل."));
    const { error: e } = await createClient().from("time_entries").update({ status: "disputed", dispute_reason: reason.trim() }).eq("id", id);
    setError(e ? errorText(e) : "");
    setDisputing(null);
    setReason("");
    onDone();
  }

  return (
    <>
      <p className="kx-muted">{t("Hours you don't answer within the booking's approval window are approved automatically.", "الساعات اللي ما ترد عليها خلال مهلة الاعتماد تنعتمد تلقائيًا.")}</p>
      <Notice kind="error">{error}</Notice>
      <div className="kx-table-wrap">
        <table className="kx-table">
          <thead><tr><th>{t("Date", "التاريخ")}</th><th>{t("Expert", "الخبير")}</th><th>{t("Booking", "الحجز")}</th><th>{t("Hours", "الساعات")}</th><th>{t("Cost", "التكلفة")}</th><th>{t("Work", "الشغل")}</th><th /></tr></thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{formatDate(entry.work_date, arabic)}</td>
                <td>{experts[entry.expert_id]?.full_name ?? "—"}</td>
                <td>{titles[entry.booking_id] ?? "—"}</td>
                <td>{hoursLabel(entry.hours)}</td>
                <td>{money(Number(entry.hours) * (price[entry.booking_id] ?? 0))}</td>
                <td>{entry.description}</td>
                <td>
                  {disputing === entry.id ? (
                    <div className="kx-dispute-form">
                      <input autoFocus placeholder={t("Reason", "السبب")} value={reason} onChange={(e) => setReason(e.target.value)} />
                      <button className="button button-small" type="button" onClick={() => dispute(entry.id)}>{t("Send", "أرسل")}</button>
                      <button className="kx-link" type="button" onClick={() => setDisputing(null)}>{t("Cancel", "إلغاء")}</button>
                    </div>
                  ) : (
                    <div className="kx-inline-actions">
                      <button className="button button-small" type="button" onClick={() => approve(entry.id)}><Check size={15} />{t("Approve", "اعتمد")}</button>
                      <button className="kx-link" type="button" onClick={() => { setDisputing(entry.id); setReason(""); }}>{t("Dispute", "اعترض")}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BookingsTable({ bookings, experts, price, entries }: { bookings: Booking[]; experts: Record<string, Expert>; price: Record<string, number>; entries: TimeEntry[] }) {
  const { t, arabic } = useT();
  return (
    <div className="kx-table-wrap">
      <table className="kx-table">
        <thead><tr><th>{t("Booking", "الحجز")}</th><th>{t("Expert", "الخبير")}</th><th>{t("Rate", "السعر")}</th><th>{t("Approved hours", "ساعات معتمدة")}</th><th>{t("Dates", "المدة")}</th><th>{t("Status", "الحالة")}</th></tr></thead>
        <tbody>
          {bookings.map((b) => {
            const approved = entries.filter((e) => e.booking_id === b.id && APPROVED.includes(e.status)).reduce((s, e) => s + Number(e.hours), 0);
            return (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{experts[b.expert_id]?.full_name ?? "—"}</td>
                <td>{price[b.id] ? `${money(price[b.id])}/${t("hr", "ساعة")}` : "—"}</td>
                <td>{hoursLabel(approved)}{b.total_hours_cap ? ` / ${hoursLabel(b.total_hours_cap)}` : ""}</td>
                <td>{formatDate(b.starts_on, arabic)} – {formatDate(b.ends_on, arabic)}</td>
                <td><Status value={b.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const { t, arabic } = useT();
  return (
    <div className="kx-table-wrap">
      <table className="kx-table">
        <thead><tr><th>{t("Invoice", "الفاتورة")}</th><th>{t("Period", "الفترة")}</th><th>{t("Hours", "الساعات")}</th><th>{t("Amount", "المبلغ")}</th><th>{t("Status", "الحالة")}</th></tr></thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id}>
              <td>{i.number ?? "—"}</td>
              <td>{formatDate(i.period_start, arabic)} – {formatDate(i.period_end, arabic)}</td>
              <td>{hoursLabel(i.total_hours)}</td>
              <td>{money(i.amount_usd)}</td>
              <td><Status value={i.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
