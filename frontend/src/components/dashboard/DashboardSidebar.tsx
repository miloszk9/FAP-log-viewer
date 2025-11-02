import React, { useMemo } from "react";
import { Monitor, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemePreference } from "@/components/hooks/useThemePreference";
import type { ThemePreference, ResolvedTheme } from "@/components/hooks/useThemePreference";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import type { SupportedLanguage } from "@/lib/i18n";

type DashboardSidebarVariant = "desktop" | "overlay";

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLElement> {
  onNavigate?: (path: string) => void;
  onSignOut?: () => void;
  variant?: DashboardSidebarVariant;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
}

const NAV_LABELS: Record<SupportedLanguage, { history: string; summary: string; upload: string; signOut: string }> = {
  en: {
    history: "History",
    summary: "Summary",
    upload: "Upload new log",
    signOut: "Sign out",
  },
  pl: {
    history: "Historia",
    summary: "Podsumowanie",
    upload: "Prześlij nowy log",
    signOut: "Wyloguj",
  },
};

const THEME_BUTTON_LABEL: Record<SupportedLanguage, string> = {
  en: "Theme",
  pl: "Motyw",
};

const THEME_OPTION_LABELS: Record<SupportedLanguage, Record<ThemePreference, string>> = {
  en: {
    light: "Light",
    dark: "Dark",
    system: "Auto",
  },
  pl: {
    light: "Jasny",
    dark: "Ciemny",
    system: "Automatyczny",
  },
};

const RESOLVED_THEME_LABELS: Record<SupportedLanguage, Record<ResolvedTheme, string>> = {
  en: {
    light: "light",
    dark: "dark",
  },
  pl: {
    light: "jasny",
    dark: "ciemny",
  },
};

const LANGUAGE_BUTTON_LABEL: Record<SupportedLanguage, string> = {
  en: "Language",
  pl: "Język",
};

const LANGUAGE_SWITCH_TEXT: Record<SupportedLanguage, (target: string) => string> = {
  en: (target) => `Switch language to ${target}`,
  pl: (target) => `Przełącz język na ${target}`,
};

const LANGUAGE_STATUS_TEXT: Record<SupportedLanguage, (current: string) => string> = {
  en: (current) => `Current language ${current}`,
  pl: (current) => `Bieżący język ${current}`,
};

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  onNavigate,
  onSignOut,
  className,
  variant = "desktop",
  onClose,
  ...rest
}) => {
  const { clearSession } = useAuth();
  const { preference, resolvedTheme, setPreference } = useThemePreference();
  const { language, toggleLanguage, getLanguageLabel } = useLanguage();

  const cycleThemePreference = () => {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const currentIndex = order.indexOf(preference);
    const nextPreference = order[(currentIndex + 1) % order.length];
    setPreference(nextPreference);
  };

  const themeBadgeIcon: Record<ThemePreference, React.ReactNode> = {
    light: <Sun aria-hidden="true" className="h-3 w-3" />,
    dark: <Moon aria-hidden="true" className="h-3 w-3" />,
    system: <Monitor aria-hidden="true" className="h-3 w-3" />,
  };

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: NAV_LABELS[language].history, href: "/history" },
      { label: NAV_LABELS[language].summary, href: "/summary" },
      { label: NAV_LABELS[language].upload, href: "/upload" },
    ],
    [language]
  );

  const signOutLabel = NAV_LABELS[language].signOut;
  const themeLabel = THEME_BUTTON_LABEL[language];
  const themeOptionLabel = THEME_OPTION_LABELS[language][preference];
  const resolvedThemeLabel = RESOLVED_THEME_LABELS[language][resolvedTheme];
  const systemAriaSuffix =
    preference === "system"
      ? language === "pl"
        ? `, wynik: ${resolvedThemeLabel}`
        : `, resolves to ${resolvedThemeLabel}`
      : "";
  const systemTitleSuffix =
    preference === "system"
      ? language === "pl"
        ? ` (system: ${resolvedThemeLabel})`
        : ` (system preference: ${resolvedThemeLabel})`
      : "";
  const systemStatusSuffix =
    preference === "system"
      ? language === "pl"
        ? `, aktualnie ${resolvedThemeLabel}`
        : `, currently ${resolvedThemeLabel}`
      : "";

  const themeAriaLabel =
    language === "pl"
      ? `Zmień preferencję motywu (obecnie: ${themeOptionLabel}${systemAriaSuffix})`
      : `Cycle theme preference (current: ${themeOptionLabel}${systemAriaSuffix})`;
  const themeTitle =
    language === "pl"
      ? `Motyw: ${themeOptionLabel}${systemTitleSuffix}`
      : `Theme: ${themeOptionLabel}${systemTitleSuffix}`;
  const themeStatus =
    language === "pl"
      ? `Preferencja motywu ${themeOptionLabel}${systemStatusSuffix}`
      : `Theme preference ${themeOptionLabel}${systemStatusSuffix}`;

  const languageLabel = LANGUAGE_BUTTON_LABEL[language];
  const nextLanguage: SupportedLanguage = language === "en" ? "pl" : "en";
  const nextLanguageLabel = getLanguageLabel(nextLanguage);
  const currentLanguageLabel = getLanguageLabel(language);
  const languageAriaLabel = LANGUAGE_SWITCH_TEXT[language](nextLanguageLabel);
  const languageStatus = LANGUAGE_STATUS_TEXT[language](currentLanguageLabel);
  const languageTitle = languageAriaLabel;

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign(href);
    }
  };

  const handleSignOut = () => {
    clearSession();

    if (onSignOut) {
      onSignOut();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  };

  const containerClasses =
    variant === "overlay"
      ? "flex h-full w-72 flex-none flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg"
      : "hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:block lg:h-screen lg:w-72 lg:flex-none lg:overflow-y-auto";

  return (
    <aside className={cn(containerClasses, className)} {...rest}>
      <div className="flex h-full flex-col justify-between px-5 py-6">
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-lg font-semibold">FAP Log Viewer</p>
              <p className="text-sm text-muted-foreground">Citroën · Peugeot · DS</p>
            </div>
            {variant === "overlay" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onClose?.()}
                aria-label="Close navigation"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                type="button"
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => handleNavigate(item.href)}
              >
                {item.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start border-dashed text-sm"
              onClick={handleSignOut}
            >
              {signOutLabel}
            </Button>
          </nav>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between text-xs"
            onClick={cycleThemePreference}
            aria-label={themeAriaLabel}
            title={themeTitle}
          >
            <span className="flex items-center gap-2">{themeLabel}</span>
            <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase">
              {themeBadgeIcon[preference]}
              {themeOptionLabel}
            </span>
            <span className="sr-only" aria-live="polite">
              {themeStatus}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between text-xs"
            onClick={toggleLanguage}
            aria-label={languageAriaLabel}
            title={languageTitle}
          >
            <span className="flex items-center gap-2">{languageLabel}</span>
            <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase">
              {language.toUpperCase()}
            </span>
            <span className="sr-only" aria-live="polite">
              {languageStatus}
            </span>
          </Button>
        </div>
      </div>
    </aside>
  );
};
