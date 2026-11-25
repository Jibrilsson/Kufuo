export type AppRole = "expert" | "company" | "admin";
export type ExpertStatus = "draft" | "submitted" | "interviewing" | "under_review" | "accepted" | "rejected" | "paused";
export type ExpertLevel = "associate" | "professional" | "senior" | "principal";
export type BookingStatus = "offered" | "active" | "declined" | "ended" | "cancelled";
export type TimeEntryStatus = "submitted" | "approved" | "auto_approved" | "disputed" | "rejected";
export type CandidateStatus = "proposed" | "shortlisted" | "declined_by_company" | "booked";
export type RequestStatus = "open" | "matching" | "filled" | "closed";

export type Expert = {
  id: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  country_code: string | null;
  timezone: string | null;
  languages: string[];
  primary_specialty: string | null;
  specialties: string[];
  years_experience: number | null;
  linkedin_url: string | null;
  weekly_hours_available: number | null;
  availability_notes: string | null;
  status: ExpertStatus;
  level: ExpertLevel | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Interview = {
  id: string;
  expert_id: string;
  language: "ar" | "en";
  specialty: string | null;
  status: "invited" | "in_progress" | "completed" | "incomplete";
  attempt: number;
  completed_at: string | null;
  created_at: string;
};

export type Company = { id: string; name: string; website: string | null; billing_email: string | null; created_at: string };

export type CompanyRequest = {
  id: string;
  company_id: string;
  specialty: string;
  language: "ar" | "en" | "ar_en";
  weekly_hours: number | null;
  duration_weeks: number | null;
  description: string;
  status: RequestStatus;
  created_at: string;
};

export type Candidate = {
  request_id: string;
  expert_id: string;
  hourly_price_usd: number | null;
  kufuo_note: string | null;
  status: CandidateStatus;
  created_at: string;
};

export type Booking = {
  id: string;
  company_id: string;
  expert_id: string;
  request_id: string | null;
  title: string;
  weekly_hours_cap: number | null;
  total_hours_cap: number | null;
  starts_on: string;
  ends_on: string | null;
  approval_window_days: number;
  status: BookingStatus;
  created_at: string;
};

export type TimeEntry = {
  id: string;
  booking_id: string;
  expert_id: string;
  work_date: string;
  hours: number;
  description: string;
  status: TimeEntryStatus;
  dispute_reason: string | null;
  invoice_id: string | null;
  payout_id: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  company_id: string;
  number: string | null;
  period_start: string;
  period_end: string;
  total_hours: number;
  amount_usd: number;
  status: "draft" | "issued" | "paid" | "void";
  issued_at: string | null;
  paid_at: string | null;
};

export type Payout = {
  id: string;
  expert_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  amount_usd: number;
  status: "pending" | "sent" | "failed" | "cancelled";
  paid_at: string | null;
};

export type Lead = {
  id: string;
  contact_name: string;
  email: string;
  company_name: string;
  need: string;
  specialty: string | null;
  language: string | null;
  status: "new" | "contacted" | "converted" | "closed";
  created_at: string;
};

export const APPROVED: TimeEntryStatus[] = ["approved", "auto_approved"];

export const SPECIALTIES = [
  ["law", "Law", "القانون"],
  ["medicine", "Medicine", "الطب"],
  ["engineering", "Engineering", "الهندسة"],
  ["finance", "Finance", "المالية"],
  ["software", "Software", "البرمجيات"],
  ["data", "Data & AI", "البيانات والذكاء الاصطناعي"],
  ["design", "Design", "التصميم"],
  ["marketing", "Marketing", "التسويق"],
  ["linguistics", "Arabic language & linguistics", "اللغة العربية واللسانيات"],
  ["education", "Education", "التعليم"],
  ["other", "Other", "أخرى"],
] as const;

export function specialtyLabel(value: string | null | undefined, arabic: boolean) {
  const found = SPECIALTIES.find(([key]) => key === value);
  if (!found) return value ?? "—";
  return arabic ? found[2] : found[1];
}

export function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function hoursLabel(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
}
