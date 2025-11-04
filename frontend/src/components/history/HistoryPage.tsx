import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AppProviders } from "@/components/AppProviders";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { useAnalyses, analysesKeys } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { ApiError, deleteAnalysis } from "@/lib/apiClient";
import type { GetAnalysesResponseDto } from "@/types";
import { useHistoryTranslations, type HistoryTranslations } from "@/i18n/history";

export const HistoryPage: React.FC = () => {
  return (
    <AppProviders>
      <HistoryPageContent />
    </AppProviders>
  );
};

const HistoryPageContent: React.FC = () => {
  const { accessToken, clearSession } = useAuth();
  const analysesQuery = useAnalyses();
  const queryClient = useQueryClient();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const t = useHistoryTranslations();

  const { items, isLoading, isError, error, hasMore, fetchNextPage, isFetchingNextPage, isRefetching, refetch } =
    analysesQuery;

  const assignMenuRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) {
      menuRefs.current.set(id, node);
      return;
    }

    menuRefs.current.delete(id);
  }, []);

  useEffect(() => {
    if (!activeMenuId) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const menuNode = menuRefs.current.get(activeMenuId);

      if (!menuNode) {
        return;
      }

      if (menuNode.contains(event.target as Node)) {
        return;
      }

      setActiveMenuId(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenuId]);

  useEffect(() => {
    if (error instanceof ApiError && error.isUnauthorized) {
      clearSession();
    }
  }, [clearSession, error]);

  const analysesQueryKey = useMemo<QueryKey>(() => {
    return analysesQuery.queryKey ?? analysesKeys.list({});
  }, [analysesQuery.queryKey]);

  interface DeleteVariables {
    id: string;
  }
  type DeleteContext = {
    queryKey: QueryKey;
    previousData: InfiniteData<GetAnalysesResponseDto, number> | undefined;
  } | null;

  const deleteMutation = useMutation<undefined, ApiError, DeleteVariables, DeleteContext>({
    mutationFn: async ({ id }) => {
      if (!accessToken) {
        throw new ApiError("Not authenticated", 401, null);
      }

      await deleteAnalysis({ id, accessToken });
      return undefined;
    },
    onMutate: async ({ id }) => {
      setDeleteError(null);
      setActiveMenuId(null);

      await queryClient.cancelQueries({ queryKey: analysesQueryKey });

      const previousData = queryClient.getQueryData<InfiniteData<GetAnalysesResponseDto, number>>(analysesQueryKey);

      if (!previousData) {
        return { previousData, queryKey: analysesQueryKey };
      }

      const nextPages = previousData.pages.map((page) => ({
        ...page,
        data: page.data.filter((analysis) => analysis.id !== id),
      }));

      const nextData: InfiniteData<GetAnalysesResponseDto, number> = {
        pageParams: previousData.pageParams,
        pages: nextPages,
      };

      queryClient.setQueryData(analysesQueryKey, nextData);

      return { previousData, queryKey: analysesQueryKey };
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }

      if (mutationError.isUnauthorized) {
        clearSession();
        return;
      }

      setDeleteError(mutationError.message || t.errors.deleteAnalysis);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: analysesQueryKey });
    },
  });

  const handleDeleteAnalysis = useCallback(
    (id: string) => {
      deleteMutation.mutate({ id });
    },
    [deleteMutation]
  );

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
      const message =
        error instanceof ApiError ? error.message || t.errors.loadHistoryDescription : t.errors.loadHistoryDescription;

      return (
        <div className="space-y-4 rounded-lg border border-destructive/40 bg-destructive/10 p-6" role="alert">
          <div className="space-y-1">
            <p className="font-semibold text-destructive">{t.errors.loadHistoryTitle}</p>
            <p className="text-sm text-destructive/80">{message}</p>
          </div>
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? t.buttons.retrying : t.buttons.retry}
          </Button>
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-background/60 p-6 text-sm text-muted-foreground">
          {t.emptyState}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {deleteError ? (
          <div
            className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            role="status"
          >
            {deleteError}
          </div>
        ) : null}
        <ul className="space-y-3">
          {items.map((item) => (
            <AnalysisListItem
              key={item.id}
              item={item}
              onNavigate={handleNavigateToAnalysis}
              onDelete={handleDeleteAnalysis}
              isMenuOpen={activeMenuId === item.id}
              onMenuToggle={() => setActiveMenuId((current) => (current === item.id ? null : item.id))}
              registerMenuRef={(node) => assignMenuRef(item.id, node)}
              translations={t}
            />
          ))}
        </ul>
        {hasMore ? (
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? t.buttons.loadingMore : t.buttons.loadMore}
            </Button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        {content()}
      </section>
    </AppShell>
  );
};

interface AnalysisListItemProps {
  item: GetAnalysesResponseDto["data"][number];
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  registerMenuRef: (node: HTMLDivElement | null) => void;
  translations: HistoryTranslations;
}

const AnalysisListItem: React.FC<AnalysisListItemProps> = ({
  item,
  onNavigate,
  onDelete,
  isMenuOpen,
  onMenuToggle,
  registerMenuRef,
  translations,
}) => {
  const formattedDate = new Date(item.createdAt).toLocaleString();

  return (
    <li className="rounded-lg border border-muted-foreground/30 bg-background/80 p-4 transition hover:border-primary/40 hover:bg-background">
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="flex-1 text-left" onClick={() => onNavigate(item.id)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground line-clamp-1" title={item.fileName}>
                {item.fileName}
              </p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium">
              {item.status}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {item.fapRegen ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                {translations.labels.fapRegenDetected}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
                {translations.labels.noFapRegen}
              </span>
            )}
            <span className="hidden sm:inline">{translations.hints.viewDetails}</span>
          </div>
        </button>
        <div className="relative" ref={registerMenuRef}>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls={`analysis-actions-${item.id}`}
            id={`analysis-actions-trigger-${item.id}`}
            onClick={(event) => {
              event.stopPropagation();
              onMenuToggle();
            }}
          >
            <EllipsisVertical className="h-4 w-4" aria-hidden />
            <span className="sr-only">{translations.sr.openActionsMenu(item.fileName)}</span>
          </button>
          {isMenuOpen ? (
            <div
              id={`analysis-actions-${item.id}`}
              role="menu"
              aria-labelledby={`analysis-actions-trigger-${item.id}`}
              className="absolute right-0 z-10 mt-2 w-40 rounded-md border border-muted-foreground/30 bg-background/95 p-1 text-sm shadow-lg backdrop-blur"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-destructive transition hover:bg-destructive/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {translations.buttons.delete}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
};
