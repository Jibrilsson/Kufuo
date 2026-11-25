"use client";

import { useEffect, useState } from "react";
import { Languages, Menu, X } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import type { Language } from "../lib/kufuo/useLanguage";

type AuthState = "loading" | "signed-in" | "signed-out";

export function LegalSiteHeader({ language, onLanguageChange }: { language: Language; onLanguageChange: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("loading");
  const arabic = language === "ar";
  const home = arabic ? "/?lang=ar" : "/";
  const navigation = arabic
    ? [["للخبراء", "/?lang=ar#experts"], ["للشركات", "/?lang=ar#companies"], ["اطلب خبير", "/?lang=ar#request"]]
    : [["For experts", "/#experts"], ["For companies", "/#companies"], ["Request an expert", "/#request"]];

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser()
      .then(({ data }) => {
        if (active) setAuthState(data.user ? "signed-in" : "signed-out");
      })
      .catch(() => {
        if (active) setAuthState("signed-out");
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthState(session?.user ? "signed-in" : "signed-out");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signedIn = authState === "signed-in";
  const secondaryAuthHref = signedIn ? "/home" : "/login?returnTo=%2Fhome";
  const primaryAuthHref = signedIn ? "/home" : "/login?mode=signup&returnTo=%2Fapply";
  const secondaryAuthLabel = signedIn ? (arabic ? "حسابي" : "My account") : (arabic ? "دخول" : "Log in");
  const primaryAuthLabel = signedIn ? (arabic ? "حسابي" : "My account") : (arabic ? "قدّم كخبير" : "Apply as an expert");

  return (
    <header className="site-header legal-site-header" dir={arabic ? "rtl" : "ltr"}>
      <a className="brand" href={home} aria-label={arabic ? "الصفحة الرئيسية لكفو" : "Kufuo home"}>
        <span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span>
      </a>

      <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`} aria-label={arabic ? "التنقل الرئيسي" : "Primary navigation"}>
        {navigation.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
        ))}
        <div className={`mobile-auth-links ${authState === "loading" ? "is-loading" : ""}`} aria-busy={authState === "loading"}>
          <a className="button button-secondary" href={secondaryAuthHref}>{secondaryAuthLabel}</a>
          <a className="button button-lime" href={primaryAuthHref}>{primaryAuthLabel}</a>
        </div>
      </nav>

      <div className="header-actions">
        <button className="language-button" type="button" onClick={onLanguageChange} aria-label={arabic ? "Switch to English" : "التبديل إلى العربية"}>
          <Languages size={18} /><span>{arabic ? "English" : "العربية"}</span>
        </button>
        <div className={`header-auth-links ${authState === "loading" ? "is-loading" : ""}`} aria-busy={authState === "loading"}>
          <a className="button button-small button-secondary header-sign-in" href={secondaryAuthHref}>{secondaryAuthLabel}</a>
          <a className="button button-small" href={primaryAuthHref}>{primaryAuthLabel}</a>
        </div>
        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? (arabic ? "إغلاق التنقل" : "Close navigation") : (arabic ? "فتح التنقل" : "Open navigation")}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
