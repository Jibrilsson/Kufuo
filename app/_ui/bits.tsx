"use client";

import { useT } from "./lang";

const STATUS_TEXT: Record<string, [string, string, string]> = {
  // value: [English, Arabic, tone]
  draft: ["Draft", "مسودة", "muted"],
  submitted: ["Submitted", "مُرسل", "info"],
  interviewing: ["Interview", "المقابلة", "info"],
  under_review: ["Under review", "تحت المراجعة", "info"],
  accepted: ["Accepted", "مقبول", "good"],
  rejected: ["Not accepted", "غير مقبول", "bad"],
  paused: ["Paused", "موقوف", "muted"],
  invited: ["Invited", "مدعو", "info"],
  in_progress: ["In progress", "جارية", "info"],
  completed: ["Completed", "مكتملة", "good"],
  incomplete: ["Incomplete", "غير مكتملة", "warn"],
  open: ["Open", "مفتوح", "info"],
  matching: ["Matching", "نطابق", "info"],
  filled: ["Filled", "تمت التلبية", "good"],
  closed: ["Closed", "مغلق", "muted"],
  proposed: ["Proposed", "مرشّح", "info"],
  shortlisted: ["Shortlisted", "في القائمة", "good"],
  declined_by_company: ["Declined", "مرفوض", "muted"],
  booked: ["Booked", "محجوز", "good"],
  offered: ["Offer", "عرض", "warn"],
  active: ["Active", "فعّال", "good"],
  declined: ["Declined", "مرفوض", "muted"],
  ended: ["Ended", "منتهي", "muted"],
  cancelled: ["Cancelled", "ملغي", "muted"],
  approved: ["Approved", "معتمدة", "good"],
  auto_approved: ["Auto-approved", "معتمدة تلقائيًا", "good"],
  disputed: ["Disputed", "معترض عليها", "bad"],
  issued: ["Issued", "صادرة", "info"],
  paid: ["Paid", "مدفوعة", "good"],
  void: ["Void", "ملغاة", "muted"],
  pending: ["Pending", "قيد الانتظار", "warn"],
  sent: ["Sent", "مرسلة", "good"],
  failed: ["Failed", "فشلت", "bad"],
  new: ["New", "جديد", "warn"],
  contacted: ["Contacted", "تم التواصل", "info"],
  converted: ["Converted", "تحوّل لعميل", "good"],
};

export function Status({ value }: { value: string }) {
  const { arabic } = useT();
  const entry = STATUS_TEXT[value];
  return <span className={`kx-pill kx-pill-${entry?.[2] ?? "muted"}`}>{entry ? (arabic ? entry[1] : entry[0]) : value}</span>;
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="kx-empty">
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  if (!children) return null;
  return <p className={`kx-notice kx-notice-${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</p>;
}

export function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`kx-field${wide ? " kx-field-wide" : ""}`}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="kx-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="kx-section">
      <div className="kx-section-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function formatDate(value: string | null | undefined, arabic: boolean) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return date.toLocaleDateString(arabic ? "ar" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function errorText(error: unknown) {
  if (!error) return "";
  if (typeof error === "object" && error && "message" in error) return String((error as { message: string }).message);
  return String(error);
}
