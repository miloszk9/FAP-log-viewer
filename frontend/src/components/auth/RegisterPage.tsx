import React from "react";
import { AuthProvider } from "@/lib/auth";
import { RegisterView } from "@/components/auth/RegisterView";
import { AppProviders } from "@/components/AppProviders";
import { type LanguagePreference, type SupportedLanguage } from "@/lib/i18n";
import type { ThemePreference } from "@/components/hooks/useThemePreference";

export const RegisterPage: React.FC<{
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
        <RegisterView />
      </AuthProvider>
    </AppProviders>
  );
};
