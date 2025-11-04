import { useMemo } from "react";
import { useLanguage, type SupportedLanguage } from "@/lib/i18n";
import type { FapAverageStatus } from "@/types";

interface SummaryStatusCopy {
  label: string;
  description: string;
}

export interface SummaryPageTranslations {
  title: string;
  subtitle: string;
  statusRefreshing: string;
  statuses: Record<FapAverageStatus, SummaryStatusCopy>;
  errors: {
    loadFailedTitle: string;
    loadFailedDescription: string;
  };
  emptyState: {
    title: string;
    description: string;
  };
  buttons: {
    retry: string;
    retrying: string;
    upload: string;
  };
}

const summaryPageTranslations: Record<SupportedLanguage, SummaryPageTranslations> = {
  en: {
    title: "Summary",
    subtitle: "Aggregated metrics across all processed analyses. Use this view to monitor long-term trends.",
    statusRefreshing: "Refreshing…",
    statuses: {
      CALCULATING: {
        label: "Calculating",
        description: "Your averages are being calculated. This may take a short moment after new uploads.",
      },
      SUCCESS: {
        label: "Up to date",
        description: "Latest averages generated from your processed analyses.",
      },
      FAILED: {
        label: "Failed",
        description: "We could not generate your averages. Try refreshing or upload a new log.",
      },
    },
    errors: {
      loadFailedTitle: "Failed to load summary",
      loadFailedDescription: "Unable to load summary.",
    },
    emptyState: {
      title: "No summary available yet",
      description: "Upload logs to generate aggregated statistics across your analyses.",
    },
    buttons: {
      retry: "Retry",
      retrying: "Retrying…",
      upload: "Upload new log",
    },
  },
  pl: {
    title: "Podsumowanie",
    subtitle: "Zbiorcze metryki ze wszystkich przetworzonych analiz. Korzystaj z tego widoku, aby śledzić długoterminowe trendy.",
    statusRefreshing: "Odświeżanie…",
    statuses: {
      CALCULATING: {
        label: "Obliczanie",
        description: "Twoje średnie są obliczane. Może to chwilę potrwać po nowych przesłaniach.",
      },
      SUCCESS: {
        label: "Aktualne",
        description: "Najnowsze średnie wygenerowane na podstawie Twoich analiz.",
      },
      FAILED: {
        label: "Niepowodzenie",
        description: "Nie udało się wygenerować średnich. Odśwież stronę lub prześlij nowy log.",
      },
    },
    errors: {
      loadFailedTitle: "Nie udało się załadować podsumowania",
      loadFailedDescription: "Nie można załadować podsumowania.",
    },
    emptyState: {
      title: "Brak dostępnego podsumowania",
      description: "Prześlij logi, aby wygenerować zagregowane statystyki z analiz.",
    },
    buttons: {
      retry: "Spróbuj ponownie",
      retrying: "Ponawianie…",
      upload: "Prześlij nowy log",
    },
  },
};

export const getSummaryPageTranslations = (language: SupportedLanguage): SummaryPageTranslations =>
  summaryPageTranslations[language];

export const useSummaryPageTranslations = (): SummaryPageTranslations => {
  const { language } = useLanguage();

  return useMemo(() => getSummaryPageTranslations(language), [language]);
};

