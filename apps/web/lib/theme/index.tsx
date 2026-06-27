"use client";

// Applies the user's chosen base theme by swapping the app background gradient
// (a single CSS variable). Mirrors the i18n LanguageProvider: loads from the
// signed-in user's Settings, persists via PATCH, and caches in localStorage.
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
import { THEMES, DEFAULT_THEME } from "./themes";

const STORAGE_KEY = "mx-theme";

function applyTheme(key: string) {
  if (typeof document === "undefined") return;
  const theme = THEMES.find((t) => t.key === key) ?? THEMES[0];
  const root = document.documentElement.style;
  root.setProperty("--app-bg", theme.bg);
  root.setProperty("--nav-bg", theme.navBg);
  root.setProperty("--glass-bg", theme.panel);
}

type ThemeContext = {
  theme: string;
  setTheme: (key: string) => void;
};

const Ctx = createContext<ThemeContext | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const api = useApi();
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME);

  // Instant paint from the last known choice.
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored && THEMES.some((t) => t.key === stored)) {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  // Once authenticated, the persisted preference wins.
  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    api<{ theme: string }>("/settings")
      .then((s) => {
        if (cancelled || !s.theme) return;
        setThemeState(s.theme);
        applyTheme(s.theme);
        if (typeof window !== "undefined")
          localStorage.setItem(STORAGE_KEY, s.theme);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, api]);

  const setTheme = useCallback(
    (key: string) => {
      setThemeState(key);
      applyTheme(key);
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, key);
      if (isSignedIn) {
        api("/settings", {
          method: "PATCH",
          body: JSON.stringify({ theme: key }),
        }).catch(() => {});
      }
    },
    [api, isSignedIn],
  );

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
