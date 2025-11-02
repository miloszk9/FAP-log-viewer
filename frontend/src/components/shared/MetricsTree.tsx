import React, { useMemo } from "react";
import { Section } from "@/components/analysis/Section";
import { KeyValueList, type KeyValueListItem } from "@/components/analysis/KeyValueList";
import { ThresholdIndicator } from "@/components/analysis/ThresholdIndicator";
import type { MetricsDictionary, FieldDefinition } from "@/lib/metrics";
import { formatValueByDefinition, humanizeKey } from "@/lib/metrics";
import type { MetricValue } from "@/components/analysis/MetricCard";

interface MetricsTreeProps {
  data: Record<string, unknown> | null | undefined;
  dictionary: MetricsDictionary;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const hasRenderableValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(hasRenderableValue);
  }

  if (isPlainObject(value)) {
    return Object.values(value).some(hasRenderableValue);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) || value === 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "boolean") {
    return true;
  }

  return false;
};

const normalizePrimitiveValue = (value: unknown): MetricValue => {
  if (Array.isArray(value)) {
    const filtered = value.filter(hasRenderableValue);

    if (!filtered.length) {
      return null;
    }

    return filtered.map((item) => String(item)).join(", ");
  }

  if (isPlainObject(value)) {
    return null;
  }

  return value as MetricValue;
};

const shouldRenderKey = (key: string): boolean => {
  return !key.trim().startsWith("_");
};

const sortItems = (items: Array<{ order: number; label: string }>): Array<number> => {
  return items
    .map((item, index) => ({ index, order: item.order, label: item.label }))
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return a.label.localeCompare(b.label, undefined, { numeric: true });
    })
    .map((item) => item.index);
};

export const MetricsTree: React.FC<MetricsTreeProps> = ({ data, dictionary }) => {
  const content = useMemo(() => {
    if (!isPlainObject(data)) {
      return null;
    }

    const entries = Object.entries(data).filter(([key, value]) => shouldRenderKey(key) && hasRenderableValue(value));

    if (!entries.length) {
      return null;
    }

    const renderSection = (path: string[], value: unknown): React.ReactNode => {
      if (!hasRenderableValue(value) || !isPlainObject(value)) {
        return null;
      }

      const sectionMeta = dictionary.getSectionMeta(path);
      const sectionTitle = sectionMeta?.label ?? humanizeKey(path[path.length - 1] ?? "");
      const sectionDescription = sectionMeta?.description;

      const childEntries = Object.entries(value).filter(
        ([childKey, childValue]) => shouldRenderKey(childKey) && hasRenderableValue(childValue)
      );

      if (!childEntries.length) {
        return null;
      }

      const primitiveItems: Array<{
        label: string;
        value: MetricValue;
        definition: FieldDefinition;
        description?: string;
      }> = [];

      const customNodes: React.ReactNode[] = [];
      const nestedSections: React.ReactNode[] = [];

      for (const [key, childValue] of childEntries) {
        const childPath = [...path, key];

        if (isPlainObject(childValue)) {
          const nested = renderSection(childPath, childValue);

          if (nested) {
            nestedSections.push(nested);
          }

          continue;
        }

        const normalizedValue = normalizePrimitiveValue(childValue);

        if (normalizedValue === null || normalizedValue === undefined) {
          continue;
        }

        const fieldDefinition = dictionary.getFieldMeta(childPath) ?? { label: humanizeKey(key) };
        const label = fieldDefinition.label ?? humanizeKey(key);

        if (fieldDefinition.display === "thresholdIndicator") {
          const numericValue = typeof normalizedValue === "number" ? normalizedValue : Number(normalizedValue);

          if (Number.isFinite(numericValue)) {
            customNodes.push(
              <ThresholdIndicator
                key={childPath.join(".")}
                mode={fieldDefinition.thresholdMode ?? "driving"}
                value={numericValue}
                helperText={fieldDefinition.description}
              />
            );
          }

          continue;
        }

        primitiveItems.push({
          label,
          value: normalizedValue,
          definition: fieldDefinition,
          description: fieldDefinition.description,
        });
      }

      if (!primitiveItems.length && !customNodes.length && !nestedSections.length) {
        return null;
      }

      const keyValueItems: KeyValueListItem[] = [];
      const sortOrder = sortItems(
        primitiveItems.map(({ label, definition }) => ({
          label,
          order: definition.order ?? Number.POSITIVE_INFINITY,
        }))
      );

      for (const index of sortOrder) {
        const { label, value: primitiveValue, definition, description } = primitiveItems[index];

        const item: KeyValueListItem = {
          key: label,
          value: primitiveValue,
          unit: definition.unit,
          description,
        };

        item.formatValue = (val) => formatValueByDefinition(val, definition);

        keyValueItems.push(item);
      }

      const thresholdGrid = customNodes.length ? (
        <div key="threshold-nodes" className="grid gap-4 md:grid-cols-2">
          {customNodes}
        </div>
      ) : null;

      return (
        <Section key={path.join(".")} title={sectionTitle} description={sectionDescription}>
          {thresholdGrid}
          {keyValueItems.length ? <KeyValueList items={keyValueItems} /> : null}
          {nestedSections}
        </Section>
      );
    };

    const nodes = entries
      .map(([key, value]) => renderSection([key], value))
      .filter((node): node is React.ReactNode => Boolean(node));

    if (!nodes.length) {
      return null;
    }

    return nodes;
  }, [data, dictionary]);

  if (!content) {
    return null;
  }

  return <div className="space-y-6">{content}</div>;
};
