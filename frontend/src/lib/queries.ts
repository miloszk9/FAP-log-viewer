import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchAnalyses,
  fetchAnalysisDetail,
  fetchUserAverage,
  uploadAnalysis,
  type FetchAnalysesParams,
  ApiError,
} from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import type {
  AnalysisDetailDto,
  GetAnalysesQueryDto,
  GetAnalysesResponseDto,
  UploadAnalysisResponseDto,
  UserAverageDto,
} from "@/types";

export const analysesKeys = {
  all: ["analyses"] as const,
  list: (params: Partial<GetAnalysesQueryDto>) => ["analyses", params] as const,
};

export const analysisKeys = {
  all: ["analysis"] as const,
  detail: (id: string) => ["analysis", id] as const,
};

export const averageKeys = {
  all: ["average"] as const,
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

export interface UseAnalysisDetailOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

export type UseAnalysisDetailResult = UseQueryResult<AnalysisDetailDto, ApiError>;

export const useAnalysisDetail = (
  id: string,
  { enabled = true, staleTime = 1_000, refetchOnWindowFocus = false }: UseAnalysisDetailOptions = {}
): UseAnalysisDetailResult => {
  const { accessToken } = useAuth();

  return useQuery<AnalysisDetailDto, ApiError>({
    queryKey: analysisKeys.detail(id),
    queryFn: ({ signal }) => fetchAnalysisDetail({ id, accessToken, signal }),
    enabled: Boolean(accessToken) && enabled,
    staleTime,
    refetchOnWindowFocus,
  });
};

export interface UseUserAverageOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

export type UseUserAverageResult = UseQueryResult<UserAverageDto, ApiError>;

export const useUserAverage = ({
  enabled = true,
  staleTime = 30_000,
  refetchOnWindowFocus = false,
}: UseUserAverageOptions = {}): UseUserAverageResult => {
  const { accessToken } = useAuth();

  return useQuery<UserAverageDto, ApiError>({
    queryKey: averageKeys.all,
    queryFn: ({ signal }) => fetchUserAverage({ accessToken, signal }),
    enabled: Boolean(accessToken) && enabled,
    staleTime,
    refetchOnWindowFocus,
  });
};

export interface UploadAnalysisVariables {
  file: File;
}

export type UseUploadAnalysisResult = UseMutationResult<UploadAnalysisResponseDto, ApiError, UploadAnalysisVariables>;

export const useUploadAnalysis = (): UseUploadAnalysisResult => {
  const { accessToken, clearSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<UploadAnalysisResponseDto, ApiError, UploadAnalysisVariables>({
    mutationFn: async ({ file }) => {
      if (!accessToken) {
        throw new ApiError("Not authenticated", 401, null);
      }

      return uploadAnalysis({ file, accessToken });
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: analysesKeys.all });
      await queryClient.invalidateQueries({ queryKey: averageKeys.all });

      if (!accessToken) {
        return;
      }

      if (Array.isArray(data.ids) && data.ids.length === 1) {
        const [analysisId] = data.ids;

        try {
          await queryClient.prefetchQuery({
            queryKey: analysisKeys.detail(analysisId),
            queryFn: ({ signal }) => fetchAnalysisDetail({ id: analysisId, accessToken, signal }),
            staleTime: 1_000,
          });
        } catch {
          // Ignore prefetch failures; the history page will fetch as needed.
        }
      }
    },
    onError: (error) => {
      if (error.isUnauthorized) {
        clearSession();
      }
    },
  });
};
