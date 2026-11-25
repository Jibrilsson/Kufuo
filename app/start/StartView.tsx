"use client";

import Link from "next/link";
import { Building2, ChevronRight, UserCheck } from "lucide-react";
import { useT } from "../_ui/lang";

export function StartView() {
  const { t } = useT();
  return (
    <div className="kx-narrow">
      <p className="kx-kicker">{t("Welcome to Kufuo", "حيّاك في كفو")}</p>
      <h1 className="kx-title">{t("How will you use Kufuo?", "كيف بتستخدم كفو؟")}</h1>
      <p className="kx-lead">{t("Pick one. An account is either an expert or a company.", "اختر واحد. الحساب يكون خبير أو شركة.")}</p>
      <div className="kx-choice-grid">
        <Link className="kx-choice" href="/apply">
          <UserCheck size={28} />
          <strong>{t("I'm an expert", "أنا خبير")}</strong>
          <span>{t("Apply, pass a short AI interview and a human review, then get booked by the hour.", "قدّم، وسوّ مقابلة قصيرة مع المحاور الذكي ومراجعة بشرية، وبعدها الشركات تحجز ساعاتك.")}</span>
          <em>{t("Apply as an expert", "قدّم كخبير")}<ChevronRight size={16} /></em>
        </Link>
        <Link className="kx-choice" href="/company/new">
          <Building2 size={28} />
          <strong>{t("I'm hiring", "أبغى أوظّف")}</strong>
          <span>{t("Tell us what expertise you need. We propose vetted Arab experts and you book their hours.", "قل لنا وش الخبرة اللي تحتاجها، ونرشّح لك خبراء عرب موثّقين تحجز ساعاتهم.")}</span>
          <em>{t("Set up a company", "أنشئ حساب شركة")}<ChevronRight size={16} /></em>
        </Link>
      </div>
    </div>
  );
}
