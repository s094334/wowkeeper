import express from "express";
import { env } from "cloudflare:workers";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { authMiddleware } from "./lib/authMiddleware.js";
import { statusOk } from "./lib/response.js";

import { taipeiToday, SOON_WITHIN_DAYS } from "../shared/maintenance.js";
import { MAIL_FROM, renderDigest } from "./email.js";
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

function allowedRecipients(env: Env): Set<string> | null {
  const raw = env.NOTIFY_ALLOWLIST?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

type NotifyResult = {
  today: string;
  sent: number;
  failed: number;
  filtered: number;
};

export async function runDailyNotifications(env: Env): Promise<NotifyResult> {
  const today = taipeiToday();
  const allowlist = allowedRecipients(env);
  const all = await findOverdueByUser(env, today);

  const digests = allowlist
    ? all.filter((digest) => allowlist.has(digest.email.toLowerCase()))
    : all;

  const filtered = all.length - digests.length;
  if (filtered > 0) {
    console.log(`[notify] 白名單過濾掉 ${filtered} 位收件人`);
  }

  if (digests.length === 0) {
    console.log(`[notify] ${today} 沒有需要通知的項目`);
    return { today, sent: 0, failed: 0, filtered };
  }

  let sent = 0;

  for (const digest of digests) {
    const { subject, text, html } = renderDigest(digest);

    try {
      await env.EMAIL.send({
        to: digest.email,
        from: MAIL_FROM,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error(`[notify] 寄給 ${digest.email} 失敗`, error);
      continue;
    }

    await markNotified(
      env,
      digest.parts.map((part) => part.partId),
      today,
    );
    sent++;
    console.log(`[notify] 已寄給 ${digest.email}（${digest.parts.length} 項）`);
  }

  console.log(`[notify] ${today} 寄出 ${sent}/${digests.length} 封`);
  return { today, sent, failed: digests.length - sent, filtered };
}

const router = express.Router();

router.post(
  "/run",
  authMiddleware,
  async (_request: ExpressRequest, response: ExpressResponse) => {
    return statusOk(response, await runDailyNotifications(env));
  },
);

export default router;
