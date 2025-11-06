import { useMemo } from "react";
import { useLanguage, type SupportedLanguage } from "@/lib/i18n";

interface AnalysisEmptyStateTranslations {
  noDataTitle: string;
  noDataDescription: string;
  inProgressTitle: string;
  inProgressDescription: string;
  noMetricsTitle: string;
  noMetricsDescription: string;
}

interface AnalysisButtonTranslations {
  backToHistory: string;
  retry: string;
  retrying: string;
  resumePolling: string;
  refreshNow: string;
  refreshing: string;
  uploadNewLog: string;
}

interface AnalysisMetricTranslations {
  distanceLabel: string;
  logDateLabel: string;
  fapRegenLabel: string;
  fapRegenDetected: string;
  fapRegenNotDetected: string;
  fapRegenDescription: string;
  versionLabel: string;
  autoRefreshLabel: string;
  autoRefreshPausedDescription: string;
  autoRefreshActiveDescription: string;
}

export interface AnalysisPageTranslations {
  title: string;
  subtitle: string;
  errors: {
    loadFailedTitle: string;
    loadFailedDescription: string;
  };
  emptyStates: AnalysisEmptyStateTranslations;
  buttons: AnalysisButtonTranslations;
  metrics: AnalysisMetricTranslations;
}

const analysisPageTranslations: Record<SupportedLanguage, AnalysisPageTranslations> = {
  en: {
    title: "Analysis detail",
    subtitle:
      "Detailed metrics for a single log analysis, including FAP statistics, engine metrics and driving behaviour.",
    errors: {
      loadFailedTitle: "Failed to load analysis",
      loadFailedDescription: "Unable to load analysis details.",
    },
    emptyStates: {
      noDataTitle: "Analysis details not available",
      noDataDescription:
        "We could not find any metrics for this analysis yet. If the log is still processing, please try again shortly.",
      inProgressTitle: "Analysis in progress",
      inProgressDescription: "Metrics will appear once the upload finishes processing.",
      noMetricsTitle: "No metrics available",
      noMetricsDescription:
        "This analysis did not return any structured metrics. Try re-uploading the log or contact support if the problem persists.",
    },
    buttons: {
      backToHistory: "Back to history",
      retry: "Retry",
      retrying: "Retrying…",
      resumePolling: "Resume polling",
      refreshNow: "Refresh now",
      refreshing: "Refreshing…",
      uploadNewLog: "Upload new log",
    },
    metrics: {
      distanceLabel: "Distance",
      logDateLabel: "Log date",
      fapRegenLabel: "FAP regeneration",
      fapRegenDetected: "Detected",
      fapRegenNotDetected: "Not detected",
      fapRegenDescription: "Flags whether FAP regeneration occurred in this drive.",
      versionLabel: "Version",
      autoRefreshLabel: "Auto refresh duration",
      autoRefreshPausedDescription: "Automatic polling paused after 60 seconds.",
      autoRefreshActiveDescription: "Auto-refreshing while the analysis is processing.",
    },
  },
  pl: {
    title: "Szczegóły analizy",
    subtitle: "Szczegółowe metryki pojedynczej analizy logu, w tym statystyki FAP, parametry silnika i styl jazdy.",
    errors: {
      loadFailedTitle: "Nie udało się załadować analizy",
      loadFailedDescription: "Nie można załadować szczegółów analizy.",
    },
    emptyStates: {
      noDataTitle: "Szczegóły analizy niedostępne",
      noDataDescription:
        "Nie znaleźliśmy żadnych metryk dla tej analizy. Jeśli log jest w trakcie przetwarzania, spróbuj ponownie za chwilę.",
      inProgressTitle: "Analiza w toku",
      inProgressDescription: "Metryki pojawią się po zakończeniu przetwarzania przesłanego logu.",
      noMetricsTitle: "Brak dostępnych metryk",
      noMetricsDescription:
        "Ta analiza nie zwróciła uporządkowanych metryk. Spróbuj przesłać log ponownie lub skontaktuj się z pomocą, jeśli problem będzie się powtarzał.",
    },
    buttons: {
      backToHistory: "Wróć do historii",
      retry: "Spróbuj ponownie",
      retrying: "Ponawianie…",
      resumePolling: "Wznów odpytywanie",
      refreshNow: "Odśwież teraz",
      refreshing: "Odświeżanie…",
      uploadNewLog: "Prześlij nowy log",
    },
    metrics: {
      distanceLabel: "Dystans",
      logDateLabel: "Data logu",
      fapRegenLabel: "Regeneracja FAP",
      fapRegenDetected: "Wykryto",
      fapRegenNotDetected: "Nie wykryto",
      fapRegenDescription: "Informuje, czy podczas tej jazdy wystąpiła regeneracja filtra FAP.",
      versionLabel: "Wersja",
      autoRefreshLabel: "Czas automatycznego odświeżania",
      autoRefreshPausedDescription: "Automatyczne odpytywanie wstrzymane po 60 sekundach.",
      autoRefreshActiveDescription: "Automatyczne odświeżanie podczas przetwarzania analizy.",
    },
  },
};

export const getAnalysisPageTranslations = (language: SupportedLanguage): AnalysisPageTranslations =>
  analysisPageTranslations[language];

export const useAnalysisPageTranslations = (): AnalysisPageTranslations => {
  const { language } = useLanguage();

  return useMemo(() => getAnalysisPageTranslations(language), [language]);
};
