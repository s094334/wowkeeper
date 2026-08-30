export const DAYS_PER_CYCLE_MONTH = 30;
export const SOON_WITHIN_DAYS = 15;

const TAIPEI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

export function taipeiDayNumber(at: Date = new Date()): number {
  const shifted = new Date(at.getTime() + TAIPEI_UTC_OFFSET_MS);
  return Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
}

/** 台北當地的今天，YYYY-MM-DD。 */
export function taipeiToday(at: Date = new Date()): string {
  return new Date(taipeiDayNumber(at)).toISOString().slice(0, 10);
}
