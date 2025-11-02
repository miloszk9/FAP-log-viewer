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
          <h1 className="text-2xl font-semibold tracking-tight">Analysis detail</h1>
          <p className="text-sm text-muted-foreground">
            Detailed metrics for a single log analysis, including FAP statistics, engine metrics and driving behaviour.
          </p>
        </div>

        {isLoading ? (
          loadingSkeleton
        ) : isError ? (
          <ErrorState
            title="Failed to load analysis"
            description={error instanceof ApiError ? error.message : "Unable to load analysis details."}
            onRetry={() => void handleRefetch()}
            retryLabel={isRefetching ? "Retrying…" : "Retry"}
            retryButtonProps={{ disabled: isRefetching }}
            actions={
              <Button type="button" variant="ghost" onClick={() => handleNavigate("/history")}>
                Back to history
              </Button>
            }
          />
        ) : !data ? (
          <EmptyState
            title="Analysis details not available"
            description="We could not find any metrics for this analysis yet. If the log is still processing, please try again shortly."
            action={
              <Button type="button" onClick={() => handleNavigate("/history")} variant="outline">
                Back to history
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
        Resume polling
      </Button>
    );
  }

  bannerActions.push(
    <Button key="refresh" type="button" variant="ghost" onClick={() => void onManualRefresh()} disabled={isRefetching}>
      {isRefetching ? "Refreshing…" : "Refresh now"}
    </Button>
  );

  const metaCards = (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard label="Distance" value={detail.distance ?? detail.analysis?.overall?.distance_km ?? null} unit="km" />
      <MetricCard label="Log date" value={detail.logDate ?? null} formatValue={(value) => formatDate(value)} />
      <MetricCard
        label="FAP regeneration"
        value={detail.fapRegen ? "Detected" : "Not detected"}
        description="Flags whether FAP regeneration occurred in this drive."
      />
    </div>
  );

  const infoCardItems: React.ReactNode[] = [<MetricCard key="version" label="Version" value={detail.version} />];

  if (detail.status === "Processing") {
    infoCardItems.push(
      <MetricCard
        key="auto-refresh"
        label="Auto refresh duration"
        value={elapsedMs}
        formatValue={(value) => formatDuration(typeof value === "number" ? value / 1000 : null)}
        description={
          timedOut ? "Automatic polling paused after 60 seconds." : "Auto-refreshing while the analysis is processing."
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
    <EmptyState title="Analysis in progress" description="Metrics will appear once the upload finishes processing." />
  ) : (
    <EmptyState
      title="No metrics available"
      description="This analysis did not return any structured metrics. Try re-uploading the log or contact support if the problem persists."
      action={
        <Button type="button" variant="outline" onClick={() => onNavigate("/upload")}>
          Upload new log
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
