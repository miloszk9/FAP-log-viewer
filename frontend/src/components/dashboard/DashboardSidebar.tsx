import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SavedReportsNav } from "@/components/dashboard/SavedReportsNav";
import type { AnalysisHistoryItemDto } from "@/types";
import { useAuth } from "@/lib/auth";

interface DashboardSidebarProps {
  savedReports?: AnalysisHistoryItemDto[];
  onSelectReport?: (id: string) => void;
  onDeleteReport?: (id: string) => Promise<void> | void;
  onNavigate?: (path: string) => void;
  onSignOut?: () => void;
}

interface NavItem {
  label: string;
  href: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  savedReports,
  onSelectReport,
  onDeleteReport,
  onNavigate,
  onSignOut,
}) => {
  const { clearSession } = useAuth();

  const navItems = useMemo<NavItem[]>(
    () => [
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
      window.location.href = href;
    }
  };

  const handleSignOut = () => {
    clearSession();

    if (onSignOut) {
      onSignOut();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.href = "/login";
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

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saved reports</p>
            <SavedReportsNav items={savedReports} onSelect={onSelectReport} onDelete={onDeleteReport} />
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between text-xs"
            onClick={() => handleNavigate("/settings/theme")}
          >
            Theme
            <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase">Auto</span>
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
