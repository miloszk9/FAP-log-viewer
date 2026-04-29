import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SupportedLanguage = "en" | "pl";
export type LanguagePreference = SupportedLanguage | "system";

interface LanguageMetadata {
  code: SupportedLanguage;
  label: string;
}

interface LanguageContextValue {
  language: SupportedLanguage;
  preference: LanguagePreference;
  supportedLanguages: readonly LanguageMetadata[];
  setPreference: (preference: LanguagePreference) => void;
  toggleLanguage: () => void;
  getLanguageLabel: (language: SupportedLanguage) => string;
}

const LANGUAGE_STORAGE_KEY = "fap-log-viewer-language";
const LANGUAGE_COOKIE_KEY = "fap-log-viewer-language-preference";

const SUPPORTED_LANGUAGES: readonly LanguageMetadata[] = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
] as const;

const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, Record<SupportedLanguage, string>> = {
  en: { en: "English", pl: "angielski" },
  pl: { en: "Polish", pl: "polski" },
};

const isSupportedLanguage = (value: unknown): value is SupportedLanguage => value === "en" || value === "pl";
const isLanguagePreference = (value: unknown): value is LanguagePreference =>
  value === "en" || value === "pl" || value === "system";

const detectNavigatorLanguage = (): SupportedLanguage => {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const preferred = navigator.languages?.[0] ?? navigator.language;

  if (preferred) {
    const [lang] = preferred.toLowerCase().split("-");

    if (isSupportedLanguage(lang)) {
      return lang;
    }
  }

  return "en";
};

const resolveLanguage = (preference: LanguagePreference): SupportedLanguage => {
  if (preference === "system") {
    return detectNavigatorLanguage();
  }
  return preference;
};

const readStoredPreference = (): LanguagePreference | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (isLanguagePreference(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage access errors (e.g., private mode)
  }

  return null;
};

const readInitialPreference = (explicitPreference?: LanguagePreference): LanguagePreference => {
  if (explicitPreference) {
    return explicitPreference;
  }

  if (typeof document !== "undefined") {
    const datasetPreference = document.documentElement.dataset.languagePreference;
    if (isLanguagePreference(datasetPreference)) {
      return datasetPreference;
    }
  }

  const stored = readStoredPreference();
  if (stored) {
    return stored;
  }

  return "system";
};

const readInitialResolvedLanguage = (preference: LanguagePreference, explicitLanguage?: SupportedLanguage): SupportedLanguage => {
  if (explicitLanguage) {
    return explicitLanguage;
  }

  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang;
    if (isSupportedLanguage(lang)) {
      return lang;
    }
  }

  return resolveLanguage(preference);
};

const persistPreference = (preference: LanguagePreference) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (preference === "system") {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      document.cookie = `${LANGUAGE_COOKIE_KEY}=system; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, preference);
      document.cookie = `${LANGUAGE_COOKIE_KEY}=${preference}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch {
    // Ignore storage/cookie write errors
  }
};

const updateDocumentLanguage = (language: SupportedLanguage, preference: LanguagePreference) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = language;
  document.documentElement.dataset.languagePreference = preference;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialPreference?: LanguagePreference;
  initialLanguage?: SupportedLanguage;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialPreference: explicitPreference,
  initialLanguage: explicitLanguage,
}) => {
  const [preference, setPreferenceState] = useState<LanguagePreference>(() => readInitialPreference(explicitPreference));
  const [language, setLanguageState] = useState<SupportedLanguage>(() =>
    readInitialResolvedLanguage(preference, explicitLanguage)
  );

  useEffect(() => {
    const resolved = resolveLanguage(preference);
    setLanguageState(resolved);
    updateDocumentLanguage(resolved, preference);
    persistPreference(preference);
  }, [preference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY) {
        return;
      }

      if (isLanguagePreference(event.newValue)) {
        setPreferenceState(event.newValue);
        return;
      }

      if (event.newValue === null) {
        setPreferenceState("system");
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setPreference = useCallback((next: LanguagePreference) => {
    setPreferenceState((current) => (current === next ? current : next));
  }, []);

  const toggleLanguage = useCallback(() => {
    setPreferenceState((current) => {
      if (current === "en") return "pl";
      if (current === "pl") return "system";
      return "en";
    });
  }, []);

  const getLanguageLabel = useCallback(
    (target: SupportedLanguage) => LANGUAGE_DISPLAY_NAMES[target][language],
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      preference,
      supportedLanguages: SUPPORTED_LANGUAGES,
      setPreference,
      toggleLanguage,
      getLanguageLabel,
    }),
    [getLanguageLabel, language, preference, setPreference, toggleLanguage]
  );

  return React.createElement(LanguageContext.Provider, { value }, children);
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};

export const getLanguageDisplayName = (language: SupportedLanguage, inLanguage: SupportedLanguage): string => {
  return LANGUAGE_DISPLAY_NAMES[language][inLanguage];
};

export const availableLanguages = SUPPORTED_LANGUAGES;


