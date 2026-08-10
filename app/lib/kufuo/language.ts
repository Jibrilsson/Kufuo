import type { Language } from "./types";

const languageEvent = "kufuo-language-change";

export function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("kufuo:language");
  return stored === "ar" || stored === "en" ? stored : "en";
}

export function getServerLanguageSnapshot(): Language {
  return "en";
}

export function subscribeToLanguage(onStoreChange: () => void) {
  const notify = () => onStoreChange();
  window.addEventListener("storage", notify);
  window.addEventListener(languageEvent, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(languageEvent, notify);
  };
}

export function setStoredLanguage(language: Language) {
  window.localStorage.setItem("kufuo:language", language);
  window.dispatchEvent(new Event(languageEvent));
}
