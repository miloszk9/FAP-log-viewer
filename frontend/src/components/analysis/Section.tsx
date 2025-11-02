import React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, description, actions, className, children, ...props }) => {
  return (
    <section
      className={cn("space-y-5 rounded-xl border border-border/60 bg-background/70 p-6 shadow-sm", className)}
      {...props}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
};

