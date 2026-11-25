"use client";

import { useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { APPROVED, hoursLabel, money, type Invoice, type Payout, type TimeEntry } from "../lib/kufuo/types";
import { Empty, Notice, Section, Status, errorText, formatDate } from "../_ui/bits";
import { useT } from "../_ui/lang";
import type { AdminData } from "./useAdminData";

type Group = { key: string; name: string; entries: TimeEntry[]; hours: number; amount: number; from: string; to: string };

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 864e5).toISOString();
}

function group(entries: TimeEntry[], keyOf: (e: TimeEntry) => string, nameOf: (key: string) => string, rate: (e: TimeEntry) => number): Group[] {
  const map = new Map<string, Group>();
  for (const entry of entries) {
    const key = keyOf(entry);
    const g = map.get(key) ?? { key, name: nameOf(key), entries: [], hours: 0, amount: 0, from: entry.work_date, to: entry.work_date };
    g.entries.push(entry);
    g.hours += Number(entry.hours);
    g.amount += Number(entry.hours) * rate(entry);
    if (entry.work_date < g.from) g.from = entry.work_date;
    if (entry.work_date > g.to) g.to = entry.work_date;
    map.set(key, g);
  }
  return [...map.values()];
}

export function MoneyTab({ data, reload }: { data: AdminData; reload: () => Promise<void> }) {
  const { t, arabic } = useT();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const bookingCompany = Object.fromEntries(data.bookings.map((b) => [b.id, b.company_id]));
  const companyName = Object.fromEntries(data.companies.map((c) => [c.id, c.name]));
  const expertName = Object.fromEntries(data.experts.map((e) => [e.id, e.full_name]));
  const bookingTitle = Object.fromEntries(data.bookings.map((b) => [b.id, b.title]));

  const approved = data.entries.filter((e) => APPROVED.includes(e.status));
  const toInvoice = useMemo(() => group(approved.filter((e) => !e.invoice_id), (e) => bookingCompany[e.booking_id], (k) => companyName[k] ?? "—", (e) => data.price[e.booking_id] ?? 0), [approved, bookingCompany, companyName, data.price]);
  const toPay = useMemo(() => group(approved.filter((e) => !e.payout_id), (e) => e.expert_id, (k) => expertName[k] ?? "—", (e) => data.pay[e.booking_id] ?? 0), [approved, expertName, data.pay]);
  const disputed = data.entries.filter((e) => e.status === "disputed");

  async function run(action: () => Promise<{ error: unknown }>, success: string) {
    setBusy(true);
    setMessage(null);
    const { error } = await action();
    setBusy(false);
    setMessage(error ? { kind: "error", text: errorText(error) } : { kind: "success", text: success });
    await reload();
  }

  function createInvoice(g: Group) {
    return run(async () => {
      const s = createClient();
      const number = `KUF-${g.to.slice(0, 7).replace("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const created = await s.from("invoices").insert({ company_id: g.key, number, period_start: g.from, period_end: g.to, total_hours: g.hours, amount_usd: Math.round(g.amount * 100) / 100 }).select("id").single();
      if (created.error) return created;
      return s.from("time_entries").update({ invoice_id: created.data.id }).in("id", g.entries.map((e) => e.id));
    }, t("Draft invoice created.", "انشأت مسودة الفاتورة."));
  }

  function createPayout(g: Group) {
    return run(async () => {
      const s = createClient();
      const created = await s.from("payouts").insert({ expert_id: g.key, period_start: g.from, period_end: g.to, total_hours: g.hours, amount_usd: Math.round(g.amount * 100) / 100 }).select("id").single();
      if (created.error) return created;
      return s.from("time_entries").update({ payout_id: created.data.id }).in("id", g.entries.map((e) => e.id));
    }, t("Payout created.", "انشأ الصرف."));
  }

  function setInvoiceStatus(invoice: Invoice, status: Invoice["status"]) {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status };
    if (status === "issued") { patch.issued_at = now; patch.due_at = daysFromNow(14); }
    if (status === "paid") patch.paid_at = now;
    return run(async () => createClient().from("invoices").update(patch).eq("id", invoice.id), t("Invoice updated.", "تم تحديث الفاتورة."));
  }

  function setPayoutStatus(payout: Payout, status: Payout["status"]) {
    const patch: Record<string, unknown> = { status };
    if (status === "sent") patch.paid_at = new Date().toISOString();
    return run(async () => createClient().from("payouts").update(patch).eq("id", payout.id), t("Payout updated.", "تم تحديث الصرف."));
  }

  function resolve(entry: TimeEntry, status: "approved" | "rejected") {
    return run(async () => createClient().from("time_entries").update({ status }).eq("id", entry.id), t("Dispute resolved.", "انحل الاعتراض."));
  }

  return (
    <div className="kx-stack">
      <Notice kind={message?.kind ?? "info"}>{message?.text}</Notice>

      {disputed.length ? (
        <Section title={t("Disputed hours", "ساعات معترض عليها")}>
          <div className="kx-table-wrap">
            <table className="kx-table">
              <thead><tr><th>{t("Date", "التاريخ")}</th><th>{t("Expert", "الخبير")}</th><th>{t("Booking", "الحجز")}</th><th>{t("Hours", "الساعات")}</th><th>{t("Work / reason", "الشغل / السبب")}</th><th /></tr></thead>
              <tbody>
                {disputed.map((e) => (
                  <tr key={e.id}>
                    <td>{formatDate(e.work_date, arabic)}</td>
                    <td>{expertName[e.expert_id]}</td>
                    <td>{bookingTitle[e.booking_id]}</td>
                    <td>{hoursLabel(e.hours)}</td>
                    <td>{e.description}<small className="kx-dispute">{e.dispute_reason}</small></td>
                    <td className="kx-inline-actions">
                      <button className="kx-link" type="button" disabled={busy} onClick={() => resolve(e, "approved")}>{t("Approve", "اعتمد")}</button>
                      <button className="kx-link" type="button" disabled={busy} onClick={() => resolve(e, "rejected")}>{t("Reject", "ارفض")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      <Section title={t("Approved hours not yet invoiced", "ساعات معتمدة ما انفوترت")}>
        {toInvoice.length ? <GroupTable groups={toInvoice} action={t("Create invoice", "أنشئ فاتورة")} busy={busy} onAction={createInvoice} /> : <Empty title={t("Nothing to invoice", "ما فيه شي للفوترة")} />}
      </Section>

      <Section title={t("Approved hours not yet paid to experts", "ساعات معتمدة ما انصرفت للخبراء")}>
        {toPay.length ? <GroupTable groups={toPay} action={t("Create payout", "أنشئ صرف")} busy={busy} onAction={createPayout} /> : <Empty title={t("Nothing to pay", "ما فيه مستحقات")} />}
        <p className="kx-muted">{t("Pay experts only after the company's invoice is paid, unless the company paid in advance.", "اصرف للخبير بعد ما تدفع الشركة فاتورتها، إلا إذا الشركة دافعة مقدمًا.")}</p>
      </Section>

      <Section title={t("Invoices", "الفواتير")}>
        {data.invoices.length ? (
          <div className="kx-table-wrap">
            <table className="kx-table">
              <thead><tr><th>{t("Number", "الرقم")}</th><th>{t("Company", "الشركة")}</th><th>{t("Period", "الفترة")}</th><th>{t("Hours", "الساعات")}</th><th>{t("Amount", "المبلغ")}</th><th>{t("Status", "الحالة")}</th><th /></tr></thead>
              <tbody>
                {data.invoices.map((i) => (
                  <tr key={i.id}>
                    <td>{i.number}</td>
                    <td>{companyName[i.company_id]}</td>
                    <td>{formatDate(i.period_start, arabic)} – {formatDate(i.period_end, arabic)}</td>
                    <td>{hoursLabel(i.total_hours)}</td>
                    <td>{money(i.amount_usd)}</td>
                    <td><Status value={i.status} /></td>
                    <td className="kx-inline-actions">
                      {i.status === "draft" ? <button className="kx-link" type="button" disabled={busy} onClick={() => setInvoiceStatus(i, "issued")}>{t("Mark issued", "صدرت")}</button> : null}
                      {i.status === "issued" ? <button className="kx-link" type="button" disabled={busy} onClick={() => setInvoiceStatus(i, "paid")}>{t("Mark paid", "انْدفعت")}</button> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title={t("No invoices yet", "ما فيه فواتير")} />}
      </Section>

      <Section title={t("Payouts", "الصرف للخبراء")}>
        {data.payouts.length ? (
          <div className="kx-table-wrap">
            <table className="kx-table">
              <thead><tr><th>{t("Expert", "الخبير")}</th><th>{t("Period", "الفترة")}</th><th>{t("Hours", "الساعات")}</th><th>{t("Amount", "المبلغ")}</th><th>{t("Status", "الحالة")}</th><th /></tr></thead>
              <tbody>
                {data.payouts.map((p) => (
                  <tr key={p.id}>
                    <td>{expertName[p.expert_id]}</td>
                    <td>{formatDate(p.period_start, arabic)} – {formatDate(p.period_end, arabic)}</td>
                    <td>{hoursLabel(p.total_hours)}</td>
                    <td>{money(p.amount_usd)}</td>
                    <td><Status value={p.status} /></td>
                    <td>{p.status === "pending" ? <button className="kx-link" type="button" disabled={busy} onClick={() => setPayoutStatus(p, "sent")}>{t("Mark sent", "انرسل")}</button> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title={t("No payouts yet", "ما فيه صرف")} />}
      </Section>
    </div>
  );
}

function GroupTable({ groups, action, busy, onAction }: { groups: Group[]; action: string; busy: boolean; onAction: (g: Group) => void }) {
  const { t, arabic } = useT();
  return (
    <div className="kx-table-wrap">
      <table className="kx-table">
        <thead><tr><th>{t("Name", "الاسم")}</th><th>{t("Period", "الفترة")}</th><th>{t("Entries", "السجلات")}</th><th>{t("Hours", "الساعات")}</th><th>{t("Amount", "المبلغ")}</th><th /></tr></thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.key}>
              <td>{g.name}</td>
              <td>{formatDate(g.from, arabic)} – {formatDate(g.to, arabic)}</td>
              <td>{g.entries.length}</td>
              <td>{hoursLabel(g.hours)}</td>
              <td>{money(g.amount)}</td>
              <td><button className="button button-small" type="button" disabled={busy} onClick={() => onAction(g)}>{action}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
