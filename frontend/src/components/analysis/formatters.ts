export type Primitive = string | number | boolean | null | undefined;

export const hasValues = (...values: Primitive[]): boolean => {
  return values.some((value) => value !== null && value !== undefined);
};

export const formatDuration = (value: Primitive): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  if (value <= 0) {
    return "0 s";
  }

  const totalSeconds = Math.round(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  if (minutes > 0) {
    return seconds > 0 ? `${minutes} min ${seconds} s` : `${minutes} min`;
  }

  return `${seconds} s`;
};

export const formatDate = (value: Primitive, locale: string = undefined): string => {
  if (typeof value !== "string") {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(locale ?? undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
