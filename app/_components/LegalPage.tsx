import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { LegalSiteHeader } from "./LegalSiteHeader";

export function LegalPage({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: ReactNode }) {
  return (
    <>
      <LegalSiteHeader />
      <nav className="legal-breadcrumb section-frame" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <ChevronRight size={15} aria-hidden="true" />
        <span aria-current="page">{kicker}</span>
      </nav>
      <main className="legal-page">
        <article className="legal-card">
          <p className="kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="legal-intro">{intro}</p>
          <div className="legal-content">{children}</div>
          <footer><span>Effective: 10 August 2026</span><a href="mailto:support@kufuo.com">support@kufuo.com</a></footer>
        </article>
      </main>
    </>
  );
}
