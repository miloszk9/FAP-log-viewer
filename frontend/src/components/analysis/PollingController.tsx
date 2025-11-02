import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface PollingControllerRenderProps {
  isPolling: boolean;
  elapsedMs: number;
  timedOut: boolean;
  restart: () => void;
  stop: () => void;
}

export interface PollingControllerProps {
  enabled: boolean;
  intervalMs?: number;
  timeoutMs?: number;
  onPoll: () => Promise<unknown> | unknown;
  onTimeout?: () => void;
  children: (state: PollingControllerRenderProps) => React.ReactNode;
}

const DEFAULT_INTERVAL = 1_500;
const DEFAULT_TIMEOUT = 60_000;

export const PollingController: React.FC<PollingControllerProps> = ({
  enabled,
  intervalMs = DEFAULT_INTERVAL,
  timeoutMs = DEFAULT_TIMEOUT,
  onPoll,
  onTimeout,
  children,
}) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const intervalIdRef = useRef<number | null>(null);
  const isRequestingRef = useRef(false);

  const clearIntervalRef = useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const performPoll = useCallback(async () => {
    if (isRequestingRef.current) {
      return;
    }

    try {
      isRequestingRef.current = true;
      await onPoll();
    } finally {
      isRequestingRef.current = false;
    }
  }, [onPoll]);

  useEffect(() => {
    if (!enabled) {
      clearIntervalRef();
      setIsPolling(false);
      setElapsedMs(0);
      setTimedOut(false);
      return;
    }

    if (timedOut) {
      clearIntervalRef();
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    intervalIdRef.current = window.setInterval(() => {
      setElapsedMs((previous) => {
        const next = previous + intervalMs;

        if (next >= timeoutMs) {
          clearIntervalRef();
          setIsPolling(false);
          setTimedOut(true);
          onTimeout?.();
          return timeoutMs;
        }

        return next;
      });

      void performPoll();
    }, intervalMs);

    return () => {
      clearIntervalRef();
    };
  }, [enabled, intervalMs, timeoutMs, timedOut, clearIntervalRef, performPoll, onTimeout]);

  const stop = useCallback(() => {
    clearIntervalRef();
    setIsPolling(false);
  }, [clearIntervalRef]);

  const restart = useCallback(() => {
    setTimedOut(false);
    setElapsedMs(0);
    if (!enabled) {
      return;
    }

    void performPoll();
  }, [enabled, performPoll]);

  const renderState = useMemo<PollingControllerRenderProps>(
    () => ({
      isPolling,
      elapsedMs,
      timedOut,
      restart,
      stop,
    }),
    [elapsedMs, isPolling, restart, stop, timedOut],
  );

  return <>{children(renderState)}</>;
};



