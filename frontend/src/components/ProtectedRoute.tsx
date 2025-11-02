import React, { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const defaultFallback = (
  <div className="flex h-full w-full items-center justify-center">
    <span className="text-sm text-muted-foreground">Loading dashboard…</span>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback, redirectTo = "/login" }) => {
  const { isAuthenticated, isHydrating, clearSession } = useAuth();

  useEffect(() => {
    if (isHydrating || typeof window === "undefined") {
      return;
    }

    if (isAuthenticated) {
      return;
    }

    clearSession();

    const searchParams = new URLSearchParams();

    const currentPath = window.location.pathname + window.location.search;
    if (currentPath && currentPath !== "/login") {
      searchParams.set("redirect", currentPath);
    }

    window.location.replace(searchParams.size > 0 ? `${redirectTo}?${searchParams.toString()}` : redirectTo);
  }, [clearSession, isAuthenticated, isHydrating, redirectTo]);

  const resolvedFallback = useMemo(() => fallback ?? defaultFallback, [fallback]);

  if (isHydrating) {
    return resolvedFallback;
  }

  if (!isAuthenticated) {
    return resolvedFallback;
  }

  return <>{children}</>;
};
