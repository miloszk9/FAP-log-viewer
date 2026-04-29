import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider, type LanguagePreference, type SupportedLanguage } from "@/lib/i18n";
import { ApiError } from "@/lib/apiClient";
import { ThemeProvider, type ThemePreference } from "@/components/hooks/useThemePreference";

interface AppProvidersProps {
  children: React.ReactNode;
  initialLanguagePreference?: LanguagePreference;
  initialLanguage?: SupportedLanguage;
  initialThemePreference?: ThemePreference;
}

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  initialLanguagePreference,
  initialLanguage,
  initialThemePreference,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error instanceof ApiError) {
                return error.isRetryable && failureCount < 3;
              }

              return false;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialPreference={initialThemePreference}>
        <LanguageProvider initialPreference={initialLanguagePreference} initialLanguage={initialLanguage}>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
