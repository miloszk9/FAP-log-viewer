import React, { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  headerContent?: React.ReactNode;
  onNavigate?: (path: string) => void;
  onSignOut?: () => void;
}

const MobileHeader: React.FC<{
  onOpenSidebar: () => void;
  headerContent?: React.ReactNode;
  sidebarId: string;
  isSidebarOpen: boolean;
}> = ({ onOpenSidebar, headerContent, sidebarId, isSidebarOpen }) => (
  <header className="sticky top-0 z-20 border-b bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          aria-haspopup="dialog"
          aria-controls={sidebarId}
          aria-expanded={isSidebarOpen}
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-foreground">FAP Log Viewer</span>
      </div>
      {headerContent ? <div className="flex items-center gap-2">{headerContent}</div> : null}
    </div>
  </header>
);

export const AppShell: React.FC<AppShellProps> = ({
  children,
  requireAuth = true,
  headerContent,
  onNavigate,
  onSignOut,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarId = "app-shell-mobile-sidebar";

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleSidebarNavigate = useCallback(
    (path: string) => {
      setIsSidebarOpen(false);

      if (onNavigate) {
        onNavigate(path);
        return;
      }

      if (typeof window !== "undefined") {
        window.location.assign(path);
      }
    },
    [onNavigate]
  );

  const handleSidebarSignOut = useCallback(() => {
    setIsSidebarOpen(false);

    if (onSignOut) {
      onSignOut();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }, [onSignOut]);

  const content = requireAuth ? <ProtectedRoute>{children}</ProtectedRoute> : children;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DashboardSidebar onNavigate={handleSidebarNavigate} onSignOut={handleSidebarSignOut} />
        <div className="flex flex-1 flex-col">
          <MobileHeader
            onOpenSidebar={handleOpenSidebar}
            headerContent={headerContent}
            sidebarId={sidebarId}
            isSidebarOpen={isSidebarOpen}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{content}</main>
        </div>
      </div>
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleCloseSidebar}
            aria-hidden="true"
          />
          <div className="relative ml-0 flex h-full w-72 max-w-full">
            <DashboardSidebar
              variant="overlay"
              onClose={handleCloseSidebar}
              onNavigate={handleSidebarNavigate}
              onSignOut={handleSidebarSignOut}
              id={sidebarId}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
