import { useMemo } from "react";
import { useLanguage, type SupportedLanguage, type LanguagePreference } from "@/lib/i18n";
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
  options: Record<LanguagePreference, string>;
  ariaLabel: (currentOption: string, resolvedLabel: string | null) => string;
  statusText: (currentOption: string, resolvedLabel: string | null) => string;
  title: (currentOption: string, resolvedLabel: string | null) => string;
}

export interface DashboardSidebarTranslations {
  nav: {
    history: string;
    summary: string;
    summaryOverall: string;
    summaryByYear: string;
    summaryByMonth: string;
    months: string[];
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
      summaryOverall: "Overall",
      summaryByYear: "By Year",
      summaryByMonth: "By Month",
      months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ],
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
      options: {
        en: "English",
        pl: "Polski",
        system: "Auto",
      },
      ariaLabel: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Cycle language preference (current: ${currentOption}, resolves to ${resolvedLabel})`
          : `Cycle language preference (current: ${currentOption})`,
      title: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Language: ${currentOption} (system preference: ${resolvedLabel})`
          : `Language: ${currentOption}`,
      statusText: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Language preference ${currentOption}, currently ${resolvedLabel}`
          : `Language preference ${currentOption}`,
    },
    overlay: {
      close: "Close navigation",
    },
  },
  pl: {
    nav: {
      history: "Historia",
      summary: "Podsumowanie",
      summaryOverall: "Całość",
      summaryByYear: "Po latach",
      summaryByMonth: "Po miesiącach",
      months: [
        "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
        "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
      ],
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
      options: {
        en: "Angielski",
        pl: "Polski",
        system: "Automatyczny",
      },
      ariaLabel: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Zmień preferencję języka (obecnie: ${currentOption}, wynik: ${resolvedLabel})`
          : `Zmień preferencję języka (obecnie: ${currentOption})`,
      title: (currentOption, resolvedLabel) =>
        resolvedLabel ? `Język: ${currentOption} (system: ${resolvedLabel})` : `Język: ${currentOption}`,
      statusText: (currentOption, resolvedLabel) =>
        resolvedLabel
          ? `Preferencja języka ${currentOption}, aktualnie ${resolvedLabel}`
          : `Preferencja języka ${currentOption}`,
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

