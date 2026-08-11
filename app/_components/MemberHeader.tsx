"use client";

import { FormEvent, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, ChevronDown, HelpCircle, Languages, Search, UserRound } from "lucide-react";
import { getLanguageSnapshot, getServerLanguageSnapshot, setStoredLanguage, subscribeToLanguage } from "../lib/kufuo/language";
import type { Language } from "../lib/kufuo/types";

type MemberHeaderProps = {
  user: { displayName: string; email: string };
  active?: "opportunities" | "discover" | "connections" | "messages" | "profile" | "settings";
  avatarUrl?: string | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
};

const labels = {
  en: {
    opportunities: "Opportunities",
    discover: "Discover",
    connections: "Connections",
    messages: "Messages",
    search: "Search people, ideas, or skills",
    help: "Help and safety",
    notifications: "Notifications",
    account: "Your profile",
  },
  ar: {
    opportunities: "الفرص",
    discover: "استكشف",
    connections: "العلاقات",
    messages: "الرسائل",
    search: "ابحث عن أشخاص أو أفكار أو مهارات",
    help: "المساعدة والأمان",
    notifications: "التنبيهات",
    account: "ملفك الشخصي",
  },
} as const;

export function MemberHeader({ user, active, avatarUrl, searchValue, onSearchChange, searchPlaceholder, language: languageProp, onLanguageChange }: MemberHeaderProps) {
  const storedLanguage = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, getServerLanguageSnapshot);
  const language = languageProp ?? storedLanguage;
  const arabic = language === "ar";
  const t = labels[language];
  const firstName = user.displayName.includes("@") ? user.email.split("@")[0] : user.displayName.split(" ")[0];

  function toggleLanguage() {
    const next = arabic ? "en" : "ar";
    setStoredLanguage(next);
    onLanguageChange?.(next);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    if (onSearchChange) event.preventDefault();
  }

  return (
    <header className="member-global-header" dir={arabic ? "rtl" : "ltr"}>
      <div className="member-global-header-inner">
        <Link className="member-global-logo" href="/" aria-label="Kufuo home"><img src="/kufuo-logo.svg" alt="Kufuo" /></Link>
        <nav className="member-primary-nav" aria-label={arabic ? "التنقل الرئيسي" : "Primary navigation"}>
          <Link className={active === "opportunities" ? "is-active" : ""} href="/dashboard">{t.opportunities}<ChevronDown size={14} /></Link>
          <Link className={active === "discover" ? "is-active" : ""} href="/discover">{t.discover}</Link>
          <Link className={active === "connections" ? "is-active" : ""} href="/connections">{t.connections}</Link>
          <Link className={active === "messages" ? "is-active" : ""} href="/messages">{t.messages}</Link>
        </nav>
        <form className="member-header-search" action="/discover" onSubmit={submitSearch}>
          <Search size={17} aria-hidden="true" />
          <input name="q" type="search" value={searchValue} onChange={onSearchChange ? (event) => onSearchChange(event.target.value) : undefined} placeholder={searchPlaceholder ?? t.search} aria-label={searchPlaceholder ?? t.search} />
          <button type="submit" aria-label={arabic ? "بحث" : "Search"}><Search size={16} /></button>
        </form>
        <div className="member-header-actions">
          <Link className="member-header-icon" href="/community-guidelines" aria-label={t.help}><HelpCircle size={20} /></Link>
          <Link className="member-header-icon" href="/notifications" aria-label={t.notifications}><Bell size={20} /><span aria-hidden="true" /></Link>
          <button className="member-header-language" type="button" onClick={toggleLanguage} aria-label={arabic ? "Switch to English" : "التبديل إلى العربية"}><Languages size={19} /><span>{arabic ? "EN" : "ع"}</span></button>
          <Link className={`member-header-account ${active === "profile" || active === "settings" ? "is-active" : ""}`} href="/account" aria-label={t.account}>
            <span className="member-header-avatar">{avatarUrl ? <img src={avatarUrl} alt="" /> : <UserRound size={18} />}</span>
            <span>{firstName}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
