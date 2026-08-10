import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export function LegalPage({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: ReactNode }) {
  return <main className="legal-page"><header className="legal-header"><a href="/"><ArrowLeft size={18} />Back to Kufuo</a><a className="brand" href="/" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span></a></header><article className="legal-card"><p className="kicker">{kicker}</p><h1>{title}</h1><p className="legal-intro">{intro}</p><div className="legal-content">{children}</div><footer><span>Effective: 10 August 2026</span><a href="mailto:support@kufuo.com">support@kufuo.com</a></footer></article></main>;
}
