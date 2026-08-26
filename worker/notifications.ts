import { DUE_AT_SQL, daysBetween } from "./lib/date.js";

/**
 * 同一項耗材兩次通知之間至少相隔幾天。
 *
 * 逾期後只提醒一次容易被忽略，但每天寄會變成騷擾。這個值決定重複提醒的節奏，
 * 耗材最短週期是 1 個月（30 天），所以不會發生「還沒到下次到期就重複提醒」。
 */
export const NOTIFY_COOLDOWN_DAYS = 7;

export type OverduePart = {
  partId: string;
  partName: string;
  applianceName: string;
  action: "replace" | "clean";
  /** YYYY-MM-DD */
  dueAt: string;
  daysOverdue: number;
};

/** 一位使用者的逾期彙整，一封信對應一個 digest。 */
export type UserDigest = {
  userId: string;
  email: string;
  nickname: string;
  parts: OverduePart[];
};

type OverdueRow = {
  user_id: string;
  email: string;
  nickname: string;
  appliance_name: string;
  part_id: string;
  part_name: string;
  action: "replace" | "clean";
  due_at: string;
};

/**
 * 撈出所有「已逾期、且冷卻期已過」的耗材，連同所屬家電與使用者。
 *
 * 兩個 ? 綁的都是今天的日期（台北時區）：第一個判斷是否逾期，第二個算冷卻期。
 * 已關閉通知的使用者在 SQL 層就被濾掉，不會進到寄信流程。
 */
const OVERDUE_SQL = `
  SELECT
    users.id AS user_id,
    users.email,
    users.nickname,
    appliances.name AS appliance_name,
    parts.id AS part_id,
    parts.name AS part_name,
    parts.action,
    ${DUE_AT_SQL} AS due_at
  FROM parts
  JOIN appliances ON appliances.id = parts.appliance_id
  JOIN users ON users.id = appliances.user_id
  WHERE users.notifications_enabled = 1
    AND ${DUE_AT_SQL} < ?
    AND (
      parts.last_notified_at IS NULL
      OR parts.last_notified_at <= date(?, '-${NOTIFY_COOLDOWN_DAYS} days')
    )
  ORDER BY users.id, due_at ASC`;

/** 依使用者分組，每人一筆彙整。逾期最久的排在前面。 */
export async function findOverdueByUser(
  env: Env,
  today: string,
): Promise<UserDigest[]> {
  const { results } = await env.DB.prepare(OVERDUE_SQL)
    .bind(today, today)
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
      partId: row.part_id,
      partName: row.part_name,
      applianceName: row.appliance_name,
      action: row.action,
      dueAt: row.due_at,
      daysOverdue: daysBetween(row.due_at, today),
    });
  }

  return [...byUser.values()];
}

/**
 * 標記這些耗材今天已通知過。
 *
 * ⚠️ 只有在信真的寄出去之後才能呼叫。先標記再寄的話，一旦寄送失敗，那次通知
 * 就永久遺失了——使用者的耗材還在逾期，系統卻以為已經提醒過。
 */
export async function markNotified(
  env: Env,
  partIds: string[],
  today: string,
): Promise<void> {
  if (partIds.length === 0) return;

  await env.DB.batch(
    partIds.map((id) =>
      env.DB.prepare(
        "UPDATE parts SET last_notified_at = ? WHERE id = ?",
      ).bind(today, id),
    ),
  );
}
