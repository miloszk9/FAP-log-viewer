import React from "react";
import { cn } from "@/lib/utils";
import { formatMetricValue, type MetricValue } from "@/components/analysis/MetricCard";

export interface KeyValueListItem {
  key: string;
  value?: MetricValue;
  unit?: string;
  description?: string;
  formatValue?: (value: MetricValue) => React.ReactNode;
}

export interface KeyValueListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: KeyValueListItem[];
  hideUndefined?: boolean;
  emptyFallback?: React.ReactNode;
}

export const KeyValueList: React.FC<KeyValueListProps> = ({
  items,
  hideUndefined = true,
  emptyFallback = null,
  className,
  ...props
}) => {
  const filteredItems = hideUndefined ? items.filter((item) => item.value !== undefined && item.value !== null) : items;

  if (!filteredItems.length) {
    return emptyFallback ? <>{emptyFallback}</> : null;
  }

  return (
    <dl className={cn("grid gap-3 sm:grid-cols-2", className)} {...props}>
      {filteredItems.map(({ key, value, unit, description, formatValue }) => {
        const renderedValue = formatValue ? formatValue(value) : formatMetricValue(value ?? null);
        const isFallback = renderedValue === "N/A";

        return (
        <div key={key} className="rounded-lg border border-border/50 bg-card/60 p-4">
            <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
            <dd className="mt-2 text-base font-semibold text-foreground">
              {renderedValue}
              {unit && !isFallback ? (
                <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>
              ) : null}
            </dd>
            {description ? <p className="mt-2 text-xs text-muted-foreground">{description}</p> : null}
          </div>
        );
      })}
    </dl>
  );
};
