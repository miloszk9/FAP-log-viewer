import React from "react";
import type { MetricValue } from "@/components/analysis/MetricCard";
import { formatMetricValue } from "@/components/analysis/MetricCard";
import { formatDuration, formatDate } from "@/components/analysis/formatters";

export type BuiltInFormatter = "duration" | "datetime" | "number" | "string";

export interface FieldDefinition {
  label?: string;
  description?: string;
  unit?: string;
  formatter?: BuiltInFormatter | ((value: MetricValue) => React.ReactNode);
  order?: number;
  display?: "default" | "thresholdIndicator";
  thresholdMode?:
    | "idle"
    | "driving"
    | "fapMaxPressure"
    | "coolantMax"
    | "oilMax"
    | "additiveRemain"
    | "last10RegenDistance"
    | "fapLifeLeft";
}

export interface MetricsDictionary {
  getSectionMeta(path: string[]): FieldDefinition | undefined;
  getFieldMeta(path: string[]): FieldDefinition | undefined;
}

const ABBREVIATION_MAP: Record<string, string> = {
  avg: "Average",
  max: "Maximum",
  min: "Minimum",
  diff: "Difference",
  idle: "Idle",
  driving: "Driving",
  engine: "Engine",
  oil: "Oil",
  temp: "Temperature",
  rpm: "RPM",
  revs: "Revolutions",
  soot: "Soot",
  fuel: "Fuel",
  regen: "Regeneration",
};

const UNIT_SUFFIX_MAP: { pattern: RegExp; unit: string }[] = [
  { pattern: /_l100km$/i, unit: "L/100km" },
  { pattern: /_kmh$/i, unit: "km/h" },
  { pattern: /_mbar$/i, unit: "mbar" },
  { pattern: /_perc$/i, unit: "%" },
  { pattern: /_km$/i, unit: "km" },
  { pattern: /_sec$/i, unit: "s" },
  { pattern: /_c$/i, unit: "°C" },
  { pattern: /_v$/i, unit: "V" },
  { pattern: /_ml$/i, unit: "mL" },
  { pattern: /_l$/i, unit: "L" },
  { pattern: /_gram$/i, unit: "g" },
  { pattern: /_gl$/i, unit: "g/L" },
];

export const humanizeKey = (key: string): string => {
  if (!key) {
    return "";
  }

  const segments = key.split(/[_\s]+/).filter(Boolean);

  const transformedSegments = segments.map((segment) => {
    const normalized = segment.toLowerCase();

    if (ABBREVIATION_MAP[normalized]) {
      return ABBREVIATION_MAP[normalized];
    }

    if (/^[a-z]{1,2}\d+/.test(segment)) {
      return segment.toUpperCase();
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
  });

  return transformedSegments.join(" ");
};

export const inferUnitFromKey = (key: string): string | undefined => {
  for (const { pattern, unit } of UNIT_SUFFIX_MAP) {
    if (pattern.test(key)) {
      return unit;
    }
  }

  return undefined;
};

export const formatValueByDefinition = (value: MetricValue, definition?: FieldDefinition): React.ReactNode => {
  if (definition?.formatter) {
    if (typeof definition.formatter === "function") {
      return definition.formatter(value);
    }

    if (definition.formatter === "duration") {
      if (typeof value === "number") {
        return formatDuration(value);
      }

      return formatMetricValue(value);
    }

    if (definition.formatter === "datetime") {
      return formatDate(value);
    }

    if (definition.formatter === "number") {
      if (typeof value === "number") {
        return value.toLocaleString();
      }

      return formatMetricValue(value);
    }
  }

  return formatMetricValue(value);
};

export const combineFieldDefinitions = (
  primary: FieldDefinition | undefined,
  secondary: FieldDefinition | undefined,
  fallbackKey?: string
): FieldDefinition => {
  const combined: FieldDefinition = {
    ...secondary,
    ...primary,
  };

  if (!combined.label && fallbackKey) {
    combined.label = humanizeKey(fallbackKey);
  }

  if (!combined.unit && fallbackKey) {
    combined.unit = inferUnitFromKey(fallbackKey);
  }

  return combined;
};
