import React from "react";
import { MetricsTree } from "@/components/shared/MetricsTree";
import { useSummaryDictionary } from "@/i18n/summary";
import type { FapAverageJson } from "@/types";

interface SummaryGridProps {
  data: FapAverageJson | null | undefined;
}

export const SummaryGrid: React.FC<SummaryGridProps> = ({ data }) => {
  const dictionary = useSummaryDictionary();

  return <MetricsTree data={data as Record<string, unknown> | null | undefined} dictionary={dictionary} />;
};
