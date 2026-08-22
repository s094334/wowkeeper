const SOON_WITHIN_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ApplianceStatus = {
  status: "overdue" | "soon" | "ok";
  statusText: string;
};

type PartLike = {
  name: string;
  cycleMonths: number;
  lastReplacedAt: string;
};

function addMonths(dateText: string, months: number): Date {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, day));
}

function daysBetween(target: Date, today: Date): number {
  const targetUtc = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return Math.round((targetUtc - todayUtc) / MS_PER_DAY);
}

/**
 * 依耗材的保養週期（cycleMonths）與上次更換/清潔日期（lastReplacedAt）相對今天算出家電狀態。
 * 取所有耗材中最急迫（daysLeft 最小）的一筆決定 status，並用它組出 statusText，
 * 例如「濾網逾期 6 天」（overdue）、「濾芯 3 天後」（soon）。沒有耗材或都還很久則回傳 ok。
 */
export function computeApplianceStatus(
  parts: PartLike[],
  today: Date = new Date(),
): ApplianceStatus {
  let worst: { daysLeft: number; name: string } | null = null;

  for (const part of parts) {
    const daysLeft = daysBetween(
      addMonths(part.lastReplacedAt, part.cycleMonths),
      today,
    );
    if (!worst || daysLeft < worst.daysLeft) {
      worst = { daysLeft, name: part.name };
    }
  }

  if (!worst) return { status: "ok", statusText: "" };

  if (worst.daysLeft < 0) {
    return {
      status: "overdue",
      statusText: `${worst.name}逾期 ${Math.abs(worst.daysLeft)} 天`,
    };
  }
  if (worst.daysLeft <= SOON_WITHIN_DAYS) {
    return {
      status: "soon",
      statusText: `${worst.name} ${worst.daysLeft} 天後`,
    };
  }
  return { status: "ok", statusText: "" };
}
