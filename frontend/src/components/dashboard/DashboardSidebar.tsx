import React, { useMemo } from "react";
import { Monitor, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemePreference } from "@/components/hooks/useThemePreference";
import type { ThemePreference } from "@/components/hooks/useThemePreference";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import type { SupportedLanguage } from "@/lib/i18n";
import { useDashboardSidebarTranslations } from "@/i18n/dashboardSidebar";

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
  const translations = useDashboardSidebarTranslations();

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
      { label: translations.nav.history, href: "/history" },
      { label: translations.nav.summary, href: "/summary" },
      { label: translations.nav.upload, href: "/upload" },
    ],
    [translations]
  );
  const navTestIds: Record<NavItem["href"], string> = {
    "/history": "sidebar-history-link",
    "/summary": "sidebar-summary-link",
    "/upload": "sidebar-upload-link",
  };

  const signOutLabel = translations.nav.signOut;
  const themeLabel = translations.theme.label;
  const themeOptionLabel = translations.theme.options[preference];
  const resolvedThemeLabel = translations.theme.resolved[resolvedTheme];
  const resolvedLabelOrNull = preference === "system" ? resolvedThemeLabel : null;

  const themeAriaLabel = translations.theme.ariaLabel(themeOptionLabel, resolvedLabelOrNull);
  const themeTitle = translations.theme.title(themeOptionLabel, resolvedLabelOrNull);
  const themeStatus = translations.theme.status(themeOptionLabel, resolvedLabelOrNull);

  const languageLabel = translations.language.label;
  const nextLanguage: SupportedLanguage = language === "en" ? "pl" : "en";
  const nextLanguageLabel = getLanguageLabel(nextLanguage);
  const currentLanguageLabel = getLanguageLabel(language);
  const languageAriaLabel = translations.language.switchText(nextLanguageLabel);
  const languageStatus = translations.language.statusText(currentLanguageLabel);
  const languageTitle = translations.language.title(nextLanguageLabel);

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
      window.location.assign("/");
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
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
                <span className="text-2xl font-bold">F</span>
              </div>
              <div>
                <p className="text-lg font-semibold">FAP Log Viewer</p>
              </div>
            </div>
            {variant === "overlay" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onClose?.()}
                aria-label={translations.overlay.close}
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
                data-testid={navTestIds[item.href]}
              >
                {item.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start border-dashed text-sm"
              onClick={handleSignOut}
              data-testid="sidebar-signout-button"
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
