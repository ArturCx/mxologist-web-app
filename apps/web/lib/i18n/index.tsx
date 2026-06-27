"use client";

// Lightweight client-side i18n. The active language comes from the signed-in
// user's Settings (persisted via PATCH /settings) and is mirrored to
// localStorage for instant paint and the signed-out landing.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useApi } from "@/lib/api";
import { en, type I18nKey } from "./en";
import { pt } from "./pt";

export type Lang = "EN" | "PT";
const DICTS: Record<Lang, Record<I18nKey, string>> = { EN: en, PT: pt };
const STORAGE_KEY = "mx-lang";

type Params = Record<string, string | number>;
type I18nContext = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: I18nKey, params?: Params) => string;
};

const Ctx = createContext<I18nContext | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const api = useApi();
  const [lang, setLang] = useState<Lang>("EN");

  // Instant paint from the last known choice.
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "EN" || stored === "PT") setLang(stored);
  }, []);

  // Once authenticated, the persisted preference wins.
  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    api<{ language: Lang }>("/settings")
      .then((s) => {
        if (cancelled || !s.language) return;
        setLang(s.language);
        if (typeof window !== "undefined")
          localStorage.setItem(STORAGE_KEY, s.language);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, api]);

  const changeLang = useCallback(
    (l: Lang) => {
      setLang(l);
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
      if (isSignedIn) {
        api("/settings", {
          method: "PATCH",
          body: JSON.stringify({ language: l }),
        }).catch(() => {});
      }
    },
    [api, isSignedIn],
  );

  const t = useCallback(
    (key: I18nKey, params?: Params) => {
      let str = DICTS[lang][key] ?? en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.split(`{${k}}`).join(String(v));
        }
      }
      return str;
    },
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang: changeLang, t }}>{children}</Ctx.Provider>;
}

export function useT(): I18nContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useT must be used within <LanguageProvider>");
  return ctx;
}
