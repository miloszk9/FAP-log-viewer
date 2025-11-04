import React, { useEffect, useMemo } from "react";
import { AppProviders } from "@/components/AppProviders";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState } from "@/components/shared";
import { SummaryGrid } from "@/components/summary/SummaryGrid";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { useUserAverage } from "@/lib/queries";
import type { FapAverageStatus } from "@/types";
import { useSummaryPageTranslations } from "@/i18n/summaryPage";

export const SummaryPage: React.FC = () => (
  <AppProviders>
    <SummaryPageContent />
  </AppProviders>
);

const STATUS_BADGE_CLASSES: Record<FapAverageStatus, string> = {
  CALCULATING: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  SUCCESS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  FAILED: "border-destructive/40 bg-destructive/10 text-destructive",
};

const SummaryPageContent: React.FC = () => {
  const { clearSession } = useAuth();
  const averageQuery = useUserAverage({ staleTime: 60_000 });
  const t = useSummaryPageTranslations();

  const { data, isLoading, isError, error, refetch, isRefetching } = averageQuery;

  useEffect(() => {
    if (error instanceof ApiError && error.isUnauthorized) {
      clearSession();
    }
  }, [error, clearSession]);

  const statusBlock = useMemo(() => {
    if (!data?.status) {
      return null;
    }

    const badgeClass = STATUS_BADGE_CLASSES[data.status];
    const statusCopy = t.statuses[data.status];

    if (!badgeClass || !statusCopy) {
      return null;
    }

    const message = data.message ?? statusCopy.description;

    return (
      <div className="rounded-xl border border-muted-foreground/40 bg-background/80 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}
            >
              {statusCopy.label}
            </span>
            {isRefetching ? <span className="text-xs text-muted-foreground">{t.statusRefreshing}</span> : null}
          </div>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </div>
    );
  }, [data?.message, data?.status, isRefetching, t]);

  const handleNavigate = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
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
    }

    if (isError) {
      const message =
        error instanceof ApiError ? error.message || t.errors.loadFailedDescription : t.errors.loadFailedDescription;

      return (
        <ErrorState
          title={t.errors.loadFailedTitle}
          description={message}
          onRetry={() => refetch()}
          retryLabel={isRefetching ? t.buttons.retrying : t.buttons.retry}
          retryButtonProps={{ disabled: isRefetching }}
        />
      );
    }

    const hasData = Boolean(data?.average);

    if (!hasData) {
      return (
        <EmptyState
          title={t.emptyState.title}
          description={t.emptyState.description}
          action={
            <Button type="button" onClick={() => handleNavigate("/upload")}>
              {t.buttons.upload}
            </Button>
          }
        />
      );
    }

    return <SummaryGrid data={data?.average} />;
  };

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        {statusBlock}
        {renderContent()}
      </section>
    </AppShell>
  );
};
