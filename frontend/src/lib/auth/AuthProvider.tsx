import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthTokenResponseDto } from "@/types";

export const AUTH_STORAGE_KEY = "fap:access-token";

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setAccessToken: (token: string | null) => void;
  completeLogin: (token: AuthTokenResponseDto) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedToken = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (storedToken) {
        setAccessTokenState(storedToken);
      }
    } catch (error) {
      console.error("Failed to access sessionStorage", error);
    } finally {
      setIsHydrating(false);
    }
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);

    if (typeof window === "undefined") {
      return;
    }

    try {
      if (token) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, token);
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to persist token", error);
    }
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
  }, [setAccessToken]);

  const completeLogin = useCallback(
    (token: AuthTokenResponseDto) => {
      if (!token?.access_token) {
        clearSession();
        return;
      }

      setAccessToken(token.access_token);
    },
    [clearSession, setAccessToken]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isHydrating,
      setAccessToken,
      completeLogin,
      clearSession,
    }),
    [accessToken, clearSession, isHydrating, setAccessToken, completeLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
