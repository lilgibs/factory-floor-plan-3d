/**
 * Formatting lives here rather than in the data.
 *
 * Storing "66,37%" makes a reading unusable for anything except printing it,
 * so the numbers stay numbers all the way through and only become text at the
 * point they are shown.
 */

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export function percent(ratio: number, digits = 0): string {
  if (!Number.isFinite(ratio)) return '0%';
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function seconds(value: number): string {
  return `${value.toFixed(1)} s`;
}

export function units(value: number): string {
  return `${number.format(value)} pcs`;
}

export function kwh(value: number): string {
  return `${number.format(value)} kWh`;
}

/** 148 minutes reads as 2h 28m, which is how a shift is actually discussed. */
export function duration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
