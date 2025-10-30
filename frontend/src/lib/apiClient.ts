import type { GetAnalysesQueryDto, GetAnalysesResponseDto } from "@/types";

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");

const API_BASE_URL = normalizeBaseUrl(import.meta.env.PUBLIC_API_BASE_URL ?? "http://localhost:3000");

export class ApiError extends Error {
  readonly status: number;

  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRetryable(): boolean {
    return this.status >= 500;
  }
}

type QueryValue = string | number | boolean | null | undefined;

const appendQueryParams = (url: URL, params?: Record<string, QueryValue>) => {
  if (!params) {
    return;
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    url.searchParams.set(key, String(value));
  });
};

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  accessToken?: string | null;
  body?: BodyInit | Record<string, unknown> | null;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

export const apiRequest = async <TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> => {
  const { method = "GET", accessToken, body, query, signal } = options;

  const url = new URL(`${API_BASE_URL}${path}`);
  appendQueryParams(url, query);

  const headers = new Headers({ Accept: "application/json" });

  let preparedBody: BodyInit | undefined;

  if (body instanceof FormData) {
    preparedBody = body;
  } else if (body !== undefined && body !== null) {
    headers.set("Content-Type", "application/json");
    preparedBody = JSON.stringify(body);
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    method,
    headers,
    body: preparedBody,
    signal,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const payloadMessage =
      typeof errorPayload === "object" &&
      errorPayload &&
      "message" in errorPayload &&
      typeof (errorPayload as { message?: unknown }).message === "string"
        ? ((errorPayload as { message: string }).message ?? undefined)
        : undefined;

    const errorMessage = payloadMessage ?? response.statusText ?? "Request failed";

    throw new ApiError(errorMessage, response.status, errorPayload);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
};

export interface FetchAnalysesParams extends GetAnalysesQueryDto {
  accessToken?: string | null;
  signal?: AbortSignal;
}

export const fetchAnalyses = async (params: FetchAnalysesParams): Promise<GetAnalysesResponseDto> => {
  const { accessToken, signal, ...query } = params;

  return apiRequest<GetAnalysesResponseDto>("/api/v1/analyses", {
    method: "GET",
    accessToken,
    query,
    signal,
  });
};

export interface DeleteAnalysisParams {
  id: string;
  accessToken?: string | null;
}

export const deleteAnalysis = async ({ id, accessToken }: DeleteAnalysisParams): Promise<void> => {
  await apiRequest<void>(`/api/v1/analyses/${id}`, {
    method: "DELETE",
    accessToken,
  });
};
