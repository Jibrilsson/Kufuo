"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages, LogOut } from "lucide-react";
import type { AppRole } from "../lib/kufuo/types";
import { LangProvider, useT } from "./lang";

type NavItem = { href: string; en: string; ar: string };

const NAV: Record<AppRole, NavItem[]> = {
  expert: [
    { href: "/expert", en: "Overview", ar: "الرئيسية" },
    { href: "/apply", en: "My profile", ar: "ملفي" },
  ],
  company: [{ href: "/company", en: "Overview", ar: "الرئيسية" }],
  admin: [{ href: "/admin", en: "Operations", ar: "التشغيل" }],
};

const ROLE_LABEL: Record<AppRole, [string, string]> = {
  expert: ["Expert", "خبير"],
  company: ["Company", "شركة"],
  admin: ["Kufuo team", "فريق كفو"],
};

export function AppShell(props: { role: AppRole | null; email: string; children: React.ReactNode }) {
  return (
    <LangProvider>
      <ShellInner {...props} />
    </LangProvider>
  );
}

function ShellInner({ role, email, children }: { role: AppRole | null; email: string; children: React.ReactNode }) {
  const { t, arabic, switchLanguage } = useT();
  const pathname = usePathname();
  const nav = role ? NAV[role] : [];

  return (
    <div className="kx-app" dir={arabic ? "rtl" : "ltr"}>
      <header className="kx-topbar">
        <Link className="kx-brand" href="/home" aria-label="Kufuo">
          <img src="/kufuo-logo.svg" alt="Kufuo" />
        </Link>
        <nav className="kx-nav" aria-label={t("Main", "التنقل")}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "is-active" : ""}>
              {t(item.en, item.ar)}
            </Link>
          ))}
        </nav>
        <div className="kx-topbar-end">
          {role ? <span className="kx-role">{t(...ROLE_LABEL[role])}</span> : null}
          <span className="kx-email" title={email}>{email}</span>
          <button type="button" className="kx-ghost" onClick={switchLanguage}>
            <Languages size={17} />{arabic ? "English" : "العربية"}
          </button>
          <form action="/auth/signout" method="post">
            <button type="submit" className="kx-ghost"><LogOut size={17} />{t("Sign out", "خروج")}</button>
          </form>
        </div>
      </header>
      <main className="kx-main">{children}</main>
    </div>
  );
}
