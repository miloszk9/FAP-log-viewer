import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SupportedLanguage = "en" | "pl";

interface LanguageMetadata {
  code: SupportedLanguage;
  label: string;
}

interface LanguageContextValue {
  language: SupportedLanguage;
  supportedLanguages: readonly LanguageMetadata[];
  setLanguage: (language: SupportedLanguage) => void;
  toggleLanguage: () => void;
  getLanguageLabel: (language: SupportedLanguage) => string;
}

const LANGUAGE_STORAGE_KEY = "fap-log-viewer-language";

const SUPPORTED_LANGUAGES: readonly LanguageMetadata[] = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
] as const;

const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, Record<SupportedLanguage, string>> = {
  en: { en: "English", pl: "angielski" },
  pl: { en: "Polish", pl: "polski" },
};

const isSupportedLanguage = (value: unknown): value is SupportedLanguage => value === "en" || value === "pl";

const readStoredLanguage = (): SupportedLanguage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (isSupportedLanguage(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage access errors (e.g., private mode)
  }

  return null;
};

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

const readDatasetLanguage = (): SupportedLanguage | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const { lang, dataset } = document.documentElement;

  if (isSupportedLanguage(lang)) {
    return lang;
  }

  const datasetLanguage = dataset.language;

  if (isSupportedLanguage(datasetLanguage)) {
    return datasetLanguage;
  }

  return null;
};

const readInitialLanguage = (): SupportedLanguage => {
  const datasetLanguage = readDatasetLanguage();
  if (datasetLanguage) {
    return datasetLanguage;
  }

  const storedLanguage = readStoredLanguage();
  if (storedLanguage) {
    return storedLanguage;
  }

  return detectNavigatorLanguage();
};

const persistLanguage = (language: SupportedLanguage) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage write errors (e.g., private mode)
  }
};

const updateDocumentLanguage = (language: SupportedLanguage) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(readInitialLanguage);

  useEffect(() => {
    updateDocumentLanguage(language);
    persistLanguage(language);
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY) {
        return;
      }

      if (isSupportedLanguage(event.newValue)) {
        setLanguageState(event.newValue);
        return;
      }

      if (event.newValue === null) {
        setLanguageState(detectNavigatorLanguage());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setLanguage = useCallback((next: SupportedLanguage) => {
    setLanguageState((current) => (current === next ? current : next));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => (current === "en" ? "pl" : "en"));
  }, []);

  const getLanguageLabel = useCallback(
    (target: SupportedLanguage) => LANGUAGE_DISPLAY_NAMES[target][language],
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, supportedLanguages: SUPPORTED_LANGUAGES, setLanguage, toggleLanguage, getLanguageLabel }),
    [getLanguageLabel, language, setLanguage, toggleLanguage]
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
