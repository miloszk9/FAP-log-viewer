import { useMemo } from "react";
import { useLanguage, type SupportedLanguage } from "@/lib/i18n";
import type { ThemePreference, ResolvedTheme } from "@/components/hooks/useThemePreference";

interface ThemeTranslations {
  label: string;
  options: Record<ThemePreference, string>;
  resolved: Record<ResolvedTheme, string>;
  ariaLabel: (currentOption: string, resolvedLabel: string | null) => string;
  title: (currentOption: string, resolvedLabel: string | null) => string;
  status: (currentOption: string, resolvedLabel: string | null) => string;
}

interface LanguageTranslations {
  label: string;
  switchText: (targetLabel: string) => string;
  statusText: (currentLabel: string) => string;
  title: (targetLabel: string) => string;
}

export interface DashboardSidebarTranslations {
  nav: {
    history: string;
    summary: string;
    upload: string;
    signOut: string;
  };
  theme: ThemeTranslations;
  language: LanguageTranslations;
  overlay: {
    close: string;
  };
}

const dashboardSidebarTranslations: Record<SupportedLanguage, DashboardSidebarTranslations> = {
  en: {
    nav: {
      history: "History",
      summary: "Summary",
      upload: "Upload new log",
      signOut: "Sign out",
    },
    theme: {
      label: "Theme",
      options: {
        light: "Light",
        dark: "Dark",
        system: "Auto",
      },
      resolved: {
        light: "light",
        dark: "dark",
      },
      ariaLabel: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Cycle theme preference (current: ${currentOption}, resolves to ${resolvedLabel})`
          : `Cycle theme preference (current: ${currentOption})`,
      title: (currentOption, resolvedLabel) =>
        resolvedLabel ? `Theme: ${currentOption} (system preference: ${resolvedLabel})` : `Theme: ${currentOption}`,
      status: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Theme preference ${currentOption}, currently ${resolvedLabel}`
          : `Theme preference ${currentOption}`,
    },
    language: {
      label: "Language",
      switchText: (targetLabel) => `Switch language to ${targetLabel}`,
      statusText: (currentLabel) => `Current language ${currentLabel}`,
      title: (targetLabel) => `Switch language to ${targetLabel}`,
    },
    overlay: {
      close: "Close navigation",
    },
  },
  pl: {
    nav: {
      history: "Historia",
      summary: "Podsumowanie",
      upload: "Prześlij nowy log",
      signOut: "Wyloguj",
    },
    theme: {
      label: "Motyw",
      options: {
        light: "Jasny",
        dark: "Ciemny",
        system: "Automatyczny",
      },
      resolved: {
        light: "jasny",
        dark: "ciemny",
      },
      ariaLabel: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Zmień preferencję motywu (obecnie: ${currentOption}, wynik: ${resolvedLabel})`
          : `Zmień preferencję motywu (obecnie: ${currentOption})`,
      title: (currentOption, resolvedLabel) =>
        resolvedLabel ? `Motyw: ${currentOption} (system: ${resolvedLabel})` : `Motyw: ${currentOption}`,
      status: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Preferencja motywu ${currentOption}, aktualnie ${resolvedLabel}`
          : `Preferencja motywu ${currentOption}`,
    },
    language: {
      label: "Język",
      switchText: (targetLabel) => `Przełącz język na ${targetLabel}`,
      statusText: (currentLabel) => `Bieżący język ${currentLabel}`,
      title: (targetLabel) => `Przełącz język na ${targetLabel}`,
    },
    overlay: {
      close: "Zamknij nawigację",
    },
  },
};

export const getDashboardSidebarTranslations = (language: SupportedLanguage): DashboardSidebarTranslations =>
  dashboardSidebarTranslations[language];

export const useDashboardSidebarTranslations = (): DashboardSidebarTranslations => {
  const { language } = useLanguage();

  return useMemo(() => getDashboardSidebarTranslations(language), [language]);
};
