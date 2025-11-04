import { useMemo } from "react";
import { useLanguage, type SupportedLanguage } from "@/lib/i18n";

export interface HistoryTranslations {
  title: string;
  subtitle: string;
  emptyState: string;
  errors: {
    loadHistoryTitle: string;
    loadHistoryDescription: string;
    deleteAnalysis: string;
  };
  buttons: {
    retry: string;
    retrying: string;
    loadMore: string;
    loadingMore: string;
    delete: string;
  };
  labels: {
    fapRegenDetected: string;
    noFapRegen: string;
  };
  hints: {
    viewDetails: string;
  };
  sr: {
    openActionsMenu: (fileName: string) => string;
  };
}

const historyTranslations: Record<SupportedLanguage, HistoryTranslations> = {
  en: {
    title: "Log history",
    subtitle: "Review previously uploaded analyses. Click an entry to open its details.",
    emptyState: "No analyses found yet. Upload your first log to populate your history.",
    errors: {
      loadHistoryTitle: "Failed to load log history",
      loadHistoryDescription: "Unable to load history.",
      deleteAnalysis: "Unable to delete analysis. Please try again.",
    },
    buttons: {
      retry: "Retry",
      retrying: "Retrying...",
      loadMore: "Load more",
      loadingMore: "Loading more...",
      delete: "Delete",
    },
    labels: {
      fapRegenDetected: "FAP regeneration detected",
      noFapRegen: "No FAP regeneration flag",
    },
    hints: {
      viewDetails: "Click to view analysis details",
    },
    sr: {
      openActionsMenu: (fileName: string) => `Open actions menu for ${fileName}`,
    },
  },
  pl: {
    title: "Historia logów",
    subtitle: "Przeglądaj wcześniej przesłane analizy. Kliknij wpis, aby otworzyć szczegóły.",
    emptyState: "Nie znaleziono jeszcze żadnych analiz. Prześlij pierwszy log, aby uzupełnić historię.",
    errors: {
      loadHistoryTitle: "Nie udało się załadować historii logów",
      loadHistoryDescription: "Nie można załadować historii.",
      deleteAnalysis: "Nie można usunąć analizy. Spróbuj ponownie.",
    },
    buttons: {
      retry: "Spróbuj ponownie",
      retrying: "Ponawianie...",
      loadMore: "Wczytaj więcej",
      loadingMore: "Wczytywanie...",
      delete: "Usuń",
    },
    labels: {
      fapRegenDetected: "Wykryto regenerację FAP",
      noFapRegen: "Brak flagi regeneracji FAP",
    },
    hints: {
      viewDetails: "Kliknij, aby zobaczyć szczegóły analizy",
    },
    sr: {
      openActionsMenu: (fileName: string) => `Otwórz menu działań dla ${fileName}`,
    },
  },
};

export const getHistoryTranslations = (language: SupportedLanguage): HistoryTranslations => historyTranslations[language];

export const useHistoryTranslations = (): HistoryTranslations => {
  const { language } = useLanguage();

  return useMemo(() => getHistoryTranslations(language), [language]);
};

