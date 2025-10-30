import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchAnalyses, type FetchAnalysesParams, ApiError } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import type { GetAnalysesQueryDto, GetAnalysesResponseDto } from "@/types";

export const analysesKeys = {
  all: ["analyses"] as const,
  list: (params: Partial<GetAnalysesQueryDto>) => ["analyses", params] as const,
};

const DEFAULT_PAGE_SIZE = 10;

export interface UseAnalysesOptions extends Partial<GetAnalysesQueryDto> {
  pageSize?: number;
}

export type UseAnalysesResult = UseInfiniteQueryResult<InfiniteData<GetAnalysesResponseDto, number>, ApiError> & {
  items: GetAnalysesResponseDto["data"];
  hasMore: boolean;
  queryKey: ReturnType<typeof analysesKeys.list>;
};

export const useAnalyses = (options: UseAnalysesOptions = {}): UseAnalysesResult => {
  const { accessToken } = useAuth();

  const queryOptions = useMemo(() => {
    const { sortBy = "fileName", order = "desc", pageSize = DEFAULT_PAGE_SIZE } = options;

    const baseParams: FetchAnalysesParams = {
      sortBy,
      order,
      limit: pageSize,
    };

    return {
      baseParams,
      pageSize,
    };
  }, [options]);

  const queryKey = analysesKeys.list({ sortBy: queryOptions.baseParams.sortBy, order: queryOptions.baseParams.order });

  const result = useInfiniteQuery<
    GetAnalysesResponseDto,
    ApiError,
    InfiniteData<GetAnalysesResponseDto, number>,
    ReturnType<typeof analysesKeys.list>,
    number
  >({
    queryKey,
    queryFn: async ({ pageParam = 1, signal }) =>
      fetchAnalyses({
        ...queryOptions.baseParams,
        page: Number(pageParam),
        accessToken,
        signal,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;

      if (!pagination) {
        return undefined;
      }

      const currentPage = Number(pagination.currentPage);
      const totalPages = Number(pagination.totalPages);

      if (!Number.isFinite(currentPage) || !Number.isFinite(totalPages)) {
        return undefined;
      }

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    const pages = result.data?.pages;

    if (!pages?.length) {
      return [] as GetAnalysesResponseDto["data"];
    }

    return pages.flatMap((page) => page.data);
  }, [result.data]);

  const hasMore = Boolean(result.hasNextPage);

  return Object.assign(result, {
    items,
    hasMore,
    queryKey,
  });
};
