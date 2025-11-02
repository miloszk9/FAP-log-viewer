import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, className, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 p-6 text-center",
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground/80">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
    </div>
  );
};
