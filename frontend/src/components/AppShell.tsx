import React, { useMemo } from "react";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { AnalysisHistoryItemDto } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  headerContent?: React.ReactNode;
  savedReports?: AnalysisHistoryItemDto[];
  onSelectReport?: (id: string) => void;
  onDeleteReport?: (id: string) => Promise<void> | void;
  onNavigate?: (path: string) => void;
  onSignOut?: () => void;
}

const DefaultHeader: React.FC = () => (
  <div className="flex w-full items-center justify-between">
    <div>
      <p className="text-sm font-medium text-foreground">FAP Log Viewer</p>
      <p className="text-xs text-muted-foreground">Insights for PSA diesel fleets</p>
    </div>
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="hidden sm:inline">Account</span>
      <div className="h-8 w-8 rounded-full bg-primary/10" aria-hidden />
    </div>
  </div>
);

export const AppShell: React.FC<AppShellProps> = ({
  children,
  requireAuth = true,
  headerContent,
  savedReports,
  onSelectReport,
  onDeleteReport,
  onNavigate,
  onSignOut,
}) => {
  const resolvedHeader = useMemo(
    () => headerContent ?? <DefaultHeader />,
    [headerContent],
  );

  const content = requireAuth ? <ProtectedRoute>{children}</ProtectedRoute> : children;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <DashboardSidebar
            savedReports={savedReports}
            onSelectReport={onSelectReport}
            onDeleteReport={onDeleteReport}
            onNavigate={onNavigate}
            onSignOut={onSignOut}
          />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 border-b bg-background/80 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {resolvedHeader}
            </header>
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{content}</main>
          </div>
        </div>
      </div>
      {/* TODO: Add global toaster once setup */}
    </AuthProvider>
  );
};
