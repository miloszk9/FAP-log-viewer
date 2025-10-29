import React from "react";
import { Button } from "@/components/ui/button";
import type { AnalysisHistoryItemDto } from "@/types";

interface SavedReportsNavProps {
  items?: AnalysisHistoryItemDto[];
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
}

export const SavedReportsNav: React.FC<SavedReportsNavProps> = ({
  items = [],
  onSelect,
  onDelete,
}) => {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-sidebar-border/60 bg-sidebar/40 px-4 py-3 text-xs text-muted-foreground">
        Saved reports will appear here once you upload new analyses.
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id}>
          <div className="group flex items-center justify-between rounded-lg border border-sidebar-border/60 bg-sidebar/40 px-3 py-2 text-sm transition hover:border-sidebar-primary/50">
            <button
              type="button"
              onClick={() => onSelect?.(item.id)}
              className="flex flex-1 flex-col items-start text-left"
            >
              <span className="font-medium text-sidebar-foreground line-clamp-1">
                {item.fileName}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </button>
            <div className="flex items-center gap-2">
              {item.fapRegen ? (
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600"
                  aria-label="Contains FAP regeneration"
                >
                  F
                </span>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(item.id);
                }}
                aria-label={`Delete ${item.fileName}`}
              >
                ×
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
