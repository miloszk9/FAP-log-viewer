import React from "react";
import { cn } from "@/lib/utils";
import { formatMetricValue } from "@/components/analysis/MetricCard";
import { useLanguage } from "@/lib/i18n";
import type { SupportedLanguage } from "@/lib/i18n";

export type ThresholdMode =
  | "idle"
  | "driving"
  | "fapMaxPressure"
  | "coolantMax"
  | "oilMax"
  | "additiveRemain"
  | "last10RegenDistance"
  | "fapLifeLeft"
  | "injectorDeviation"
  | "injectorAvg"
  | "fuelPressureDiff"
  | "boostDiff";

interface ThresholdConfig {
  warning: number | [number, number];
  critical: number | [number, number];
  label: string;
  unit: string;
  comparison?: "above" | "below" | "outside";
}

const THRESHOLDS: Record<ThresholdMode, ThresholdConfig> = {
  idle: {
    warning: 15,
    critical: 50,
    label: "Idle pressure",
    unit: "mbar",
  },
  driving: {
    warning: 300,
    critical: 400,
    label: "Driving pressure",
    unit: "mbar",
  },
  fapMaxPressure: {
    warning: 300,
    critical: 400,
    label: "Maximum pressure",
    unit: "mbar",
  },
  coolantMax: {
    warning: 95,
    critical: 105,
    label: "Max coolant temperature",
    unit: "°C",
  },
  oilMax: {
    warning: 110,
    critical: 120,
    label: "Max oil temperature",
    unit: "°C",
  },
  additiveRemain: {
    warning: 250,
    critical: 100,
    label: "Additive remaining",
    unit: "mL",
    comparison: "below",
  },
  last10RegenDistance: {
    warning: 300,
    critical: 150,
    label: "Last 10 regenerations distance",
    unit: "km",
    comparison: "below",
  },
  fapLifeLeft: {
    warning: 50000,
    critical: 20000,
    label: "Remaining distance",
    unit: "km",
    comparison: "below",
  },
  injectorDeviation: {
    warning: [0.90, 1.10],
    critical: [0.80, 1.20],
    label: "Injector Flow",
    unit: "",
    comparison: "outside",
  },
  injectorAvg: {
    warning: [0.95, 1.05],
    critical: [0.90, 1.10],
    label: "Avg Injector Flow",
    unit: "",
    comparison: "outside",
  },
  fuelPressureDiff: {
    warning: 5,
    critical: 21,
    label: "Fuel Pressure Diff (Idle)",
    unit: "mbar",
  },
  boostDiff: {
    warning: 50,
    critical: 200,
    label: "Boost Diff (>1200mbar)",
    unit: "mbar",
  },
};

type ThresholdState = "unknown" | "normal" | "warning" | "critical";

const determineState = (mode: ThresholdMode, value: number | null | undefined): ThresholdState => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "unknown";
  }

  const { warning, critical, comparison = "above" } = THRESHOLDS[mode];

  if (comparison === "outside") {
    const [warnMin, warnMax] = warning as [number, number];
    const [critMin, critMax] = critical as [number, number];

    if (value <= critMin || value >= critMax) {
      return "critical";
    }

    if (value <= warnMin || value >= warnMax) {
      return "warning";
    }

    return "normal";
  }

  if (comparison === "below") {
    if (value <= (critical as number)) {
      return "critical";
    }

    if (value <= (warning as number)) {
      return "warning";
    }

    return "normal";
  }

  if (value >= (critical as number)) {
    return "critical";
  }

  if (value >= (warning as number)) {
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

const STATE_LABELS: Record<SupportedLanguage, Record<ThresholdState, string>> = {
  en: {
    unknown: "No data",
    normal: "Within range",
    warning: "Warning",
    critical: "Critical",
  },
  pl: {
    unknown: "Brak danych",
    normal: "W normie",
    warning: "Ostrzeżenie",
    critical: "Alarmujące",
  },
};

const SEVERITY_LABELS: Record<SupportedLanguage, { warning: string; critical: string }> = {
  en: { warning: "Warning", critical: "Critical" },
  pl: { warning: "Ostrzeżenie", critical: "Alarmujące" },
};

export interface ThresholdIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: ThresholdMode;
  value?: number | null;
  helperText?: string;
  label?: string;
}

export const ThresholdIndicator: React.FC<ThresholdIndicatorProps> = ({
  mode,
  value,
  helperText,
  label,
  className,
  ...props
}) => {
  const { language } = useLanguage();
  const state = determineState(mode, value ?? null);
  const config = THRESHOLDS[mode];

  const displayLabel = label ?? config.label;
  const unit = config.unit;
  const severityLabels = SEVERITY_LABELS[language];
  const stateLabel = STATE_LABELS[language][state];

  let defaultHelperText = "";
  if (config.comparison === "outside") {
    const [warnMin, warnMax] = config.warning as [number, number];
    const [critMin, critMax] = config.critical as [number, number];
    defaultHelperText = `${severityLabels.warning} < ${warnMin} / > ${warnMax} ${unit} · ${severityLabels.critical} < ${critMin} / > ${critMax} ${unit}`;
  } else {
    const comparisonSymbol = config.comparison === "below" ? "<" : ">";
    defaultHelperText = `${severityLabels.warning} ${comparisonSymbol} ${(config.warning as number).toLocaleString()} ${unit} · ${severityLabels.critical} ${comparisonSymbol} ${(config.critical as number).toLocaleString()} ${unit}`;
  }

  return (
    <div
      className={cn("flex flex-col gap-3 rounded-xl border p-4 text-sm transition", STATE_STYLES[state], className)}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{displayLabel}</p>
        <span className="inline-flex items-center rounded-full border border-current px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
          {stateLabel}
        </span>
      </div>
      <p className="text-2xl font-semibold">
        {formatMetricValue(value ?? null)}
        {state !== "unknown" ? <span className="ml-1 text-sm font-medium">{unit}</span> : null}
      </p>
      <p className="text-xs opacity-80">{helperText ?? defaultHelperText}</p>
    </div>
  );
};
