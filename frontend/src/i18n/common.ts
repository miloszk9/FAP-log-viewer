import type { FieldDefinition } from "@/lib/metrics";
import type { SupportedLanguage } from "@/lib/i18n";

type DefinitionMap = Record<string, FieldDefinition>;
type DefinitionOverrides = Partial<Record<string, Partial<FieldDefinition>>>;

const baseCommonSectionDefinitions: DefinitionMap = {
  date: { label: "Timestamps" },
  duration: { label: "Duration" },
  acceleration: { label: "Acceleration" },
  fuelConsumption: { label: "Fuel consumption" },
  revs: { label: "Engine RPM" },
  speed: { label: "Speed" },
  battery: { label: "Battery" },
  coolantTemp: { label: "Coolant temperature" },
  engineWarmup: { label: "Engine warm-up" },
  oilTemp: { label: "Oil temperature" },
  additive: { label: "Additive" },
  deposits: { label: "Deposits" },
  life: { label: "Filter life" },
  pressure: { label: "Pressure" },
  pressure_idle: { label: "Idle pressure" },
  soot: { label: "Soot" },
  temp: { label: "Temperature" },
  speedDriving: { label: "Driving" },
  externalTemp: { label: "External temperature" },
  beforeDrive: { label: "Before drive" },
  engineRunning: { label: "Engine running" },
  bySpeedRange: { label: "Speed ranges" },
};

const commonSectionOverrides: Record<SupportedLanguage, DefinitionOverrides> = {
  en: {},
  pl: {
    date: { label: "Znaczniki czasu" },
    duration: { label: "Czas trwania" },
    acceleration: { label: "Przyspieszenie" },
    fuelConsumption: { label: "Zużycie paliwa" },
    revs: { label: "Obroty silnika" },
    speed: { label: "Prędkość" },
    battery: { label: "Akumulator" },
    coolantTemp: { label: "Temperatura płynu chłodzącego" },
    engineWarmup: { label: "Rozgrzewanie silnika" },
    oilTemp: { label: "Temperatura oleju" },
    additive: { label: "Dodatek" },
    deposits: { label: "Osady" },
    life: { label: "Żywotność filtra" },
    pressure: { label: "Ciśnienie" },
    pressure_idle: { label: "Ciśnienie na biegu jałowym" },
    soot: { label: "Sadza" },
    temp: { label: "Temperatura" },
    speedDriving: { label: "Jazda" },
    externalTemp: { label: "Temperatura zewnętrzna" },
    beforeDrive: { label: "Przed jazdą" },
    engineRunning: { label: "Praca silnika" },
    bySpeedRange: { label: "Zakresy prędkości" },
  },
};

const baseCommonFieldDefinitions: DefinitionMap = {
  date: { label: "Date", formatter: "datetime" },
  start: { label: "Start time" },
  end: { label: "End time" },
  distance_km: { label: "Distance", unit: "km" },
  overall_sec: { label: "Total duration", formatter: "duration" },
  engineOff_sec: { label: "Engine off", formatter: "duration" },
  engineOn_sec: { label: "Engine on", formatter: "duration" },
  idle_sec: { label: "Idle time", formatter: "duration" },
  driving_sec: { label: "Driving time", formatter: "duration" },
  avg_c: { label: "Average temperature", unit: "°C" },
  max_c: { label: "Maximum temperature", unit: "°C" },
  min_c: { label: "Minimum temperature", unit: "°C" },
  avg_perc: { label: "Average", unit: "%" },
  max_perc: { label: "Maximum", unit: "%" },
  min_perc: { label: "Minimum", unit: "%" },
  total_l: { label: "Total fuel", unit: "L" },
  avg_l100km: { label: "Average fuel", unit: "L/100km" },
  min: { label: "Minimum" },
  max: { label: "Maximum" },
  avg: { label: "Average" },
  avgDriving: { label: "Average while driving" },
  avg_kmh: { label: "Average speed", unit: "km/h" },
  max_kmh: { label: "Maximum speed", unit: "km/h" },
  min_kmh: { label: "Minimum speed", unit: "km/h" },
  min_v: { label: "Minimum voltage", unit: "V" },
  max_v: { label: "Maximum voltage", unit: "V" },
  avg_v: { label: "Average voltage", unit: "V" },
  beforeDrive_v: { label: "Voltage before drive", unit: "V" },
  engineRunning_v: { label: "Voltage with engine running", unit: "V" },
  coolant_sec: { label: "Coolant warm-up", formatter: "duration" },
  oil_sec: { label: "Oil warm-up", formatter: "duration" },
  errors: { label: "Errors" },
  oilCarbonate_perc: { label: "Oil carbonate", unit: "%" },
  oilDilution_perc: { label: "Oil dilution", unit: "%" },
  vol_ml: { label: "Volume", unit: "mL" },
  remain_ml: { label: "Remaining", unit: "mL" },
  percentage_perc: { label: "Percentage", unit: "%" },
  weight_gram: { label: "Weight", unit: "g" },
  lastRegen_km: { label: "Last regeneration distance", unit: "km" },
  last10Regen_km: { label: "Last 10 regenerations", unit: "km" },
  life_km: { label: "Filter lifetime", unit: "km" },
  left_km: { label: "Remaining life", unit: "km" },
  avg_mbar: { label: "Average pressure", unit: "mbar" },
  max_mbar: { label: "Maximum pressure", unit: "mbar" },
  min_mbar: { label: "Minimum pressure", unit: "mbar" },
  start_gl: { label: "Start", unit: "g/L" },
  end_gl: { label: "End", unit: "g/L" },
  diff_gl: { label: "Difference", unit: "g/L" },
  min_gl: { label: "Minimum soot", unit: "g/L" },
  max_gl: { label: "Maximum soot", unit: "g/L" },
  regen_l100km: { label: "Fuel during regeneration", unit: "L/100km" },
  nonRegen_l100km: { label: "Fuel outside regeneration", unit: "L/100km" },
  previousRegen_km: { label: "Distance from last regeneration", unit: "km" },
  numberOfRegens: { label: "Number of regenerations" },
  duration_sec: { label: "Duration", formatter: "duration" },
  distance_km_total: { label: "Distance", unit: "km" },
  distance: { label: "Distance" },
  "5-15_l100km": { label: "Consumption at 5-15 km/h", unit: "L/100km" },
  "15-25_l100km": { label: "Consumption at 15-25 km/h", unit: "L/100km" },
  "25-35_l100km": { label: "Consumption at 25-35 km/h", unit: "L/100km" },
  "35-45_l100km": { label: "Consumption at 35-45 km/h", unit: "L/100km" },
  "45-55_l100km": { label: "Consumption at 45-55 km/h", unit: "L/100km" },
  "55-65_l100km": { label: "Consumption at 55-65 km/h", unit: "L/100km" },
  "65-75_l100km": { label: "Consumption at 65-75 km/h", unit: "L/100km" },
  "75-85_l100km": { label: "Consumption at 75-85 km/h", unit: "L/100km" },
  "85-95_l100km": { label: "Consumption at 85-95 km/h", unit: "L/100km" },
  "95-105_l100km": { label: "Consumption at 95-105 km/h", unit: "L/100km" },
  "105-115_l100km": { label: "Consumption at 105-115 km/h", unit: "L/100km" },
  "115-125_l100km": { label: "Consumption at 115-125 km/h", unit: "L/100km" },
  "125-135_l100km": { label: "Consumption at 125-135 km/h", unit: "L/100km" },
  "135-145_l100km": { label: "Consumption at 135-145 km/h", unit: "L/100km" },
  "145-155_l100km": { label: "Consumption at 145-155 km/h", unit: "L/100km" },
  "155-165_l100km": { label: "Consumption at 155-165 km/h", unit: "L/100km" },
  "165-175_l100km": { label: "Consumption at 165-175 km/h", unit: "L/100km" },
  "175-185_l100km": { label: "Consumption at 175-185 km/h", unit: "L/100km" },
  "185-195_l100km": { label: "Consumption at 185-195 km/h", unit: "L/100km" },
  "195-200_l100km": { label: "Consumption at 195-200 km/h", unit: "L/100km" },
  "200+_l100km": { label: "Consumption at 200+ km/h", unit: "L/100km" },
};

const commonFieldOverrides: Record<SupportedLanguage, DefinitionOverrides> = {
  en: {},
  pl: {
    date: { label: "Data" },
    start: { label: "Czas rozpoczęcia" },
    end: { label: "Czas zakończenia" },
    distance_km: { label: "Dystans" },
    overall_sec: { label: "Całkowity czas trwania" },
    engineOff_sec: { label: "Silnik wyłączony" },
    engineOn_sec: { label: "Silnik włączony" },
    idle_sec: { label: "Czas na biegu jałowym" },
    driving_sec: { label: "Czas jazdy" },
    avg_c: { label: "Średnia temperatura" },
    max_c: { label: "Maksymalna temperatura" },
    min_c: { label: "Minimalna temperatura" },
    avg_perc: { label: "Średnio" },
    max_perc: { label: "Maksymalnie" },
    min_perc: { label: "Minimalnie" },
    total_l: { label: "Całkowita ilość paliwa" },
    avg_l100km: { label: "Średnie spalanie" },
    min: { label: "Minimum" },
    max: { label: "Maksimum" },
    avg: { label: "Średnia" },
    avgDriving: { label: "Średnia podczas jazdy" },
    avg_kmh: { label: "Średnia prędkość" },
    max_kmh: { label: "Maksymalna prędkość" },
    min_kmh: { label: "Minimalna prędkość" },
    min_v: { label: "Minimalne napięcie" },
    max_v: { label: "Maksymalne napięcie" },
    avg_v: { label: "Średnie napięcie" },
    beforeDrive_v: { label: "Napięcie przed jazdą" },
    engineRunning_v: { label: "Napięcie przy pracującym silniku" },
    coolant_sec: { label: "Czas nagrzewania płynu chłodzącego" },
    oil_sec: { label: "Czas nagrzewania oleju" },
    errors: { label: "Liczba błędów" },
    oilCarbonate_perc: { label: "Zanieczyszczenie oleju" },
    oilDilution_perc: { label: "Rozcieńczenie oleju" },
    vol_ml: { label: "Objętość" },
    remain_ml: { label: "Pozostało" },
    percentage_perc: { label: "Procent" },
    weight_gram: { label: "Masa" },
    lastRegen_km: { label: "Dystans od ostatniej regeneracji" },
    last10Regen_km: { label: "Ostatnie 10 regeneracji" },
    life_km: { label: "Żywotność filtra" },
    left_km: { label: "Pozostała żywotność" },
    avg_mbar: { label: "Średnie ciśnienie" },
    max_mbar: { label: "Maksymalne ciśnienie" },
    min_mbar: { label: "Minimalne ciśnienie" },
    start_gl: { label: "Stan początkowy" },
    end_gl: { label: "Stan końcowy" },
    diff_gl: { label: "Różnica" },
    min_gl: { label: "Minimalna ilość sadzy" },
    max_gl: { label: "Maksymalna ilość sadzy" },
    regen_l100km: { label: "Spalanie podczas regeneracji" },
    nonRegen_l100km: { label: "Spalanie poza regeneracją" },
    previousRegen_km: { label: "Dystans od ostatniej regeneracji" },
    numberOfRegens: { label: "Liczba regeneracji" },
    duration_sec: { label: "Czas trwania" },
    distance_km_total: { label: "Dystans" },
    distance: { label: "Dystans" },
    "5-15_l100km": { label: "Spalanie przy 5-15 km/h" },
    "15-25_l100km": { label: "Spalanie przy 15-25 km/h" },
    "25-35_l100km": { label: "Spalanie przy 25-35 km/h" },
    "35-45_l100km": { label: "Spalanie przy 35-45 km/h" },
    "45-55_l100km": { label: "Spalanie przy 45-55 km/h" },
    "55-65_l100km": { label: "Spalanie przy 55-65 km/h" },
    "65-75_l100km": { label: "Spalanie przy 65-75 km/h" },
    "75-85_l100km": { label: "Spalanie przy 75-85 km/h" },
    "85-95_l100km": { label: "Spalanie przy 85-95 km/h" },
    "95-105_l100km": { label: "Spalanie przy 95-105 km/h" },
    "105-115_l100km": { label: "Spalanie przy 105-115 km/h" },
    "115-125_l100km": { label: "Spalanie przy 115-125 km/h" },
    "125-135_l100km": { label: "Spalanie przy 125-135 km/h" },
    "135-145_l100km": { label: "Spalanie przy 135-145 km/h" },
    "145-155_l100km": { label: "Spalanie przy 145-155 km/h" },
    "155-165_l100km": { label: "Spalanie przy 155-165 km/h" },
    "165-175_l100km": { label: "Spalanie przy 165-175 km/h" },
    "175-185_l100km": { label: "Spalanie przy 175-185 km/h" },
    "185-195_l100km": { label: "Spalanie przy 185-195 km/h" },
    "195-200_l100km": { label: "Spalanie przy 195-200 km/h" },
    "200+_l100km": { label: "Spalanie powyżej 200 km/h" },
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

const commonSectionDefinitionsByLanguage: Record<SupportedLanguage, DefinitionMap> = {
  en: baseCommonSectionDefinitions,
  pl: mergeDefinitionMaps(baseCommonSectionDefinitions, commonSectionOverrides.pl),
};

const commonFieldDefinitionsByLanguage: Record<SupportedLanguage, DefinitionMap> = {
  en: baseCommonFieldDefinitions,
  pl: mergeDefinitionMaps(baseCommonFieldDefinitions, commonFieldOverrides.pl),
};

export const getCommonSectionDefinitions = (language: SupportedLanguage): DefinitionMap =>
  commonSectionDefinitionsByLanguage[language];

export const getCommonFieldDefinitions = (language: SupportedLanguage): DefinitionMap =>
  commonFieldDefinitionsByLanguage[language];
