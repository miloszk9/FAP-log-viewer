import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricValue = string | number | null | undefined;

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: MetricValue;
  unit?: string;
  description?: string;
  footer?: React.ReactNode;
  formatValue?: (value: MetricValue) => React.ReactNode;
}

const DEFAULT_FALLBACK = "N/A";

const renderValue = (value: MetricValue): string => {
  if (value === null || value === undefined) {
    return DEFAULT_FALLBACK;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return DEFAULT_FALLBACK;
    }

    return value.toLocaleString(undefined, {
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    });
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return DEFAULT_FALLBACK;
  }

  return String(value);
};

export const formatMetricValue = (value: MetricValue): string => {
  if (value === null || value === undefined) {
    return DEFAULT_FALLBACK;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return DEFAULT_FALLBACK;
    }

    return value.toLocaleString(undefined, {
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    });
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return DEFAULT_FALLBACK;
  }

  return String(value);
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  description,
  footer,
  formatValue,
  className,
  ...props
}) => {
  const content = formatValue ? formatValue(value) : formatMetricValue(value);
  const showFallback = content === DEFAULT_FALLBACK || content === null;

  return (
    <Card className={cn("h-full", className)} {...props}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {description ? <p className="text-xs text-muted-foreground/80">{description}</p> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        <div className="text-2xl font-semibold text-foreground">
          {content}
          {unit && !showFallback ? (
            <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>
          ) : null}
        </div>
        {footer ? <div className="text-xs text-muted-foreground">{footer}</div> : null}
      </CardContent>
    </Card>
  );
};
