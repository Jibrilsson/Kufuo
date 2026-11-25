"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import type { Booking, Candidate, Company, CompanyRequest, Expert, Invoice, Lead, Payout, TimeEntry } from "../lib/kufuo/types";
import { errorText } from "../_ui/bits";

export type AdminData = {
  experts: Expert[];
  companies: Company[];
  leads: Lead[];
  requests: CompanyRequest[];
  candidates: Candidate[];
  bookings: Booking[];
  price: Record<string, number>;
  pay: Record<string, number>;
  entries: TimeEntry[];
  invoices: Invoice[];
  payouts: Payout[];
};

const EMPTY: AdminData = { experts: [], companies: [], leads: [], requests: [], candidates: [], bookings: [], price: {}, pay: {}, entries: [], invoices: [], payouts: [] };

export function useAdminData() {
  const [data, setData] = useState<AdminData>(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const s = createClient();
    const results = await Promise.all([
      s.from("experts").select("*").order("created_at", { ascending: false }),
      s.from("companies").select("*").order("name"),
      s.from("company_leads").select("*").order("created_at", { ascending: false }),
      s.from("company_requests").select("*").order("created_at", { ascending: false }),
      s.from("request_candidates").select("*").order("created_at"),
      s.from("bookings").select("*").order("created_at", { ascending: false }),
      s.from("booking_company_terms").select("booking_id, hourly_price_usd"),
      s.from("booking_expert_terms").select("booking_id, hourly_pay_usd"),
      s.from("time_entries").select("*").order("work_date", { ascending: false }),
      s.from("invoices").select("*").order("created_at", { ascending: false }),
      s.from("payouts").select("*").order("created_at", { ascending: false }),
    ]);
    const failed = results.find((r) => r.error);
    setError(failed ? errorText(failed.error) : "");
    const [experts, companies, leads, requests, candidates, bookings, price, pay, entries, invoices, payouts] = results.map((r) => r.data ?? []);
    setData({
      experts: experts as Expert[],
      companies: companies as Company[],
      leads: leads as Lead[],
      requests: requests as CompanyRequest[],
      candidates: candidates as Candidate[],
      bookings: bookings as Booking[],
      price: Object.fromEntries((price as { booking_id: string; hourly_price_usd: number }[]).map((r) => [r.booking_id, Number(r.hourly_price_usd)])),
      pay: Object.fromEntries((pay as { booking_id: string; hourly_pay_usd: number }[]).map((r) => [r.booking_id, Number(r.hourly_pay_usd)])),
      entries: entries as TimeEntry[],
      invoices: invoices as Invoice[],
      payouts: payouts as Payout[],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
}
