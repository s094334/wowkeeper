import { DAYS_PER_CYCLE_MONTH } from "../../shared/maintenance.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dayNumberOf(dateText: string): number {
  const [year, month, day] = dateText.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((dayNumberOf(to) - dayNumberOf(from)) / MS_PER_DAY);
}

export const DUE_AT_SQL = `date(parts.last_replaced_at, '+' || (parts.cycle_months * ${DAYS_PER_CYCLE_MONTH}) || ' days')`;
