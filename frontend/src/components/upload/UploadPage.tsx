import React from "react";
import { AppShell } from "@/components/AppShell";
import { AppProviders } from "@/components/AppProviders";
import { UploadCard } from "@/components/upload/UploadCard";

export const UploadPage: React.FC = () => {
  return (
    <AppProviders>
      <UploadPageContent />
    </AppProviders>
  );
};

const UploadPageContent: React.FC = () => {
  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Upload a new log</h1>
          <p className="text-sm text-muted-foreground">
            Queue a CSV or ZIP file exported from the FAP mobile app. We will process it asynchronously and update your
            history once the analysis completes.
          </p>
        </header>

        <UploadCard />

        <aside className="rounded-lg border border-muted-foreground/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">What happens after upload?</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Your file is validated and queued for processing (usually a few seconds).</li>
            <li>You are redirected to your history where the new analysis appears at the top.</li>
            <li>We keep polling the backend until results are ready. You can open the detail view for live status.</li>
          </ol>
        </aside>
      </section>
    </AppShell>
  );
};


