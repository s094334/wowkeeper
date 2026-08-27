/**
 * 保養週期的規則常數，前端與 worker 共用。
 *
 * 這兩個數字同時決定「畫面上的燈號」與「通知信的時機」，兩邊必須用同一份值。
 * 先前是各自宣告、靠註解提醒要一起改，但註解擋不住疏漏，所以抽出來共用。
 *
 * 使用方式因兩邊的 module resolution 而異：
 *   前端（bundler）  import { ... } from "../../shared/maintenance";
 *   worker（nodenext）import { ... } from "../shared/maintenance.js";
 */

/**
 * 一個「保養週期月」當幾天算。
 *
 * 用固定天數而不是日曆月份，是為了讓「上次更換日 + N 個月」在前端的 JS 與
 * worker 的 SQL 裡算出完全相同的結果——日曆月份長度不一，兩種實作很難對齊。
 */
export const DAYS_PER_CYCLE_MONTH = 30;

/**
 * 距離到期還剩幾天以內算「快到期」。
 *
 * 同時是兩件事的門檻：
 *   前端  卡片燈號由綠轉黃
 *   worker 寄出「快到期」預告信
 *
 * 兩者共用同一個值，所以預告信會正好在畫面轉黃燈的那天寄出。
 */
export const SOON_WITHIN_DAYS = 15;

const TAIPEI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * 把任一時刻換算成台北當地的日曆日，回傳該日 UTC 午夜的毫秒數。
 *
 * 前端與 worker 都固定用台北時間判斷「今天」，而不是各自用瀏覽器時區或 UTC。
 * 這樣同一項耗材在畫面上顯示逾期的那一天，正好就是後端寄出提醒信的那一天；
 * 使用者人在國外時看到的狀態，也會跟他收到的信一致。
 */
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
