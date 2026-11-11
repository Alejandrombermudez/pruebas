import { useCallback, useEffect, useState } from "react";
import { isLanguage } from "./copy";
import type { Language } from "./copy";

/** Idioma inicial: ?lang= > localStorage > idioma del navegador > inglés. */
export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("vireo-language");
    } catch {}

    const fromUrl = new URL(window.location.href).searchParams.get("lang");
    const fromBrowser = navigator.language.split("-")[0];
    const initial = [fromUrl, saved, fromBrowser].find(isLanguage) ?? "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende de APIs del navegador
    setLanguage(initial as Language);

    const onPopState = () => {
      const value = new URL(window.location.href).searchParams.get("lang");
      if (isLanguage(value)) setLanguage(value);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const choose = useCallback((next: Language) => {
    setLanguage(next);
    try {
      localStorage.setItem("vireo-language", next);
    } catch {}
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState(null, "", url);
    } catch {}
  }, []);

  return [language, choose] as const;
}
