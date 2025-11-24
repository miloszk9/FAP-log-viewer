import { useMemo } from "react";
import { combineFieldDefinitions, type FieldDefinition, type MetricsDictionary } from "@/lib/metrics";
import { getCommonFieldDefinitions, getCommonSectionDefinitions } from "@/i18n/common";
import type { SupportedLanguage } from "@/lib/i18n";
import { useLanguage } from "@/lib/i18n";

type DefinitionMap = Record<string, FieldDefinition>;
type DefinitionOverrides = Partial<Record<string, Partial<FieldDefinition>>>;

const baseSectionDefinitions: DefinitionMap = {
  overall: { label: "Overall averages" },
  "overall.duration": { label: "Duration" },
  driving: { label: "Driving" },
  "driving.acceleration": { label: "Acceleration" },
  engine: { label: "Engine" },
  "engine.battery": { label: "Battery" },
  "engine.coolantTemp": { label: "Coolant temperature" },
  "engine.engineWarmup": { label: "Engine warm-up" },
  "engine.oilCarbonate": { label: "Oil carbonate" },
  "engine.oilDilution": { label: "Oil dilution" },
  "engine.oilTemp": { label: "Oil temperature" },
  fap: { label: "FAP filter" },
  "fap.pressure": { label: "Pressure while driving" },
  "fap.pressure_idle": { label: "Pressure at idle" },
  "fap.soot": { label: "Soot" },
  "fap.temp": { label: "Temperature" },
  fapRegen: { label: "FAP regeneration" },
  "fapRegen.speed": { label: "Speed" },
  "fapRegen.fapTemp": { label: "Temperature" },
  "fapRegen.fapPressure": { label: "Pressure" },
  "fapRegen.fapSoot": { label: "Soot" },
  "fapRegen.fuelConsumption": { label: "Fuel consumption" },
};

const sectionOverrides: Record<SupportedLanguage, DefinitionOverrides> = {
  en: {},
  pl: {
    overall: { label: "Średnie ogólne" },
    "overall.duration": { label: "Czas trwania" },
    driving: { label: "Jazda" },
    "driving.acceleration": { label: "Przyspieszenie" },
    engine: { label: "Silnik" },
    "engine.battery": { label: "Akumulator" },
    "engine.coolantTemp": { label: "Temperatura płynu chłodzącego" },
    "engine.engineWarmup": { label: "Rozgrzewanie silnika" },
    "engine.oilCarbonate": { label: "Zawartość węglanów w oleju" },
    "engine.oilDilution": { label: "Rozcieńczenie oleju" },
    "engine.oilTemp": { label: "Temperatura oleju" },
    fap: { label: "Filtr FAP" },
    "fap.pressure": { label: "Ciśnienie podczas jazdy" },
    "fap.pressure_idle": { label: "Ciśnienie na biegu jałowym" },
    "fap.soot": { label: "Sadza" },
    "fap.temp": { label: "Temperatura" },
    fapRegen: { label: "Regeneracja FAP" },
    "fapRegen.speed": { label: "Prędkość" },
    "fapRegen.fapTemp": { label: "Temperatura" },
    "fapRegen.fapPressure": { label: "Ciśnienie" },
    "fapRegen.fapSoot": { label: "Sadza" },
    "fapRegen.fuelConsumption": { label: "Zużycie paliwa" },
  },
};

const baseFieldOverrides: DefinitionMap = {
  "driving.fuelConsumption_l100km": { label: "Fuel consumption", unit: "L/100km" },
  "fap.pressure_idle.avg_mbar": {
    label: "Average idle pressure",
    unit: "mbar",
    display: "thresholdIndicator",
    thresholdMode: "idle",
  },
  "fap.pressure.avg_mbar": {
    label: "Average driving pressure",
    unit: "mbar",
  },
  "fap.pressure.max_mbar": {
    label: "Maximum pressure",
    unit: "mbar",
    display: "thresholdIndicator",
    thresholdMode: "fapMaxPressure",
  },
  "engine.coolantTemp.max_c": {
    label: "Max coolant temperature",
    unit: "°C",
    display: "thresholdIndicator",
    thresholdMode: "coolantMax",
  },
  "engine.oilTemp.max_c": {
    label: "Max oil temperature",
    unit: "°C",
    display: "thresholdIndicator",
    thresholdMode: "oilMax",
  },
};

const fieldOverridesByLanguage: Record<SupportedLanguage, DefinitionOverrides> = {
  en: {},
  pl: {
    "driving.fuelConsumption_l100km": { label: "Zużycie paliwa" },
    "fap.pressure_idle.avg_mbar": { label: "Średnie ciśnienie na biegu jałowym" },
    "fap.pressure.avg_mbar": { label: "Średnie ciśnienie podczas jazdy" },
    "fap.pressure.max_mbar": { label: "Maksymalne ciśnienie" },
    "engine.coolantTemp.max_c": { label: "Maksymalna temperatura płynu chłodzącego" },
    "engine.oilTemp.max_c": { label: "Maksymalna temperatura oleju" },
  },
};

const mergeDefinitionMaps = (base: DefinitionMap, overrides?: DefinitionOverrides): DefinitionMap => {
  if (!overrides || Object.keys(overrides).length === 0) {
    return base;
  }

  const merged: DefinitionMap = {};
  const keys = new Set([...Object.keys(base), ...Object.keys(overrides)]);

  for (const key of keys) {
    const baseDefinition = base[key];
    const overrideDefinition = overrides[key];

    if (baseDefinition) {
      merged[key] = {
        ...baseDefinition,
        ...(overrideDefinition ?? {}),
      };
      continue;
    }

    if (overrideDefinition) {
      merged[key] = { ...(overrideDefinition as FieldDefinition) };
    }
  }

  return merged;
};

const sectionDefinitionsByLanguage: Record<SupportedLanguage, DefinitionMap> = {
  en: baseSectionDefinitions,
  pl: mergeDefinitionMaps(baseSectionDefinitions, sectionOverrides.pl),
};

const fieldDefinitionsByLanguage: Record<SupportedLanguage, DefinitionMap> = {
  en: baseFieldOverrides,
  pl: mergeDefinitionMaps(baseFieldOverrides, fieldOverridesByLanguage.pl),
};

export const createSummaryDictionary = (language: SupportedLanguage): MetricsDictionary => {
  const sectionDefinitions = sectionDefinitionsByLanguage[language];
  const fieldOverrides = fieldDefinitionsByLanguage[language];
  const commonSections = getCommonSectionDefinitions(language);
  const commonFields = getCommonFieldDefinitions(language);

  const getSectionMeta = (path: string[]): FieldDefinition | undefined => {
    if (!path.length) {
      return undefined;
    }

    const pathKey = path.join(".");
    const fallbackKey = path[path.length - 1];
    const specific = sectionDefinitions[pathKey];
    const generic = commonSections[fallbackKey];

    return combineFieldDefinitions(specific, generic, fallbackKey);
  };

  const getFieldMeta = (path: string[]): FieldDefinition | undefined => {
    if (!path.length) {
      return undefined;
    }

    const pathKey = path.join(".");
    const fallbackKey = path[path.length - 1];
    const specific = fieldOverrides[pathKey];
    const generic = commonFields[fallbackKey];

    return combineFieldDefinitions(specific, generic, fallbackKey);
  };

  return {
    getSectionMeta,
    getFieldMeta,
  };
};

export const useSummaryDictionary = (): MetricsDictionary => {
  const { language } = useLanguage();

  return useMemo(() => createSummaryDictionary(language), [language]);
};
