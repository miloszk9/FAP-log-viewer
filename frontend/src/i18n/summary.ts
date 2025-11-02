import { combineFieldDefinitions, type FieldDefinition, type MetricsDictionary } from "@/lib/metrics";
import { commonFieldDefinitions, commonSectionDefinitions } from "@/i18n/common";

const sectionDefinitions: Record<string, FieldDefinition> = {
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

const fieldOverrides: Record<string, FieldDefinition> = {
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
    display: "thresholdIndicator",
    thresholdMode: "driving",
  },
};

const getSectionMeta = (path: string[]): FieldDefinition | undefined => {
  if (!path.length) {
    return undefined;
  }

  const pathKey = path.join(".");
  const fallbackKey = path[path.length - 1];
  const specific = sectionDefinitions[pathKey];
  const generic = commonSectionDefinitions[fallbackKey];

  return combineFieldDefinitions(specific, generic, fallbackKey);
};

const getFieldMeta = (path: string[]): FieldDefinition | undefined => {
  if (!path.length) {
    return undefined;
  }

  const pathKey = path.join(".");
  const fallbackKey = path[path.length - 1];
  const specific = fieldOverrides[pathKey];
  const generic = commonFieldDefinitions[fallbackKey];

  return combineFieldDefinitions(specific, generic, fallbackKey);
};

export const summaryDictionary: MetricsDictionary = {
  getSectionMeta,
  getFieldMeta,
};
