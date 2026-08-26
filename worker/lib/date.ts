/**
 * 日期規則的單一來源。
 *
 * 前端 src/lib/status.ts 用同一組規則計算到期日與逾期天數。兩邊必須一致，
 * 否則會出現「畫面顯示還沒到期，但通知信已經寄出」這種矛盾。改動這裡時
 * 請一併檢查 src/lib/status.ts。
 */

/** 一個「週期月」當 30 天算，與前端 DAYS_PER_CYCLE_MONTH 相同。 */
export const DAYS_PER_CYCLE_MONTH = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// 預設 UTC+8
const TAIPEI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

/** 台北當地的今天，YYYY-MM-DD。 */
export function taipeiToday(): string {
  return new Date(Date.now() + TAIPEI_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

/** YYYY-MM-DD 轉成 UTC 午夜的毫秒數，用來做整日相減。 */
function dayNumberOf(dateText: string): number {
  const [year, month, day] = dateText.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/**
 * from 到 to 之間相差幾天（to 較晚時為正）。
 * 兩個參數都是 YYYY-MM-DD，不含時間，所以不會有時區或日光節約的誤差。
 */
export function daysBetween(from: string, to: string): number {
  return Math.round((dayNumberOf(to) - dayNumberOf(from)) / MS_PER_DAY);
}

/**
 * 耗材到期日的 SQL 運算式，等價於前端的 dueDayNumber()。
 *
 * 在 SQL 裡算而不是把整張 parts 撈回來用 JS 過濾，是因為逾期的通常只佔少數，
 * 讓資料庫先篩掉絕大部分資料列比較省。
 */
export const DUE_AT_SQL = `date(parts.last_replaced_at, '+' || (parts.cycle_months * ${DAYS_PER_CYCLE_MONTH}) || ' days')`;
