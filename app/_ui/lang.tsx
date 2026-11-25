"use client";

import { createContext, useContext } from "react";
import { useKufuoLanguage } from "../lib/kufuo/useLanguage";

type LangValue = {
  arabic: boolean;
  /** Pick the English or Arabic string for the current language. */
  t: (en: string, ar: string) => string;
  switchLanguage: () => void;
};

const LangContext = createContext<LangValue>({ arabic: false, t: (en) => en, switchLanguage: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const { arabic, switchLanguage } = useKufuoLanguage();
  const t = (en: string, ar: string) => (arabic ? ar : en);
  return <LangContext.Provider value={{ arabic, t, switchLanguage }}>{children}</LangContext.Provider>;
}

export function useT() {
  return useContext(LangContext);
}
