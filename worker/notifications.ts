import { DUE_AT_SQL, daysBetween } from "./lib/date.js";

/**
 * 到期前幾天寄出預告信。
 *
 * 與前端 src/lib/status.ts 的 SOON_WITHIN_DAYS 相同，所以預告信會正好在畫面
 * 由綠燈轉黃燈的那天寄出，信件與畫面不會互相矛盾。
 */
export const NOTIFY_LEAD_DAYS = 15;

/** 到期後隔幾天寄最後一封追蹤信。 */
export const NOTIFY_FOLLOWUP_DAYS = 14;

/**
 * 通知的三個階段，決定信件內容：
 *   soon    到期前 15 天的預告，寄一次
 *   due     到期當天，寄一次
 *   overdue 逾期第 14 天的追蹤，寄一次
 *
 * 一個週期最多就這三封，之後不再打擾。使用者按下完成保養後
 * last_notified_at 會清空，下一個週期重新開始。
 */
export type NotifyStage = "soon" | "due" | "overdue";

export type OverduePart = {
  partId: string;
  partName: string;
  applianceName: string;
  action: "replace" | "clean";
  /** YYYY-MM-DD */
  dueAt: string;
  stage: NotifyStage;
  /** 正數代表已逾期幾天，負數代表還有幾天到期，0 是到期當天。 */
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
  stage: NotifyStage;
};

/**
 * 撈出這次排程該通知的耗材，連同所屬家電與使用者。
 *
 * 三個 OR 分支各對應一封信，一個週期最多寄三封：
 *   1. last_notified_at IS NULL
 *      本週期還沒寄過。進入通知期（到期前 15 天內）就寄「快到期」。
 *   2. last_notified_at < due_at 且已到期
 *      之前只寄過預告，現在到期日到了，寄「今天到期」。
 *   3. last_notified_at 落在 [due_at, due_at + 14) 且今天已過 due_at + 14
 *      寄最後一封「已逾期」追蹤信。寄完 last_notified_at 就會跳出這個區間，
 *      條件不再成立，所以只會寄一次。
 *
 * 用日期區間而不是「剛好等於某一天」來判斷，是為了容忍排程漏跑——某天 cron
 * 沒執行，隔天仍會補寄，而不是永遠錯過那一封。
 *
 * 所有 ? 綁的都是今天的日期（台北時區）。
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
    AND ${DUE_AT_SQL} <= date(?, '+${NOTIFY_LEAD_DAYS} days')
    AND (
      parts.last_notified_at IS NULL
      OR (parts.last_notified_at < ${DUE_AT_SQL} AND ${DUE_AT_SQL} <= ?)
      OR (
        parts.last_notified_at >= ${DUE_AT_SQL}
        AND parts.last_notified_at < date(${DUE_AT_SQL}, '+${NOTIFY_FOLLOWUP_DAYS} days')
        AND date(${DUE_AT_SQL}, '+${NOTIFY_FOLLOWUP_DAYS} days') <= ?
      )
    )
  ORDER BY users.id, due_at ASC`;

/** 依使用者分組，每人一筆彙整。逾期最久的排在前面。 */
export async function findOverdueByUser(
  env: Env,
  today: string,
): Promise<UserDigest[]> {
  // 五個 ? 都是今天，順序對應它們在 SQL 字串中出現的位置：
  // CASE 的兩個判斷、通知期起點、到期日比較、重複提醒的間隔。
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
