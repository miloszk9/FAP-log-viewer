import React from "react";
import { AuthProvider } from "@/lib/auth";
import { LoginView } from "@/components/auth/LoginView";
import { AppProviders } from "@/components/AppProviders";
import { type LanguagePreference, type SupportedLanguage } from "@/lib/i18n";
import type { ThemePreference } from "@/components/hooks/useThemePreference";

export const LoginPage: React.FC<{
  initialLanguagePreference?: LanguagePreference;
  initialLanguage?: SupportedLanguage;
  initialThemePreference?: ThemePreference;
}> = ({ initialLanguagePreference, initialLanguage, initialThemePreference }) => {
  return (
    <AppProviders
      initialLanguagePreference={initialLanguagePreference}
      initialLanguage={initialLanguage}
      initialThemePreference={initialThemePreference}
    >
      <AuthProvider>
        <LoginView />
      </AuthProvider>
    </AppProviders>
  );
};
