import { useMemo } from "react";
import { combineFieldDefinitions, type FieldDefinition, type MetricsDictionary } from "@/lib/metrics";
import { getCommonFieldDefinitions, getCommonSectionDefinitions } from "@/i18n/common";
import type { SupportedLanguage } from "@/lib/i18n";
import { useLanguage } from "@/lib/i18n";

type DefinitionMap = Record<string, FieldDefinition>;
type DefinitionOverrides = Partial<Record<string, Partial<FieldDefinition>>>;

const baseSectionDefinitions: DefinitionMap = {
  overall: { label: "Overall metrics" },
  "overall.duration": { label: "Duration breakdown" },
  driving: { label: "Driving" },
  "driving.acceleration": { label: "Acceleration" },
  "driving.fuelConsumption": { label: "Fuel consumption" },
  "driving.revs": { label: "Engine RPM" },
  "driving.speed": { label: "Speed" },
  engine: { label: "Engine" },
  "engine.battery": { label: "Battery" },
  "engine.coolantTemp": { label: "Coolant temperature" },
  "engine.engineWarmup": { label: "Engine warm-up" },
  "engine.oilTemp": { label: "Oil temperature" },
  fap: { label: "FAP filter" },
  "fap.additive": { label: "Additive" },
  "fap.deposits": { label: "Deposits" },
  "fap.life": { label: "Filter life" },
  "fap.pressure": { label: "Pressure while driving" },
  "fap.pressure_idle": { label: "Pressure at idle" },
  "fap.soot": { label: "Soot" },
  "fap.temp": { label: "Temperature" },
  fapRegen: { label: "FAP regeneration" },
  "fapRegen.speed": { label: "Speed" },
  "fapRegen.fapTemp": { label: "Temperature" },
  "fapRegen.fapPressure": { label: "Pressure" },
  "fapRegen.revs": { label: "Engine RPM" },
  "fapRegen.fapSoot": { label: "Soot" },
  "fapRegen.fuelConsumption": { label: "Fuel consumption" },
  date: { label: "Log timestamps" },
};

const sectionOverrides: Record<SupportedLanguage, DefinitionOverrides> = {
  en: {},
  pl: {
    overall: { label: "Metryki ogólne" },
    "overall.duration": { label: "Podział czasu" },
    driving: { label: "Jazda" },
    "driving.acceleration": { label: "Przyspieszenie" },
    "driving.fuelConsumption": { label: "Zużycie paliwa" },
    "driving.revs": { label: "Obroty silnika" },
    "driving.speed": { label: "Prędkość" },
    engine: { label: "Silnik" },
    "engine.battery": { label: "Akumulator" },
    "engine.coolantTemp": { label: "Temperatura płynu chłodzącego" },
    "engine.engineWarmup": { label: "Rozgrzewanie silnika" },
    "engine.oilTemp": { label: "Temperatura oleju" },
    fap: { label: "Filtr FAP" },
    "fap.additive": { label: "Dodatek" },
    "fap.deposits": { label: "Osady" },
    "fap.life": { label: "Żywotność filtra" },
    "fap.pressure": { label: "Ciśnienie podczas jazdy" },
    "fap.pressure_idle": { label: "Ciśnienie na biegu jałowym" },
    "fap.soot": { label: "Sadza" },
    "fap.temp": { label: "Temperatura" },
    fapRegen: { label: "Regeneracja FAP" },
    "fapRegen.speed": { label: "Prędkość" },
    "fapRegen.fapTemp": { label: "Temperatura" },
    "fapRegen.fapPressure": { label: "Ciśnienie" },
    "fapRegen.revs": { label: "Obroty silnika" },
    "fapRegen.fapSoot": { label: "Sadza" },
    "fapRegen.fuelConsumption": { label: "Zużycie paliwa" },
    date: { label: "Znaczniki czasu logu" },
  },
};

const baseFieldOverrides: DefinitionMap = {
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
  "fap.additive.vol_ml": { label: "Additive volume", unit: "mL" },
  "fap.additive.remain_ml": {
    label: "Additive remaining",
    unit: "mL",
    display: "thresholdIndicator",
    thresholdMode: "additiveRemain",
  },
  "fap.deposits.percentage_perc": { label: "Deposits", unit: "%" },
  "fap.deposits.weight_gram": { label: "Deposits weight", unit: "g" },
  "fap.life.life_km": { label: "Estimated lifetime", unit: "km" },
  "fap.life.left_km": {
    label: "Remaining distance",
    unit: "km",
    display: "thresholdIndicator",
    thresholdMode: "fapLifeLeft",
  },
  "fap.soot.start_gl": { label: "Soot start", unit: "g/L" },
  "fap.soot.end_gl": { label: "Soot end", unit: "g/L" },
  "fap.soot.diff_gl": { label: "Soot difference", unit: "g/L" },
  "fap.temp.avg_c": { label: "Average temperature", unit: "°C" },
  "fap.temp.max_c": { label: "Max temperature", unit: "°C" },
  "fap.temp.min_c": { label: "Min temperature", unit: "°C" },
  "fap.lastRegen_km": {
    label: "Last regeneration distance",
    unit: "km",
    display: "thresholdIndicator",
    thresholdMode: "lastRegenDistance",
  },
  "fapRegen.duration_sec": { label: "Duration", formatter: "duration" },
  "fapRegen.distance_km": { label: "Distance", unit: "km" },
  "fapRegen.speed.avg_kmh": { label: "Average speed", unit: "km/h" },
  "fapRegen.fapTemp.avg_c": { label: "Average temperature", unit: "°C" },
  "fapRegen.fapTemp.max_c": { label: "Max temperature", unit: "°C" },
  "fapRegen.fapPressure.avg_mbar": { label: "Average pressure", unit: "mbar" },
  "fapRegen.fapPressure.max_mbar": { label: "Max pressure", unit: "mbar" },
  "fapRegen.fapPressure.min_mbar": { label: "Min pressure", unit: "mbar" },
  "fapRegen.fuelConsumption.regen_l100km": { label: "Fuel during regeneration", unit: "L/100km" },
  "fapRegen.fuelConsumption.nonRegen_l100km": {
    label: "Fuel outside regeneration",
    unit: "L/100km",
  },
  "overall.duration.overall_sec": { label: "Total duration", formatter: "duration" },
};

const fieldOverridesByLanguage: Record<SupportedLanguage, DefinitionOverrides> = {
  en: {},
  pl: {
    "engine.coolantTemp.max_c": { label: "Maksymalna temperatura płynu chłodzącego" },
    "engine.oilTemp.max_c": { label: "Maksymalna temperatura oleju" },
    "fap.pressure_idle.avg_mbar": { label: "Średnie ciśnienie na biegu jałowym" },
    "fap.pressure.avg_mbar": { label: "Średnie ciśnienie podczas jazdy" },
    "fap.pressure.max_mbar": { label: "Maksymalne ciśnienie" },
    "fap.additive.vol_ml": { label: "Objętość dodatku" },
    "fap.additive.remain_ml": { label: "Pozostało dodatku" },
    "fap.deposits.percentage_perc": { label: "Osady" },
    "fap.deposits.weight_gram": { label: "Masa osadów" },
    "fap.life.life_km": { label: "Szacowana żywotność" },
    "fap.life.left_km": { label: "Pozostały dystans" },
    "fap.lastRegen_km": { label: "Dystans od ostatniej regeneracji" },
    "fap.soot.start_gl": { label: "Sadza na początku" },
    "fap.soot.end_gl": { label: "Sadza na końcu" },
    "fap.soot.diff_gl": { label: "Zmiana ilości sadzy" },
    "fap.temp.avg_c": { label: "Średnia temperatura" },
    "fap.temp.max_c": { label: "Maksymalna temperatura" },
    "fap.temp.min_c": { label: "Minimalna temperatura" },
    "fapRegen.duration_sec": { label: "Czas trwania" },
    "fapRegen.distance_km": { label: "Dystans" },
    "fapRegen.speed.avg_kmh": { label: "Średnia prędkość" },
    "fapRegen.fapTemp.avg_c": { label: "Średnia temperatura" },
    "fapRegen.fapTemp.max_c": { label: "Maksymalna temperatura" },
    "fapRegen.fapPressure.avg_mbar": { label: "Średnie ciśnienie" },
    "fapRegen.fapPressure.max_mbar": { label: "Maksymalne ciśnienie" },
    "fapRegen.fapPressure.min_mbar": { label: "Minimalne ciśnienie" },
    "fapRegen.fuelConsumption.regen_l100km": { label: "Spalanie podczas regeneracji" },
    "fapRegen.fuelConsumption.nonRegen_l100km": { label: "Spalanie poza regeneracją" },
    "overall.duration.overall_sec": { label: "Całkowity czas trwania" },
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

export const createAnalysisDictionary = (language: SupportedLanguage): MetricsDictionary => {
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

export const useAnalysisDictionary = (): MetricsDictionary => {
  const { language } = useLanguage();

  return useMemo(() => createAnalysisDictionary(language), [language]);
};
