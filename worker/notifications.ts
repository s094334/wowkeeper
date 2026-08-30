import { SOON_WITHIN_DAYS } from "../shared/maintenance.js";
import { DUE_AT_SQL, daysBetween } from "./lib/date.js";

export const NOTIFY_SECOND_LEAD_DAYS = 7;

export const NOTIFY_THIRD_OVERDUE_DAYS = 1;

export const NOTIFY_MIN_GAP_DAYS = 3;

export type NotifyStage = "soon" | "due" | "overdue";

export type OverduePart = {
  applianceId: string;
  partId: string;
  partName: string;
  applianceName: string;
  action: "replace" | "clean";
  dueAt: string;
  stage: NotifyStage;
  daysOverdue: number;
};

export type UserDigest = {
  userId: string;
  email: string;
  nickname: string;
  parts: OverduePart[];
};

type OverdueRow = {
  appliance_id: string;
  user_id: string;
  email: string;
  nickname: string;
  appliance_name: string;
  part_id: string;
  part_name: string;
  action: "replace" | "clean";
  due_at: string;
  stage: NotifyStage;
};

function dueOffset(days: number): string {
  const sign = days < 0 ? "-" : "+";
  return `date(${DUE_AT_SQL}, '${sign}${Math.abs(days)} days')`;
}

const MILESTONES = [
  -SOON_WITHIN_DAYS,
  -NOTIFY_SECOND_LEAD_DAYS,
  NOTIFY_THIRD_OVERDUE_DAYS,
];

const OVERDUE_SQL = `
  SELECT
    users.id AS user_id,
    users.email,
    users.nickname,
    appliances.id AS appliance_id,
    appliances.name AS appliance_name,
    parts.id AS part_id,
    parts.name AS part_name,
    parts.action,
    ${DUE_AT_SQL} AS due_at,
    CASE
      WHEN ${DUE_AT_SQL} > ? THEN 'soon'
      WHEN ${DUE_AT_SQL} = ? THEN 'due'
      ELSE 'overdue'
    END AS stage
  FROM parts
  JOIN appliances ON appliances.id = parts.appliance_id
  JOIN users ON users.id = appliances.user_id
  WHERE users.notifications_enabled = 1
    AND (
${MILESTONES.map(
  (offset) => `      (
        (
          parts.last_notified_at IS NULL
          OR parts.last_notified_at <= ${dueOffset(offset - NOTIFY_MIN_GAP_DAYS)}
        )
        AND ? >= ${dueOffset(offset)}
      )`,
).join("\n      OR\n")}
    )
  ORDER BY users.id, due_at ASC`;

export async function findOverdueByUser(
  env: Env,
  today: string,
): Promise<UserDigest[]> {
  const { results } = await env.DB.prepare(OVERDUE_SQL)
    .bind(today, today, today, today, today)
    .all<OverdueRow>();

  const byUser = new Map<string, UserDigest>();

  for (const row of results) {
    let digest = byUser.get(row.user_id);
    if (!digest) {
      digest = {
        userId: row.user_id,
        email: row.email,
        nickname: row.nickname,
        parts: [],
      };
      byUser.set(row.user_id, digest);
    }

    digest.parts.push({
      applianceId: row.appliance_id,
      partId: row.part_id,
      partName: row.part_name,
      applianceName: row.appliance_name,
      action: row.action,
      dueAt: row.due_at,
      stage: row.stage,
      daysOverdue: daysBetween(row.due_at, today),
    });
  }

  return [...byUser.values()];
}

export async function markNotified(
  env: Env,
  partIds: string[],
  today: string,
): Promise<void> {
  if (partIds.length === 0) return;

  await env.DB.batch(
    partIds.map((id) =>
      env.DB.prepare("UPDATE parts SET last_notified_at = ? WHERE id = ?").bind(
        today,
        id,
      ),
    ),
  );
}
