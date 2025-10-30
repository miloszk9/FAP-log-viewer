import { useCallback, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "fap-log-viewer-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

interface ThemeOption {
  value: ThemePreference;
  label: "Light" | "Dark" | "Auto";
}

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

const resolveTheme = (preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme =>
  preference === "system" ? (systemPrefersDark ? "dark" : "light") : preference;

const applyThemeClass = (theme: ResolvedTheme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
};

export const useThemePreference = () => {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(stored)) {
      setPreference(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(MEDIA_QUERY);

    const syncTheme = (pref: ThemePreference) => {
      const nextResolved = resolveTheme(pref, media.matches);
      setResolvedTheme(nextResolved);
      applyThemeClass(nextResolved);

      if (pref === "system") {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
        return;
      }

      window.localStorage.setItem(THEME_STORAGE_KEY, pref);
    };

    syncTheme(preference);

    if (preference !== "system") {
      return;
    }

    const handleMediaChange = (event: MediaQueryListEvent) => {
      const nextResolved = event.matches ? "dark" : "light";
      setResolvedTheme(nextResolved);
      applyThemeClass(nextResolved);
    };

    media.addEventListener("change", handleMediaChange);

    return () => {
      media.removeEventListener("change", handleMediaChange);
    };
  }, [preference]);

  const setThemePreference = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  const themeOptions = useMemo<ThemeOption[]>(
    () => [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "Auto" },
    ],
    []
  );

  return {
    preference,
    resolvedTheme,
    setPreference: setThemePreference,
    themeOptions,
  };
};
