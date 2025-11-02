import React from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { AnalysisStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  status: AnalysisStatus;
  message?: string | null;
  actions?: React.ReactNode;
  isPolling?: boolean;
}

const STATUS_CONFIG: Record<AnalysisStatus, { label: string; icon: React.ElementType; className: string }> = {
  Processing: {
    label: "Processing",
    icon: Loader2,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  },
  Success: {
    label: "Success",
    icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  },
  Failed: {
    label: "Failed",
    icon: AlertTriangle,
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

export const StatusBanner: React.FC<StatusBannerProps> = ({
  status,
  message,
  actions,
  isPolling,
  className,
  ...props
}) => {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between",
        config.className,
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className="flex flex-1 items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current/40 bg-background/30">
          <Icon className={cn("h-5 w-5", status === "Processing" ? "animate-spin" : undefined)} aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide">{config.label}</p>
          {message ? <p className="text-sm opacity-90">{message}</p> : null}
          {status === "Processing" && isPolling ? (
            <p className="text-xs opacity-70">Automatically refreshing every ~1.5 seconds.</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
