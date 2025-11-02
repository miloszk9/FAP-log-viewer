import React from "react";
import { cn } from "@/lib/utils";
import { formatMetricValue } from "@/components/analysis/MetricCard";

type ThresholdMode = "idle" | "driving";

interface ThresholdConfig {
  warning: number;
  critical: number;
  label: string;
}

const THRESHOLDS: Record<ThresholdMode, ThresholdConfig> = {
  idle: {
    warning: 15,
    critical: 50,
    label: "Idle pressure",
  },
  driving: {
    warning: 300,
    critical: 400,
    label: "Driving pressure",
  },
};

type ThresholdState = "unknown" | "normal" | "warning" | "critical";

const determineState = (mode: ThresholdMode, value: number | null | undefined): ThresholdState => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "unknown";
  }

  const { warning, critical } = THRESHOLDS[mode];

  if (value >= critical) {
    return "critical";
  }

  if (value >= warning) {
    return "warning";
  }

  return "normal";
};

const STATE_STYLES: Record<ThresholdState, string> = {
  unknown: "border-muted-foreground/40 bg-muted/20 text-muted-foreground",
  normal: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  critical: "border-destructive/50 bg-destructive/10 text-destructive",
};

const STATE_LABELS: Record<ThresholdState, string> = {
  unknown: "No data",
  normal: "Within range",
  warning: "Warning",
  critical: "Critical",
};

export interface ThresholdIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: ThresholdMode;
  value?: number | null;
  helperText?: string;
}

export const ThresholdIndicator: React.FC<ThresholdIndicatorProps> = ({
  mode,
  value,
  helperText,
  className,
  ...props
}) => {
  const state = determineState(mode, value ?? null);
  const config = THRESHOLDS[mode];

  const defaultHelperText = `Warning > ${config.warning.toLocaleString()} mbar · Critical > ${config.critical.toLocaleString()} mbar`;

  return (
    <div
      className={cn("flex flex-col gap-3 rounded-xl border p-4 text-sm transition", STATE_STYLES[state], className)}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{config.label}</p>
        <span className="inline-flex items-center rounded-full border border-current px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
          {STATE_LABELS[state]}
        </span>
      </div>
      <p className="text-2xl font-semibold">
        {formatMetricValue(value ?? null)}
        {state !== "unknown" ? <span className="ml-1 text-sm font-medium">mbar</span> : null}
      </p>
      <p className="text-xs opacity-80">{helperText ?? defaultHelperText}</p>
    </div>
  );
};
