import React from "react";
import { MetricsTree } from "@/components/shared/MetricsTree";
import { useAnalysisDictionary } from "@/i18n/analysis";
import type { FapAnalysisJson } from "@/types";

interface AnalysisSectionsProps {
  data: FapAnalysisJson | null | undefined;
}

export const AnalysisSections: React.FC<AnalysisSectionsProps> = ({ data }) => {
  const dictionary = useAnalysisDictionary();

  return <MetricsTree data={data as Record<string, unknown> | null | undefined} dictionary={dictionary} />;
};
