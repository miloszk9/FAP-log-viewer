import React, { useEffect, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { AppProviders } from "@/components/AppProviders";
import { Button } from "@/components/ui/button";
import { useAnalyses } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/apiClient";

export const HistoryPage: React.FC = () => {
  return (
    <AppProviders>
      <HistoryPageContent />
    </AppProviders>
  );
};

const HistoryPageContent: React.FC = () => {
  const { clearSession } = useAuth();
  const analysesQuery = useAnalyses();

  const { items, isLoading, isError, error, hasMore, fetchNextPage, isFetchingNextPage, isRefetching, refetch } =
    analysesQuery;

  useEffect(() => {
    if (error instanceof ApiError && error.isUnauthorized) {
      clearSession();
    }
  }, [clearSession, error]);

  const sidebarReports = useMemo(() => items.slice(0, 5), [items]);

  const handleNavigateToAnalysis = (id: string) => {
    if (typeof window !== "undefined") {
      window.location.assign(`/analyses/${id}`);
    }
  };

  const content = () => {
    if (isLoading) {
      return (
        <div className="space-y-3" aria-live="polite">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border border-muted-foreground/20 bg-muted/40 p-4"
              role="status"
            >
              <div className="h-5 w-1/2 rounded bg-muted-foreground/20" />
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="h-4 w-24 rounded bg-muted-foreground/10" />
                <span className="h-4 w-12 rounded bg-muted-foreground/10" />
                <span className="h-4 w-20 rounded bg-muted-foreground/10" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      const message = error instanceof ApiError ? error.message : "Unable to load history.";

      return (
        <div className="space-y-4 rounded-lg border border-destructive/40 bg-destructive/10 p-6" role="alert">
          <div className="space-y-1">
            <p className="font-semibold text-destructive">Failed to load log history</p>
            <p className="text-sm text-destructive/80">{message}</p>
          </div>
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-background/60 p-6 text-sm text-muted-foreground">
          No analyses found yet. Upload your first log to populate your history.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-muted-foreground/30 bg-background/80 p-4 transition hover:border-primary/40 hover:bg-background"
            >
              <button type="button" className="w-full text-left" onClick={() => handleNavigateToAnalysis(item.id)}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground line-clamp-1" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium">
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {item.fapRegen ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                      FAP regeneration detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
                      No FAP regeneration flag
                    </span>
                  )}
                  <span className="hidden sm:inline">Click to view analysis details</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {hasMore ? (
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? "Loading more..." : "Load more"}
            </Button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <AppShell savedReports={sidebarReports} onSelectReport={handleNavigateToAnalysis}>
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Log history</h1>
          <p className="text-sm text-muted-foreground">
            Review previously uploaded analyses. Click an entry to open its details.
          </p>
        </div>

        {content()}
      </section>
    </AppShell>
  );
};
