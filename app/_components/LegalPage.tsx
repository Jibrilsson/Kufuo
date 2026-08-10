"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { LegalSiteHeader } from "./LegalSiteHeader";
import { useKufuoLanguage } from "../lib/kufuo/useLanguage";

type LocalizedText = { en: string; ar: string };

export function LegalPage({ kicker, title, intro, children, arabicChildren }: { kicker: LocalizedText; title: LocalizedText; intro: LocalizedText; children: ReactNode; arabicChildren: ReactNode }) {
  const { language, arabic, switchLanguage } = useKufuoLanguage();
  const home = arabic ? "/?lang=ar" : "/";
  const pageKicker = kicker[language];

  return (
    <div dir={arabic ? "rtl" : "ltr"}>
      <LegalSiteHeader language={language} onLanguageChange={switchLanguage} />
      <nav className="legal-breadcrumb section-frame" aria-label={arabic ? "مسار التنقل" : "Breadcrumb"}>
        <a href={home}>{arabic ? "الرئيسية" : "Home"}</a>
        <ChevronRight size={15} aria-hidden="true" />
        <span aria-current="page">{pageKicker}</span>
      </nav>
      <main className="legal-page">
        <article className="legal-card">
          <p className="kicker">{pageKicker}</p>
          <h1>{title[language]}</h1>
          <p className="legal-intro">{intro[language]}</p>
          <div className="legal-content">{arabic ? arabicChildren : children}</div>
          <footer><span>{arabic ? "ساري من: 10 أغسطس 2026" : "Effective: 10 August 2026"}</span><a href="mailto:support@kufuo.com">support@kufuo.com</a></footer>
        </article>
      </main>
    </div>
  );
}
