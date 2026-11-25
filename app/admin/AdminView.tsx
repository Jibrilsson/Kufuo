"use client";

import { useMemo, useState } from "react";
import { APPROVED, money } from "../lib/kufuo/types";
import { Notice, Stat } from "../_ui/bits";
import { useT } from "../_ui/lang";
import { useAdminData } from "./useAdminData";
import { ApplicantsTab } from "./ApplicantsTab";
import { DemandTab } from "./DemandTab";
import { BookingsTab } from "./BookingsTab";
import { MoneyTab } from "./MoneyTab";
import { AuditTab } from "./AuditTab";

const TABS = [
  ["applicants", "Applicants", "المتقدمون"],
  ["demand", "Leads & requests", "العملاء والطلبات"],
  ["bookings", "Bookings", "الحجوزات"],
  ["money", "Hours & money", "الساعات والفلوس"],
  ["audit", "Audit log", "سجل التدقيق"],
] as const;

type Tab = (typeof TABS)[number][0];

export function AdminView({ adminId }: { adminId: string }) {
  const { t } = useT();
  const { data, error, loading, reload } = useAdminData();
  const [tab, setTab] = useState<Tab>("applicants");

  const kpis = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    let hours = 0;
    let revenue = 0;
    let cost = 0;
    for (const entry of data.entries) {
      if (!APPROVED.includes(entry.status) || entry.work_date < monthStart) continue;
      hours += Number(entry.hours);
      revenue += Number(entry.hours) * (data.price[entry.booking_id] ?? 0);
      cost += Number(entry.hours) * (data.pay[entry.booking_id] ?? 0);
    }
    const toReview = data.experts.filter((e) => ["submitted", "interviewing", "under_review"].includes(e.status)).length;
    const vetted = data.experts.filter((e) => e.status === "accepted").length;
    const openDemand = data.leads.filter((l) => l.status === "new").length + data.requests.filter((r) => r.status === "open").length;
    return { hours, margin: revenue - cost, toReview, vetted, openDemand };
  }, [data]);

  return (
    <div className="kx-page">
      <div className="kx-page-head">
        <div>
          <p className="kx-kicker">{t("Kufuo operations", "تشغيل كفو")}</p>
          <h1 className="kx-title">{t("Admin", "لوحة الأدمن")}</h1>
        </div>
      </div>
      <Notice kind="error">{error}</Notice>
      <div className="kx-stats">
        <Stat label={t("Hours sold this month", "ساعات مباعة هذا الشهر")} value={kpis.hours.toLocaleString("en-US", { maximumFractionDigits: 2 })} />
        <Stat label={t("Margin this month", "الهامش هذا الشهر")} value={money(kpis.margin)} />
        <Stat label={t("Vetted experts", "خبراء موثّقون")} value={String(kpis.vetted)} />
        <Stat label={t("Applicants to process", "متقدمون للمعالجة")} value={String(kpis.toReview)} />
        <Stat label={t("Open leads & requests", "عملاء وطلبات مفتوحة")} value={String(kpis.openDemand)} />
      </div>

      <div className="kx-tabs" role="tablist">
        {TABS.map(([key, en, ar]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>{t(en, ar)}</button>
        ))}
      </div>

      {loading ? <p className="kx-muted">{t("Loading…", "جاري التحميل…")}</p> : null}
      {tab === "applicants" ? <ApplicantsTab data={data} adminId={adminId} reload={reload} /> : null}
      {tab === "demand" ? <DemandTab data={data} adminId={adminId} reload={reload} /> : null}
      {tab === "bookings" ? <BookingsTab data={data} adminId={adminId} reload={reload} /> : null}
      {tab === "money" ? <MoneyTab data={data} reload={reload} /> : null}
      {tab === "audit" ? <AuditTab /> : null}
    </div>
  );
}
