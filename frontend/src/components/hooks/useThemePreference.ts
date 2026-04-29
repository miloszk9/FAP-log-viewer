import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "fap-log-viewer-theme";
const THEME_COOKIE_KEY = "fap-log-viewer-theme-preference";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

interface ThemeOption {
  value: ThemePreference;
  label: "Light" | "Dark" | "Auto";
}

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  themeOptions: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

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
      document.cookie = `${THEME_COOKIE_KEY}=system; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
      document.cookie = `${THEME_COOKIE_KEY}=${preference}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch (error) {
    // Ignore storage write errors
  }
};

const readInitialPreference = (explicitPreference?: ThemePreference): ThemePreference => {
  if (explicitPreference) {
    return explicitPreference;
  }

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

const readInitialResolvedTheme = (preference: ThemePreference): ResolvedTheme => {
  if (typeof document !== "undefined") {
    const datasetTheme = document.documentElement.dataset.theme;
    if (datasetTheme === "dark" || datasetTheme === "light") {
      return datasetTheme;
    }
  }

  if (typeof window !== "undefined") {
    return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
  }

  return resolveTheme(preference, false);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialPreference?: ThemePreference }> = ({
  children,
  initialPreference: explicitPreference,
}) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readInitialPreference(explicitPreference));
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => readInitialResolvedTheme(preference));

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

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  const themeOptions = useMemo<ThemeOption[]>(
    () => [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "Auto" },
    ],
    []
  );

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      setPreference,
      themeOptions,
    }),
    [preference, resolvedTheme, setPreference, themeOptions]
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export const useThemePreference = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemePreference must be used within a ThemeProvider");
  }
  return context;
};


