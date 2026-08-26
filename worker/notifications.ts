import { SOON_WITHIN_DAYS } from "../shared/maintenance.js";
import { DUE_AT_SQL, daysBetween } from "./lib/date.js";

/**
 * 第二封提醒的時機：到期前幾天。
 *
 * 第一封的時機沿用 SOON_WITHIN_DAYS（15 天），與前端轉黃燈的門檻同一個值。
 */
export const NOTIFY_SECOND_LEAD_DAYS = 7;

/** 第三封提醒的時機：逾期第幾天。 */
export const NOTIFY_THIRD_OVERDUE_DAYS = 1;

/**
 * 兩封信之間至少要隔幾天。
 *
 * 排程漏跑時，較早的提醒點會延後觸發，可能跟下一個提醒點擠在一起——例如第二封
 * 延到到期當天才寄，隔天第三封又寄一次。這個下限會把擠在一起的那封略過，
 * 使用者不會在兩天內連收兩封講同一件事的信。
 *
 * 正常情況下提醒點本來就相隔 7 天以上，這個限制不會生效。
 */
export const NOTIFY_MIN_GAP_DAYS = 3;

/**
 * 一個週期寄三封：
 *   到期前 15 天  第一次提醒
 *   到期前 7 天   第二次提醒
 *   逾期第 1 天   最後提醒
 *
 * 之後不再打擾。使用者按下完成保養（或編輯耗材）後 last_notified_at 會清空，
 * 下一個週期重新開始。
 *
 * stage 決定信件的語氣，由「今天」與到期日的關係算出，與上面的寄送時機無關。
 * 前兩封通常是 soon；第三封在排程準時的情況下是 overdue，若當天沒跑而延後到
 * 更晚才寄，仍然是 overdue，只是天數變多。
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

/** 相對到期日偏移 N 天的 SQL 運算式，N 為負代表到期前。 */
function dueOffset(days: number): string {
  const sign = days < 0 ? "-" : "+";
  return `date(${DUE_AT_SQL}, '${sign}${Math.abs(days)} days')`;
}

/** 三個提醒點，相對到期日的天數。 */
const MILESTONES = [
  -SOON_WITHIN_DAYS, // 到期前 15 天
  -NOTIFY_SECOND_LEAD_DAYS, // 到期前 7 天
  NOTIFY_THIRD_OVERDUE_DAYS, // 逾期第 1 天
];

/**
 * 撈出這次排程該通知的耗材，連同所屬家電與使用者。
 *
 * 三個 OR 分支各對應一個提醒點，一個週期最多寄三封。每個分支要成立需同時滿足：
 *   a. 今天已抵達該提醒點           → 排程漏跑時隔天仍會補寄，不會永遠錯過
 *   b. 上次通知距離該提醒點至少 3 天 → 見下方說明
 *
 * 條件 b 的比較基準是「提醒點」而不是「今天」，這個差別決定了延遲時的行為：
 *
 *   以今天為基準  上次通知太近 → 今天先跳過，過幾天間隔夠了再補寄（延後）
 *   以提醒點為基準 上次通知太近 → 這個提醒點永遠不成立（取消）
 *
 * 取後者。排程漏跑導致某個提醒點延後觸發時，它會跟下一個提醒點擠在一起，
 * 而擠在一起的兩封信講的是同一件事——這時只寄較新的那封，舊的直接作廢，
 * 使用者不會在兩天內連收兩封重複的信。
 *
 * 每寄一封 last_notified_at 就推進到今天，使已抵達的提醒點都不再成立，
 * 所以每封只會寄一次。
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

/** 依使用者分組，每人一筆彙整。逾期最久的排在前面。 */
export async function findOverdueByUser(
  env: Env,
  today: string,
): Promise<UserDigest[]> {
  // 六個 ? 都是今天，順序對應它們在 SQL 字串中出現的位置：
  // CASE 的兩個判斷、最小間隔、三個提醒點各一個。
  const { results } = await env.DB.prepare(OVERDUE_SQL)
    .bind(today, today, today, today, today, today)
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
