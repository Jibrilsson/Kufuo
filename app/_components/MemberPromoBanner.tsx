"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import type { Language } from "../lib/kufuo/types";

const slides = {
  en: [
    { eyebrow: "From match to momentum", title: "Turn a promising match into a focused trial sprint.", action: "Plan the first sprint", href: "/connections" },
    { eyebrow: "Make the opportunity clear", title: "Give the right cofounder enough context to say yes.", action: "Post an opportunity", href: "/ideas/new" },
    { eyebrow: "Your profile is part of the pitch", title: "Show how you work before the first conversation.", action: "Strengthen your profile", href: "/account" },
  ],
  ar: [
    { eyebrow: "من التوافق إلى الإنجاز", title: "حوّل التوافق الواعد إلى تجربة عمل قصيرة وواضحة.", action: "خطط لأول تجربة", href: "/connections" },
    { eyebrow: "وضّح الفرصة", title: "أعطِ الشريك المناسب ما يكفي من السياق ليقرر بثقة.", action: "انشر فرصة", href: "/ideas/new" },
    { eyebrow: "ملفك جزء من عرضك", title: "وضّح طريقة عملك قبل أول محادثة.", action: "قوِّ ملفك", href: "/account" },
  ],
} as const;

export function MemberPromoBanner({ language }: { language: Language }) {
  const [active, setActive] = useState(0);
  const [followupVisible, setFollowupVisible] = useState(true);
  const arabic = language === "ar";
  const slide = slides[language][active];

  return (
    <section className="member-promo-wrap" aria-label={arabic ? "خطوات تساعدك على بناء شراكة أفضل" : "Ways to build a stronger cofounder partnership"}>
      <article className="member-promo-card">
        <div className="member-promo-copy">
          <p>{slide.eyebrow}</p>
          <h2>{slide.title}</h2>
          <Link className="member-promo-cta" href={slide.href}>{slide.action}<ArrowRight className="directional-icon" size={17} /></Link>
        </div>
        <div className="member-promo-art" aria-hidden="true"><img src="/kufuo-founder-collaboration.png" alt="" /></div>
        <div className="member-promo-dots" role="group" aria-label={arabic ? "شرائح البانر" : "Banner slides"}>
          {slides[language].map((item, index) => <button className={active === index ? "is-active" : ""} type="button" onClick={() => setActive(index)} aria-label={`${arabic ? "عرض" : "Show"} ${item.eyebrow}`} aria-pressed={active === index} key={item.eyebrow} />)}
        </div>
      </article>
      {followupVisible && <div className="member-promo-followup"><Check size={18} /><span>{arabic ? "الطلبات الأقوى تبدأ بملف مكتمل وواضح." : "Stronger applications start with a clear, complete profile."}</span><Link href="/account">{arabic ? "راجع ملفك" : "Review your profile"}</Link><button type="button" onClick={() => setFollowupVisible(false)} aria-label={arabic ? "إغلاق" : "Dismiss"}><X size={20} /></button></div>}
    </section>
  );
}
