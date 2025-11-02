import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisStatus } from "@/types";

export interface UseAnalysisPollingOptions {
  status?: AnalysisStatus;
  enabled?: boolean;
  pollIntervalMs?: number;
  timeoutMs?: number;
  onTimeout?: () => void;
  refetch: () => Promise<unknown>;
}

export interface UseAnalysisPollingResult {
  isPolling: boolean;
  hasTimedOut: boolean;
  elapsedMs: number;
  remainingMs: number;
  timeoutMs: number;
  progress: number;
  isManualRefreshing: boolean;
  refreshNow: () => Promise<void>;
}

const DEFAULT_POLL_INTERVAL_MS = 1_500;
const DEFAULT_TIMEOUT_MS = 60_000;

export const useAnalysisPolling = ({
  status,
  enabled = true,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onTimeout,
  refetch,
}: UseAnalysisPollingOptions): UseAnalysisPollingResult => {
  const [isPolling, setIsPolling] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setHasTimedOut(false);
    setElapsedMs(0);
    startTimeRef.current = null;
  }, []);

  const shouldPoll = Boolean(enabled) && status === "Processing" && !hasTimedOut;

  useEffect(() => {
    if (!shouldPoll) {
      clearIntervalRef();
      setIsPolling(false);

      if (status !== "Processing") {
        resetProgress();
      }

      return;
    }

    if (intervalRef.current !== null) {
      return;
    }

    setIsPolling(true);
    startTimeRef.current = performance.now();
    setElapsedMs(0);

    intervalRef.current = window.setInterval(() => {
      const startTime = startTimeRef.current ?? performance.now();
      const now = performance.now();
      const elapsed = now - startTime;

      if (elapsed >= timeoutMs) {
        setElapsedMs(timeoutMs);
        setHasTimedOut(true);
        setIsPolling(false);
        clearIntervalRef();

        if (typeof onTimeout === "function") {
          onTimeout();
        }

        return;
      }

      setElapsedMs(elapsed);

      refetchRef.current().catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to poll analysis detail", error);
        }
      });
    }, pollIntervalMs);

    return () => {
      clearIntervalRef();
    };
  }, [shouldPoll, pollIntervalMs, timeoutMs, clearIntervalRef, onTimeout, status]);

  useEffect(() => {
    return () => {
      clearIntervalRef();
    };
  }, [clearIntervalRef]);

  const refreshNow = useCallback(async () => {
    if (isManualRefreshing) {
      return;
    }

    setIsManualRefreshing(true);
    clearIntervalRef();
    resetProgress();

    try {
      await refetchRef.current();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [clearIntervalRef, resetProgress, isManualRefreshing]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleFocus = () => {
      if (status !== "Processing") {
        return;
      }

      if (hasTimedOut) {
        void refreshNow();
        return;
      }

      refetchRef.current().catch(() => {
        /* noop */
      });
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, status, hasTimedOut, refreshNow]);

  const remainingMs = Math.max(timeoutMs - elapsedMs, 0);
  const progress = useMemo(() => {
    if (timeoutMs <= 0) {
      return 0;
    }

    return Math.min(elapsedMs / timeoutMs, 1);
  }, [elapsedMs, timeoutMs]);

  return {
    isPolling,
    hasTimedOut,
    elapsedMs,
    remainingMs,
    timeoutMs,
    progress,
    isManualRefreshing,
    refreshNow,
  };
};
