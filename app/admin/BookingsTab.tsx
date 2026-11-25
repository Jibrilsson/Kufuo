"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { APPROVED, hoursLabel, money } from "../lib/kufuo/types";
import { Empty, Field, Notice, Status, errorText, formatDate } from "../_ui/bits";
import { useT } from "../_ui/lang";
import type { AdminData } from "./useAdminData";

export type BookingDraft = { companyId?: string; expertId?: string; requestId?: string; title?: string; price?: number; pay?: number; weekly?: number };

export function BookingForm({ data, adminId, draft, onDone, onCancel }: { data: AdminData; adminId: string; draft?: BookingDraft; onDone: () => void; onCancel?: () => void }) {
  const { t } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    company_id: draft?.companyId ?? "",
    expert_id: draft?.expertId ?? "",
    title: draft?.title ?? "",
    price: draft?.price?.toString() ?? "",
    pay: draft?.pay?.toString() ?? "",
    weekly: draft?.weekly?.toString() ?? "",
    total: "",
    starts_on: today,
    ends_on: "",
    window: "7",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const accepted = data.experts.filter((e) => e.status === "accepted");
  const margin = form.price && form.pay ? Number(form.price) - Number(form.pay) : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Number(form.pay) >= Number(form.price)) return setError(t("Expert pay must be lower than the company price.", "أجر الخبير لازم يكون أقل من سعر الشركة."));
    setBusy(true);
    setError("");
    const s = createClient();
    const created = await s.from("bookings").insert({
      company_id: form.company_id,
      expert_id: form.expert_id,
      request_id: draft?.requestId ?? null,
      title: form.title.trim(),
      weekly_hours_cap: form.weekly ? Number(form.weekly) : null,
      total_hours_cap: form.total ? Number(form.total) : null,
      starts_on: form.starts_on,
      ends_on: form.ends_on || null,
      approval_window_days: Number(form.window),
      created_by: adminId,
    }).select("id").single();
    if (created.error) { setBusy(false); return setError(errorText(created.error)); }
    const id = created.data.id as string;
    const [price, pay] = await Promise.all([
      s.from("booking_company_terms").insert({ booking_id: id, hourly_price_usd: Number(form.price) }),
      s.from("booking_expert_terms").insert({ booking_id: id, hourly_pay_usd: Number(form.pay) }),
    ]);
    if (draft?.requestId) {
      await s.from("request_candidates").update({ status: "booked" }).eq("request_id", draft.requestId).eq("expert_id", form.expert_id);
      await s.from("company_requests").update({ status: "filled" }).eq("id", draft.requestId);
    }
    setBusy(false);
    if (price.error || pay.error) return setError(errorText(price.error ?? pay.error));
    onDone();
  }

  return (
    <form className="kx-card kx-form" onSubmit={submit}>
      <h3>{t("New booking (sent to the expert as an offer)", "حجز جديد (يوصل للخبير كعرض)")}</h3>
      <div className="kx-grid-3">
        <Field label={t("Company", "الشركة")}>
          <select required value={form.company_id} onChange={(e) => set("company_id", e.target.value)}>
            <option value="">{t("Choose…", "اختر…")}</option>
            {data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label={t("Expert", "الخبير")}>
          <select required value={form.expert_id} onChange={(e) => set("expert_id", e.target.value)}>
            <option value="">{t("Choose…", "اختر…")}</option>
            {accepted.map((x) => <option key={x.id} value={x.id}>{x.full_name}</option>)}
          </select>
        </Field>
        <Field label={t("Title", "العنوان")}><input required minLength={2} maxLength={160} value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label={t("Company price $/hr", "سعر الشركة $/ساعة")}><input required type="number" min={1} step={0.5} value={form.price} onChange={(e) => set("price", e.target.value)} /></Field>
        <Field label={t("Expert pay $/hr", "أجر الخبير $/ساعة")} hint={margin != null ? `${t("Margin", "الهامش")}: $${margin.toFixed(2)}/${t("hr", "ساعة")}` : undefined}><input required type="number" min={1} step={0.5} value={form.pay} onChange={(e) => set("pay", e.target.value)} /></Field>
        <Field label={t("Approval window (days)", "مهلة الاعتماد (أيام)")}><input required type="number" min={1} max={30} value={form.window} onChange={(e) => set("window", e.target.value)} /></Field>
        <Field label={t("Weekly hours cap", "حد الساعات الأسبوعي")}><input type="number" min={1} step={0.5} value={form.weekly} onChange={(e) => set("weekly", e.target.value)} /></Field>
        <Field label={t("Total hours cap", "حد الساعات الإجمالي")}><input type="number" min={1} step={0.5} value={form.total} onChange={(e) => set("total", e.target.value)} /></Field>
        <div />
        <Field label={t("Starts", "البداية")}><input required type="date" value={form.starts_on} onChange={(e) => set("starts_on", e.target.value)} /></Field>
        <Field label={t("Ends (optional)", "النهاية (اختياري)")}><input type="date" min={form.starts_on} value={form.ends_on} onChange={(e) => set("ends_on", e.target.value)} /></Field>
      </div>
      <Notice kind="error">{error}</Notice>
      <div className="kx-inline-actions">
        <button className="button" type="submit" disabled={busy}>{busy ? t("Creating…", "جاري الإنشاء…") : t("Create booking", "أنشئ الحجز")}</button>
        {onCancel ? <button className="kx-link" type="button" onClick={onCancel}>{t("Cancel", "إلغاء")}</button> : null}
      </div>
    </form>
  );
}

export function BookingsTab({ data, adminId, reload }: { data: AdminData; adminId: string; reload: () => Promise<void> }) {
  const { t, arabic } = useT();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const companies = Object.fromEntries(data.companies.map((c) => [c.id, c.name]));
  const experts = Object.fromEntries(data.experts.map((e) => [e.id, e.full_name]));

  async function setStatus(id: string, status: "ended" | "cancelled") {
    const { error: e } = await createClient().from("bookings").update({ status }).eq("id", id);
    setError(e ? errorText(e) : "");
    await reload();
  }

  return (
    <div className="kx-stack">
      {creating ? (
        <BookingForm data={data} adminId={adminId} onDone={() => { setCreating(false); void reload(); }} onCancel={() => setCreating(false)} />
      ) : (
        <div><button className="button button-lime" type="button" onClick={() => setCreating(true)}>{t("New booking", "حجز جديد")}</button></div>
      )}
      <Notice kind="error">{error}</Notice>
      {data.bookings.length ? (
        <div className="kx-table-wrap">
          <table className="kx-table">
            <thead><tr><th>{t("Booking", "الحجز")}</th><th>{t("Company", "الشركة")}</th><th>{t("Expert", "الخبير")}</th><th>{t("Price / pay", "السعر / الأجر")}</th><th>{t("Approved hrs", "ساعات معتمدة")}</th><th>{t("Margin earned", "الهامش المحقق")}</th><th>{t("Dates", "المدة")}</th><th>{t("Status", "الحالة")}</th><th /></tr></thead>
            <tbody>
              {data.bookings.map((b) => {
                const hours = data.entries.filter((e) => e.booking_id === b.id && APPROVED.includes(e.status)).reduce((s, e) => s + Number(e.hours), 0);
                const margin = hours * ((data.price[b.id] ?? 0) - (data.pay[b.id] ?? 0));
                return (
                  <tr key={b.id}>
                    <td>{b.title}</td>
                    <td>{companies[b.company_id] ?? "—"}</td>
                    <td>{experts[b.expert_id] ?? "—"}</td>
                    <td>{money(data.price[b.id])} / {money(data.pay[b.id])}</td>
                    <td>{hoursLabel(hours)}</td>
                    <td>{money(margin)}</td>
                    <td>{formatDate(b.starts_on, arabic)} – {formatDate(b.ends_on, arabic)}</td>
                    <td><Status value={b.status} /></td>
                    <td>
                      {b.status === "active" ? <button className="kx-link" type="button" onClick={() => setStatus(b.id, "ended")}>{t("End", "أنهِ")}</button> : null}
                      {b.status === "offered" ? <button className="kx-link" type="button" onClick={() => setStatus(b.id, "cancelled")}>{t("Withdraw", "اسحب")}</button> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <Empty title={t("No bookings yet", "ما فيه حجوزات")} />}
    </div>
  );
}
