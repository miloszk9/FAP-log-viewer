import { combineFieldDefinitions, type FieldDefinition, type MetricsDictionary } from "@/lib/metrics";
import { commonFieldDefinitions, commonSectionDefinitions } from "@/i18n/common";

const sectionDefinitions: Record<string, FieldDefinition> = {
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

const fieldOverrides: Record<string, FieldDefinition> = {
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
  "fap.additive.vol_ml": { label: "Additive volume", unit: "mL" },
  "fap.additive.remain_ml": { label: "Additive remaining", unit: "mL" },
  "fap.deposits.percentage_perc": { label: "Deposits", unit: "%" },
  "fap.deposits.weight_gram": { label: "Deposits weight", unit: "g" },
  "fap.life.life_km": { label: "Estimated lifetime", unit: "km" },
  "fap.life.left_km": { label: "Remaining distance", unit: "km" },
  "fap.soot.start_gl": { label: "Soot start", unit: "g/L" },
  "fap.soot.end_gl": { label: "Soot end", unit: "g/L" },
  "fap.soot.diff_gl": { label: "Soot difference", unit: "g/L" },
  "fap.temp.avg_c": { label: "Average temperature", unit: "°C" },
  "fap.temp.max_c": { label: "Max temperature", unit: "°C" },
  "fap.temp.min_c": { label: "Min temperature", unit: "°C" },
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

export const analysisDictionary: MetricsDictionary = {
  getSectionMeta,
  getFieldMeta,
};
