import React from "react";
import { AppShell } from "@/components/AppShell";

export const HistoryPage: React.FC = () => {
  return (
    <AppShell>
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Log history</h1>
          <p className="text-sm text-muted-foreground">
            Review previously uploaded analyses. Sorting, infinite scroll, and actions will appear here soon.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-background/60 p-6 text-sm text-muted-foreground">
          Dataset integration in progress. This placeholder confirms the protected route and dashboard shell are wired up.
        </div>
      </section>
    </AppShell>
  );
};
