import React from "react";
import { MetricsTree } from "@/components/shared/MetricsTree";
import { summaryDictionary } from "@/i18n/summary";
import type { FapAverageJson } from "@/types";

interface SummaryGridProps {
  data: FapAverageJson | null | undefined;
}

export const SummaryGrid: React.FC<SummaryGridProps> = ({ data }) => {
  return <MetricsTree data={data as Record<string, unknown> | null | undefined} dictionary={summaryDictionary} />;
};
