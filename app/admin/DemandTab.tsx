"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { money, specialtyLabel, type CompanyRequest, type Lead } from "../lib/kufuo/types";
import { Empty, Field, Notice, Section, Status, errorText, formatDate } from "../_ui/bits";
import { useT } from "../_ui/lang";
import { BookingForm, type BookingDraft } from "./BookingsTab";
import type { AdminData } from "./useAdminData";

export function DemandTab({ data, adminId, reload }: { data: AdminData; adminId: string; reload: () => Promise<void> }) {
  const { t } = useT();
  return (
    <div className="kx-stack">
      <Section title={t("Company requests", "طلبات الشركات")}>
        {data.requests.length ? (
          <div className="kx-list">
            {data.requests.map((r) => <RequestAdminCard key={r.id} request={r} data={data} adminId={adminId} reload={reload} />)}
          </div>
        ) : <Empty title={t("No requests yet", "ما فيه طلبات")} />}
      </Section>
      <Section title={t("Leads from the website", "عملاء من الموقع")}>
        <LeadsTable leads={data.leads} reload={reload} />
      </Section>
    </div>
  );
}

function RequestAdminCard({ request, data, adminId, reload }: { request: CompanyRequest; data: AdminData; adminId: string; reload: () => Promise<void> }) {
  const { t, arabic } = useT();
  const [expertId, setExpertId] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingDraft | null>(null);
  const company = data.companies.find((c) => c.id === request.company_id);
  const candidates = data.candidates.filter((c) => c.request_id === request.id);
  const taken = new Set(candidates.map((c) => c.expert_id));
  const pool = data.experts.filter((e) => e.status === "accepted" && !taken.has(e.id));
  const sorted = [...pool].sort((a, b) => Number(b.primary_specialty === request.specialty) - Number(a.primary_specialty === request.specialty));
  const names = Object.fromEntries(data.experts.map((e) => [e.id, e.full_name]));

  async function propose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const s = createClient();
    const { error: e } = await s.from("request_candidates").insert({ request_id: request.id, expert_id: expertId, hourly_price_usd: price ? Number(price) : null, kufuo_note: note.trim() || null, proposed_by: adminId });
    if (e) return setError(errorText(e));
    if (request.status === "open") await s.from("company_requests").update({ status: "matching" }).eq("id", request.id);
    setExpertId(""); setPrice(""); setNote(""); setError("");
    await reload();
  }

  async function prefillPrice(id: string) {
    setExpertId(id);
    const { data: rate } = await createClient().from("expert_rates").select("default_hourly_price_usd").eq("expert_id", id).maybeSingle();
    if (rate) setPrice(String(rate.default_hourly_price_usd));
  }

  async function startBooking(candidateExpertId: string, candidatePrice: number | null) {
    const { data: rate } = await createClient().from("expert_rates").select("*").eq("expert_id", candidateExpertId).maybeSingle();
    setBooking({
      companyId: request.company_id,
      expertId: candidateExpertId,
      requestId: request.id,
      title: specialtyLabel(request.specialty, false),
      price: candidatePrice ?? rate?.default_hourly_price_usd,
      pay: rate?.default_hourly_pay_usd,
      weekly: request.weekly_hours ?? undefined,
    });
  }

  return (
    <div className="kx-card">
      <div className="kx-card-head">
        <div>
          <strong>{company?.name ?? "—"} · {specialtyLabel(request.specialty, arabic)}</strong>
          <p className="kx-muted">{request.language.toUpperCase()} · {request.weekly_hours ?? "—"} {t("hrs/week", "ساعة/أسبوع")} · {request.duration_weeks ?? "—"} {t("weeks", "أسابيع")} · {formatDate(request.created_at, arabic)}</p>
        </div>
        <Status value={request.status} />
      </div>
      <p>{request.description}</p>
      {candidates.length ? (
        <ul className="kx-history">
          {candidates.map((c) => (
            <li key={c.expert_id}>
              <strong>{names[c.expert_id] ?? "—"}</strong> · {c.hourly_price_usd ? money(c.hourly_price_usd) : "—"} · <Status value={c.status} />
              {c.status === "shortlisted" || c.status === "proposed" ? <button className="kx-link" type="button" onClick={() => startBooking(c.expert_id, c.hourly_price_usd)}>{t("Create booking", "أنشئ حجز")}</button> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {booking ? <BookingForm data={data} adminId={adminId} draft={booking} onDone={() => { setBooking(null); void reload(); }} onCancel={() => setBooking(null)} /> : null}
      {request.status !== "closed" && request.status !== "filled" ? (
        <form className="kx-propose" onSubmit={propose}>
          <Field label={t("Propose an expert", "رشّح خبير")}>
            <select required value={expertId} onChange={(e) => prefillPrice(e.target.value)}>
              <option value="">{pool.length ? t("Choose…", "اختر…") : t("No accepted experts available", "ما فيه خبراء مقبولين")}</option>
              {sorted.map((e) => <option key={e.id} value={e.id}>{e.full_name} · {specialtyLabel(e.primary_specialty, arabic)}{e.level ? ` · ${e.level}` : ""}</option>)}
            </select>
          </Field>
          <Field label={t("Price shown to company $/hr", "السعر للشركة $/ساعة")}><input type="number" min={1} step={0.5} value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
          <Field label={t("Note to the company", "ملاحظة للشركة")}><input maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <button className="button button-small" type="submit">{t("Propose", "رشّح")}</button>
        </form>
      ) : null}
      <Notice kind="error">{error}</Notice>
    </div>
  );
}

function LeadsTable({ leads, reload }: { leads: Lead[]; reload: () => Promise<void> }) {
  const { t, arabic } = useT();
  const [error, setError] = useState("");
  if (!leads.length) return <Empty title={t("No leads yet", "ما فيه عملاء")}>{t("Requests from the public “Request an expert” form show up here.", "تظهر هنا الطلبات من نموذج «اطلب خبير» في الموقع.")}</Empty>;

  async function setStatus(id: string, status: Lead["status"]) {
    const { error: e } = await createClient().from("company_leads").update({ status }).eq("id", id);
    setError(e ? errorText(e) : "");
    await reload();
  }

  return (
    <>
      <Notice kind="error">{error}</Notice>
      <div className="kx-table-wrap">
        <table className="kx-table">
          <thead><tr><th>{t("Date", "التاريخ")}</th><th>{t("Company", "الشركة")}</th><th>{t("Contact", "التواصل")}</th><th>{t("Need", "الاحتياج")}</th><th>{t("Status", "الحالة")}</th></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{formatDate(l.created_at, arabic)}</td>
                <td>{l.company_name}</td>
                <td>{l.contact_name}<br /><a href={`mailto:${l.email}`}>{l.email}</a></td>
                <td>{l.specialty ? <strong>{specialtyLabel(l.specialty, arabic)}: </strong> : null}{l.need}</td>
                <td>
                  <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value as Lead["status"])}>
                    <option value="new">{t("New", "جديد")}</option>
                    <option value="contacted">{t("Contacted", "تم التواصل")}</option>
                    <option value="converted">{t("Converted", "تحوّل لعميل")}</option>
                    <option value="closed">{t("Closed", "مغلق")}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
