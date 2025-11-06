import React, { useCallback, useEffect } from "react";
import { AppProviders } from "@/components/AppProviders";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  AnalysisSections,
  MetricCard,
  PollingController,
  StatusBanner,
  formatDate,
  formatDuration,
} from "@/components/analysis";
import { ApiError } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { useAnalysisDetail } from "@/lib/queries";
import type { AnalysisDetailDto } from "@/types";
import { useAnalysisPageTranslations, type AnalysisPageTranslations } from "@/i18n/analysisPage";

interface AnalysisPageProps {
  analysisId: string;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ analysisId }) => {
  return (
    <AppProviders>
      <AnalysisPageContent analysisId={analysisId} />
    </AppProviders>
  );
};

interface AnalysisPageContentProps {
  analysisId: string;
}

const AnalysisPageContent: React.FC<AnalysisPageContentProps> = ({ analysisId }) => {
  const { clearSession } = useAuth();
  const { data, isLoading, isError, error, refetch, isRefetching } = useAnalysisDetail(analysisId, {
    enabled: Boolean(analysisId),
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  });
  const t = useAnalysisPageTranslations();

  useEffect(() => {
    if (error instanceof ApiError && error.isUnauthorized) {
      clearSession();
    }
  }, [error, clearSession]);

  const handleNavigate = useCallback((path: string) => {
    if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  }, []);

  const loadingSkeleton = (
    <div className="space-y-4" aria-live="polite">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse space-y-4 rounded-xl border border-muted-foreground/40 bg-muted/10 p-6"
        >
          <div className="h-5 w-48 rounded bg-muted-foreground/20" />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-24 rounded-lg bg-muted-foreground/10" />
            <div className="h-24 rounded-lg bg-muted-foreground/10" />
            <div className="h-24 rounded-lg bg-muted-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );

  const handleRefetch = useCallback(async () => {
    await refetch({ throwOnError: false });
  }, [refetch]);

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        {isLoading ? (
          loadingSkeleton
        ) : isError ? (
          <ErrorState
            title={t.errors.loadFailedTitle}
            description={
              error instanceof ApiError
                ? error.message || t.errors.loadFailedDescription
                : t.errors.loadFailedDescription
            }
            onRetry={() => void handleRefetch()}
            retryLabel={isRefetching ? t.buttons.retrying : t.buttons.retry}
            retryButtonProps={{ disabled: isRefetching }}
            actions={
              <Button type="button" variant="ghost" onClick={() => handleNavigate("/history")}>
                {t.buttons.backToHistory}
              </Button>
            }
          />
        ) : !data ? (
          <EmptyState
            title={t.emptyStates.noDataTitle}
            description={t.emptyStates.noDataDescription}
            action={
              <Button type="button" onClick={() => handleNavigate("/history")} variant="outline">
                {t.buttons.backToHistory}
              </Button>
            }
          />
        ) : (
          <PollingController enabled={data.status === "Processing"} onPoll={handleRefetch}>
            {({ isPolling, timedOut, elapsedMs, restart }) => (
              <AnalysisDataView
                detail={data}
                isPolling={isPolling}
                timedOut={timedOut}
                elapsedMs={elapsedMs}
                restart={restart}
                onManualRefresh={handleRefetch}
                isRefetching={isRefetching}
                onNavigate={handleNavigate}
                translations={t}
              />
            )}
          </PollingController>
        )}
      </section>
    </AppShell>
  );
};

interface AnalysisDataViewProps {
  detail: AnalysisDetailDto;
  isPolling: boolean;
  timedOut: boolean;
  elapsedMs: number;
  restart: () => void;
  onManualRefresh: () => Promise<void> | void;
  isRefetching: boolean;
  onNavigate: (path: string) => void;
  translations: AnalysisPageTranslations;
}

const AnalysisDataView: React.FC<AnalysisDataViewProps> = ({
  detail,
  isPolling,
  timedOut,
  elapsedMs,
  restart,
  onManualRefresh,
  isRefetching,
  onNavigate,
  translations,
}) => {
  const handleResume = useCallback(() => {
    restart();
    void onManualRefresh();
  }, [restart, onManualRefresh]);

  useEffect(() => {
    if (!timedOut || detail.status !== "Processing") {
      return;
    }

    const handleFocus = () => {
      handleResume();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [timedOut, detail.status, handleResume]);

  const bannerActions = [] as React.ReactNode[];

  if (timedOut) {
    bannerActions.push(
      <Button key="resume" type="button" variant="outline" onClick={handleResume}>
        {translations.buttons.resumePolling}
      </Button>
    );
  }

  bannerActions.push(
    <Button key="refresh" type="button" variant="ghost" onClick={() => void onManualRefresh()} disabled={isRefetching}>
      {isRefetching ? translations.buttons.refreshing : translations.buttons.refreshNow}
    </Button>
  );

  const metaCards = (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label={translations.metrics.distanceLabel}
        value={detail.distance ?? detail.analysis?.overall?.distance_km ?? null}
        unit="km"
      />
      <MetricCard
        label={translations.metrics.logDateLabel}
        value={detail.logDate ?? null}
        formatValue={(value) => formatDate(value)}
      />
      <MetricCard
        label={translations.metrics.fapRegenLabel}
        value={detail.fapRegen ? translations.metrics.fapRegenDetected : translations.metrics.fapRegenNotDetected}
        description={translations.metrics.fapRegenDescription}
      />
    </div>
  );

  const infoCardItems: React.ReactNode[] = [
    <MetricCard key="version" label={translations.metrics.versionLabel} value={detail.version} />,
  ];

  if (detail.status === "Processing") {
    infoCardItems.push(
      <MetricCard
        key="auto-refresh"
        label={translations.metrics.autoRefreshLabel}
        value={elapsedMs}
        formatValue={(value) => formatDuration(typeof value === "number" ? value / 1000 : null)}
        description={
          timedOut
            ? translations.metrics.autoRefreshPausedDescription
            : translations.metrics.autoRefreshActiveDescription
        }
      />
    );
  }

  const infoCards = (
    <div className={`grid gap-4 ${infoCardItems.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
      {infoCardItems}
    </div>
  );

  const sections = detail.analysis ? (
    <AnalysisSections data={detail.analysis} />
  ) : detail.status === "Processing" ? (
    <EmptyState
      title={translations.emptyStates.inProgressTitle}
      description={translations.emptyStates.inProgressDescription}
    />
  ) : (
    <EmptyState
      title={translations.emptyStates.noMetricsTitle}
      description={translations.emptyStates.noMetricsDescription}
      action={
        <Button type="button" variant="outline" onClick={() => onNavigate("/upload")}>
          {translations.buttons.uploadNewLog}
        </Button>
      }
    />
  );

  return (
    <div className="space-y-6">
      <StatusBanner
        status={detail.status}
        message={detail.message ?? undefined}
        isPolling={isPolling && !timedOut}
        actions={bannerActions}
      />

      {metaCards}
      {infoCards}

      {sections}
    </div>
  );
};
