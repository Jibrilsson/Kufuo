"use client";

import { useEffect, useState } from "react";

export type Language = "en" | "ar";

export function useKufuoLanguage() {
  const [language, setLanguage] = useState<Language>("en");
  const [hydrated, setHydrated] = useState(false);
  const arabic = language === "ar";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requested = new URLSearchParams(window.location.search).get("lang");
      const stored = window.localStorage.getItem("kufuo:language");
      if (requested === "ar" || requested === "en") setLanguage(requested);
      else if (stored === "ar" || stored === "en") setLanguage(stored);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
    if (hydrated) window.localStorage.setItem("kufuo:language", language);
  }, [language, arabic, hydrated]);

  function switchLanguage() {
    const next: Language = arabic ? "en" : "ar";
    const url = new URL(window.location.href);
    if (next === "ar") url.searchParams.set("lang", "ar");
    else url.searchParams.delete("lang");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setLanguage(next);
  }

  return { language, arabic, hydrated, switchLanguage };
}
