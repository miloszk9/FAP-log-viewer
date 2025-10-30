import { useCallback, useLayoutEffect, useMemo, useState } from "react";

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
  root.style.colorScheme = theme === "dark" ? "dark light" : "light dark";
};

const updatePreferenceDataset = (preference: ThemePreference) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.themePreference = preference;
};

const readStoredPreference = (): ThemePreference | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : null;
  } catch (error) {
    return null;
  }
};

const persistPreference = (preference: ThemePreference) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (preference === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch (error) {
    // Ignore storage write errors (e.g., in private mode)
  }
};

const readInitialPreference = (): ThemePreference => {
  const datasetPreference =
    typeof document !== "undefined" ? document.documentElement.dataset.themePreference : undefined;

  if (isThemePreference(datasetPreference)) {
    return datasetPreference;
  }

  const storedPreference = readStoredPreference();
  if (storedPreference) {
    return storedPreference;
  }

  return "system";
};

const readInitialResolvedTheme = (): ResolvedTheme => {
  if (typeof document !== "undefined") {
    const datasetTheme = document.documentElement.dataset.theme;
    if (datasetTheme === "dark" || datasetTheme === "light") {
      return datasetTheme;
    }
  }

  if (typeof window !== "undefined") {
    return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
  }

  return "light";
};

export const useThemePreference = () => {
  const [preference, setPreference] = useState<ThemePreference>(readInitialPreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(readInitialResolvedTheme);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia ? window.matchMedia(MEDIA_QUERY) : null;

    const syncTheme = (pref: ThemePreference) => {
      const nextResolved = resolveTheme(pref, media ? media.matches : false);
      setResolvedTheme(nextResolved);
      applyThemeClass(nextResolved);
      updatePreferenceDataset(pref);
      persistPreference(pref);
    };

    syncTheme(preference);

    if (preference !== "system" || !media) {
      return;
    }

    const handleMediaChange = () => {
      const nextResolved = media.matches ? "dark" : "light";
      setResolvedTheme(nextResolved);
      applyThemeClass(nextResolved);
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleMediaChange);

      return () => {
        media.removeEventListener("change", handleMediaChange);
      };
    }

    if (typeof media.addListener === "function") {
      media.addListener(handleMediaChange);

      return () => {
        media.removeListener(handleMediaChange);
      };
    }

    return undefined;
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
