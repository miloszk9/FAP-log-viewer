import React from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

interface AppShellProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  onNavigate?: (path: string) => void;
  onSignOut?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, requireAuth = true, onNavigate, onSignOut }) => {
  const content = requireAuth ? <ProtectedRoute>{children}</ProtectedRoute> : children;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DashboardSidebar onNavigate={onNavigate} onSignOut={onSignOut} />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{content}</main>
        </div>
      </div>
    </div>
  );
};
