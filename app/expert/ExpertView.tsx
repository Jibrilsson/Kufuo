"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clock3, X } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { APPROVED, hoursLabel, money, specialtyLabel, type Booking, type Expert, type Interview, type Payout, type TimeEntry } from "../lib/kufuo/types";
import { Empty, Field, Notice, Section, Stat, Status, errorText, formatDate } from "../_ui/bits";
import { useT } from "../_ui/lang";

const STEPS = ["submitted", "interviewing", "under_review", "accepted"] as const;

export function ExpertView({ expert }: { expert: Expert }) {
  const { t, arabic } = useT();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pay, setPay] = useState<Record<string, number>>({});
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const [b, terms, e, p, i] = await Promise.all([
      supabase.from("bookings").select("*").eq("expert_id", expert.id).order("created_at", { ascending: false }),
      supabase.from("booking_expert_terms").select("booking_id, hourly_pay_usd"),
      supabase.from("time_entries").select("*").eq("expert_id", expert.id).order("work_date", { ascending: false }),
      supabase.from("payouts").select("*").eq("expert_id", expert.id).order("period_start", { ascending: false }),
      supabase.from("interviews").select("id, expert_id, language, specialty, status, attempt, completed_at, created_at").eq("expert_id", expert.id).order("created_at", { ascending: false }),
    ]);
    const firstError = b.error ?? terms.error ?? e.error ?? p.error ?? i.error;
    if (firstError) setError(errorText(firstError));
    setBookings((b.data ?? []) as Booking[]);
    setPay(Object.fromEntries((terms.data ?? []).map((row: { booking_id: string; hourly_pay_usd: number }) => [row.booking_id, Number(row.hourly_pay_usd)])));
    setEntries((e.data ?? []) as TimeEntry[]);
    setPayouts((p.data ?? []) as Payout[]);
    setInterviews((i.data ?? []) as Interview[]);
    setLoading(false);
  }, [expert.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    void load();
  }, [load]);

  const earnings = useMemo(() => {
    let approved = 0;
    let pending = 0;
    for (const entry of entries) {
      const amount = Number(entry.hours) * (pay[entry.booking_id] ?? 0);
      if (APPROVED.includes(entry.status)) approved += amount;
      else if (entry.status === "submitted") pending += amount;
    }
    const paid = payouts.filter((p) => p.status === "sent").reduce((sum, p) => sum + Number(p.amount_usd), 0);
    return { approved, pending, paid };
  }, [entries, pay, payouts]);

  const accepted = expert.status === "accepted";
  const offers = bookings.filter((b) => b.status === "offered");
  const active = bookings.filter((b) => b.status === "active");

  return (
    <div className="kx-page">
      <div className="kx-page-head">
        <div>
          <p className="kx-kicker">{specialtyLabel(expert.primary_specialty, arabic)}</p>
          <h1 className="kx-title">{t(`Hi ${expert.full_name.split(" ")[0]}`, `هلا ${expert.full_name.split(" ")[0]}`)}</h1>
        </div>
        <Status value={expert.status} />
      </div>
      <Notice kind="error">{error}</Notice>

      {!accepted ? (
        <ApplicationProgress expert={expert} interview={interviews[0]} />
      ) : (
        <>
          <div className="kx-stats">
            <Stat label={t("Approved earnings", "أرباح معتمدة")} value={money(earnings.approved)} />
            <Stat label={t("Awaiting approval", "بانتظار الاعتماد")} value={money(earnings.pending)} />
            <Stat label={t("Paid out", "تم صرفه")} value={money(earnings.paid)} />
          </div>

          {offers.length ? (
            <Section title={t("Booking offers", "عروض الحجز")}>
              <div className="kx-list">
                {offers.map((booking) => <OfferCard key={booking.id} booking={booking} pay={pay[booking.id]} onDone={load} />)}
              </div>
            </Section>
          ) : null}

          <Section title={t("Log hours", "سجّل ساعاتك")}>
            {active.length ? <LogHours bookings={active} onDone={load} /> : (
              <Empty title={t("No active bookings yet", "ما عندك حجوزات فعّالة")}>
                {t("When a company books you and you accept, you can log hours here.", "لما تحجزك شركة وتقبل الحجز، تقدر تسجّل ساعاتك هنا.")}
              </Empty>
            )}
          </Section>
        </>
      )}

      {bookings.length ? (
        <Section title={t("Bookings", "الحجوزات")}>
          <div className="kx-table-wrap">
            <table className="kx-table">
              <thead><tr><th>{t("Booking", "الحجز")}</th><th>{t("Your rate", "أجرك")}</th><th>{t("Weekly cap", "حد أسبوعي")}</th><th>{t("Dates", "المدة")}</th><th>{t("Status", "الحالة")}</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.title}</td>
                    <td>{pay[b.id] ? `${money(pay[b.id])}/${t("hr", "ساعة")}` : "—"}</td>
                    <td>{b.weekly_hours_cap ? hoursLabel(b.weekly_hours_cap) : "—"}</td>
                    <td>{formatDate(b.starts_on, arabic)} – {formatDate(b.ends_on, arabic)}</td>
                    <td><Status value={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {entries.length ? (
        <Section title={t("Your hours", "ساعاتك")}>
          <EntriesTable entries={entries} bookings={bookings} pay={pay} onDone={load} />
        </Section>
      ) : null}

      {payouts.length ? (
        <Section title={t("Payouts", "المستحقات المصروفة")}>
          <div className="kx-table-wrap">
            <table className="kx-table">
              <thead><tr><th>{t("Period", "الفترة")}</th><th>{t("Hours", "الساعات")}</th><th>{t("Amount", "المبلغ")}</th><th>{t("Status", "الحالة")}</th></tr></thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.period_start, arabic)} – {formatDate(p.period_end, arabic)}</td>
                    <td>{hoursLabel(p.total_hours)}</td>
                    <td>{money(p.amount_usd)}</td>
                    <td><Status value={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {loading ? <p className="kx-muted">{t("Loading…", "جاري التحميل…")}</p> : null}
    </div>
  );
}

function ApplicationProgress({ expert, interview }: { expert: Expert; interview?: Interview }) {
  const { t } = useT();
  const labels: Record<(typeof STEPS)[number], [string, string]> = {
    submitted: ["Application received", "استلمنا طلبك"],
    interviewing: ["AI interview", "المقابلة مع المحاور الذكي"],
    under_review: ["Human review", "المراجعة البشرية"],
    accepted: ["Accepted", "القبول"],
  };
  const current = STEPS.indexOf(expert.status as (typeof STEPS)[number]);

  if (expert.status === "rejected") {
    return (
      <div className="kx-card">
        <h2>{t("We can't offer you a place right now", "ما نقدر نقبلك حاليًا")}</h2>
        <p className="kx-muted">{t("Thank you for applying. Demand for your specialty may change, and we'll reach out if it does.", "شكرًا على تقديمك. الطلب على تخصصك ممكن يتغيّر، وبنتواصل معك إذا تغيّر.")}</p>
      </div>
    );
  }

  return (
    <div className="kx-card">
      <ol className="kx-steps">
        {STEPS.map((step, index) => (
          <li key={step} className={index < current ? "is-done" : index === current ? "is-current" : ""}>
            <span>{index < current ? <Check size={15} /> : index + 1}</span>
            {t(...labels[step])}
          </li>
        ))}
      </ol>
      <p className="kx-muted">
        {expert.status === "submitted" || expert.status === "draft"
          ? t("We'll email you an invitation to a 5-minute AI interview in Arabic or English.", "بنرسل لك دعوة لمقابلة ٥ دقائق مع المحاور الذكي، بالعربي أو الإنجليزي.")
          : expert.status === "interviewing"
            ? interview?.status === "completed"
              ? t("Interview complete. A reviewer will look at it next.", "خلصت المقابلة، والمراجع بيطّلع عليها.")
              : t("Your interview invitation is on its way.", "دعوة المقابلة في الطريق.")
            : t("A Kufuo reviewer is looking at your interview and profile.", "مراجع من كفو يراجع مقابلتك وملفك.")}
      </p>
      <p className="kx-muted">{t("Being accepted isn't a guarantee of work; we'll tell you as soon as a matching opportunity opens.", "القبول مو ضمان شغل، بس بنبلغك أول ما تنفتح فرصة تناسبك.")}</p>
    </div>
  );
}

function OfferCard({ booking, pay, onDone }: { booking: Booking; pay?: number; onDone: () => void }) {
  const { t, arabic } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function respond(status: "active" | "declined") {
    setBusy(true);
    const { error: updateError } = await createClient().from("bookings").update({ status }).eq("id", booking.id);
    setBusy(false);
    if (updateError) return setError(errorText(updateError));
    onDone();
  }

  return (
    <div className="kx-card kx-row-card">
      <div>
        <strong>{booking.title}</strong>
        <p className="kx-muted">
          {pay ? `${money(pay)}/${t("hr", "ساعة")} · ` : ""}
          {booking.weekly_hours_cap ? `${t("up to", "حتى")} ${hoursLabel(booking.weekly_hours_cap)} ${t("hrs/week", "ساعة/أسبوع")} · ` : ""}
          {t("from", "من")} {formatDate(booking.starts_on, arabic)}
        </p>
        <Notice kind="error">{error}</Notice>
      </div>
      <div className="kx-inline-actions">
        <button className="button button-small" type="button" disabled={busy} onClick={() => respond("active")}><Check size={16} />{t("Accept", "اقبل")}</button>
        <button className="button button-small button-secondary" type="button" disabled={busy} onClick={() => respond("declined")}><X size={16} />{t("Decline", "ارفض")}</button>
      </div>
    </div>
  );
}

function LogHours({ bookings, onDone }: { bookings: Booking[]; onDone: () => void }) {
  const { t } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [bookingId, setBookingId] = useState(bookings[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("time_entries").insert({
      booking_id: bookingId,
      expert_id: user?.id,
      work_date: date,
      hours: Number(hours),
      description: description.trim(),
    });
    setBusy(false);
    if (error) return setMessage({ kind: "error", text: errorText(error) });
    setHours("");
    setDescription("");
    setMessage({ kind: "success", text: t("Hours sent to the company for approval.", "انرسلت الساعات للشركة عشان تعتمدها.") });
    onDone();
  }

  return (
    <form className="kx-card kx-form" onSubmit={submit}>
      <div className="kx-grid-4">
        <Field label={t("Booking", "الحجز")}>
          <select value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
            {bookings.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </Field>
        <Field label={t("Date", "التاريخ")}>
          <input type="date" required max={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={t("Hours", "الساعات")}>
          <input type="number" required min={0.25} max={24} step={0.25} value={hours} onChange={(e) => setHours(e.target.value)} />
        </Field>
        <Field label={t("What did you work on?", "وش اشتغلت عليه؟")}>
          <input required minLength={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </div>
      {message ? <Notice kind={message.kind}>{message.text}</Notice> : null}
      <div className="kx-actions">
        <button className="button" type="submit" disabled={busy || !bookingId}><Clock3 size={17} />{busy ? t("Sending…", "جاري الإرسال…") : t("Submit hours", "أرسل الساعات")}</button>
      </div>
    </form>
  );
}

function EntriesTable({ entries, bookings, pay, onDone }: { entries: TimeEntry[]; bookings: Booking[]; pay: Record<string, number>; onDone: () => void }) {
  const { t, arabic } = useT();
  const titles = Object.fromEntries(bookings.map((b) => [b.id, b.title]));
  const [error, setError] = useState("");

  async function remove(id: string) {
    const { error: deleteError } = await createClient().from("time_entries").delete().eq("id", id);
    if (deleteError) setError(errorText(deleteError));
    onDone();
  }

  return (
    <>
      <Notice kind="error">{error}</Notice>
      <div className="kx-table-wrap">
        <table className="kx-table">
          <thead><tr><th>{t("Date", "التاريخ")}</th><th>{t("Booking", "الحجز")}</th><th>{t("Hours", "الساعات")}</th><th>{t("Amount", "المبلغ")}</th><th>{t("Work", "الشغل")}</th><th>{t("Status", "الحالة")}</th><th /></tr></thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{formatDate(entry.work_date, arabic)}</td>
                <td>{titles[entry.booking_id] ?? "—"}</td>
                <td>{hoursLabel(entry.hours)}</td>
                <td>{money(Number(entry.hours) * (pay[entry.booking_id] ?? 0))}</td>
                <td>
                  {entry.description}
                  {entry.status === "disputed" && entry.dispute_reason ? <small className="kx-dispute">{t("Company note: ", "ملاحظة الشركة: ")}{entry.dispute_reason}</small> : null}
                </td>
                <td><Status value={entry.status} /></td>
                <td>{entry.status === "submitted" ? <button className="kx-link" type="button" onClick={() => remove(entry.id)}>{t("Delete", "احذف")}</button> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
