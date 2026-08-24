const SOON_WITHIN_DAYS = 15;
const DAYS_PER_CYCLE_MONTH = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type LampStatus = "overdue" | "soon" | "ok";

export type PartLike = {
  name: string;
  cycleMonths: number;
  /** YYYY-MM-DD */
  lastReplacedAt: string;
};

export type ApplianceStatus = {
  status: LampStatus;
  worst: { name: string; daysLeft: number } | null;
};

function dayNumberOf(dateText: string, plusDays = 0): number {
  const [year, month, day] = dateText.split("-").map(Number);
  return Date.UTC(year, month - 1, day + plusDays);
}

function todayDayNumber(today: Date): number {
  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
}

function dueDayNumber(part: PartLike): number {
  return dayNumberOf(
    part.lastReplacedAt,
    part.cycleMonths * DAYS_PER_CYCLE_MONTH,
  );
}

export function daysUntilDue(part: PartLike, today: Date = new Date()): number {
  return Math.round((dueDayNumber(part) - todayDayNumber(today)) / MS_PER_DAY);
}

export function dueDateOf(part: PartLike): string {
  return new Date(dueDayNumber(part)).toISOString().slice(0, 10);
}

export function statusOf(daysLeft: number): LampStatus {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= SOON_WITHIN_DAYS) return "soon";
  return "ok";
}

export function computeApplianceStatus(
  parts: readonly PartLike[],
  today: Date = new Date(),
): ApplianceStatus {
  let worst: { name: string; daysLeft: number } | null = null;

  for (const part of parts) {
    const daysLeft = daysUntilDue(part, today);
    if (!worst || daysLeft < worst.daysLeft) {
      worst = { name: part.name, daysLeft };
    }
  }

  if (!worst) return { status: "ok", worst: null };
  return { status: statusOf(worst.daysLeft), worst };
}
