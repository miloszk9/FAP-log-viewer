import React, { useMemo } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemePreference } from "@/components/hooks/useThemePreference";
import type { ThemePreference } from "@/components/hooks/useThemePreference";
import { useAuth } from "@/lib/auth";

interface DashboardSidebarProps {
  onNavigate?: (path: string) => void;
  onSignOut?: () => void;
}

interface NavItem {
  label: string;
  href: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onNavigate, onSignOut }) => {
  const { clearSession } = useAuth();
  const { preference, resolvedTheme, setPreference, themeOptions } = useThemePreference();

  const cycleThemePreference = () => {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const currentIndex = order.indexOf(preference);
    const nextPreference = order[(currentIndex + 1) % order.length];
    setPreference(nextPreference);
  };

  const themeOption =
    themeOptions.find((option) => option.value === preference) ?? themeOptions[themeOptions.length - 1];

  const themeBadgeIcon: Record<ThemePreference, React.ReactNode> = {
    light: <Sun aria-hidden="true" className="h-3 w-3" />,
    dark: <Moon aria-hidden="true" className="h-3 w-3" />,
    system: <Monitor aria-hidden="true" className="h-3 w-3" />,
  };

  const themeAriaLabel = `Cycle theme preference (current: ${themeOption.label}${
    preference === "system" ? `, resolves to ${resolvedTheme}` : ""
  })`;

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: "History", href: "/history" },
      { label: "Summary", href: "/summary" },
      { label: "Upload new log", href: "/upload" },
    ],
    []
  );

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

  return (
    <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block lg:w-72">
      <div className="flex h-full flex-col justify-between px-5 py-6">
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-lg font-semibold">FAP Log Viewer</p>
            <p className="text-sm text-muted-foreground">Citroën · Peugeot · DS</p>
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
              Sign out
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
            title={`Theme: ${themeOption.label}${
              preference === "system" ? ` (system preference: ${resolvedTheme})` : ""
            }`}
          >
            <span className="flex items-center gap-2">Theme</span>
            <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase">
              {themeBadgeIcon[preference]}
              {themeOption.label}
            </span>
            <span className="sr-only" aria-live="polite">
              Theme preference {themeOption.label}
              {preference === "system" ? `, currently ${resolvedTheme}` : ""}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between text-xs"
            onClick={() => handleNavigate("/settings/language")}
          >
            Language
            <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase">EN</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};
