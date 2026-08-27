import { taipeiToday } from "./lib/date.js";
import { generateId } from "./lib/id.js";
import { ok, fail } from "./lib/response.js";
import type { PartRow } from "./lib/types.js";

const ACTIONS = new Set(["replace", "clean"]);

/** 新增家電時可以夾帶耗材，所以 appliances.ts 的 batch 也會用到同一句。 */
export const INSERT_PART_SQL = `INSERT INTO parts (id, appliance_id, name, cycle_months, action, last_replaced_at, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function validatePartInput(
  body: Record<string, unknown> | null,
): string | null {
  if (!body) return "欄位驗證失敗";
  const { name, cycleMonths, action, lastReplacedAt } = body;

  if (!isNonEmptyString(name)) return "欄位驗證失敗";
  if (
    typeof cycleMonths !== "number" ||
    !Number.isInteger(cycleMonths) ||
    cycleMonths <= 0
  ) {
    return "欄位驗證失敗";
  }
  if (typeof action !== "string" || !ACTIONS.has(action)) return "欄位驗證失敗";
  if (!isValidDate(lastReplacedAt)) return "欄位驗證失敗";

  return null;
}

async function findOwnedAppliance(env: Env, uid: string, applianceId: string) {
  return env.DB.prepare(
    "SELECT id FROM appliances WHERE id = ? AND user_id = ?",
  )
    .bind(applianceId, uid)
    .first();
}

async function findOwnedPart(
  env: Env,
  uid: string,
  applianceId: string,
  partId: string,
) {
  const appliance = await findOwnedAppliance(env, uid, applianceId);
  if (!appliance) return null;

  return env.DB.prepare("SELECT * FROM parts WHERE id = ? AND appliance_id = ?")
    .bind(partId, applianceId)
    .first<PartRow>();
}

export async function createPart(
  request: Request,
  env: Env,
  uid: string,
  applianceId: string,
): Promise<Response> {
  const appliance = await findOwnedAppliance(env, uid, applianceId);
  if (!appliance) return fail("找不到該家電", 404);

  const body = await readJson(request);
  const validationError = validatePartInput(body);
  if (validationError || !body) return fail("新增失敗");

  const name = (body.name as string).trim();
  const cycleMonths = body.cycleMonths as number;
  const action = body.action as "replace" | "clean";
  const lastReplacedAt = body.lastReplacedAt as string;

  const id = generateId("prt");
  const now = Date.now();

  await env.DB.prepare(INSERT_PART_SQL)
    .bind(id, applianceId, name, cycleMonths, action, lastReplacedAt, now, now)
    .run();

  return Response.json(
    {
      status: true,
      newPart: { id, name, cycleMonths, action, lastReplacedAt },
    },
    { status: 201 },
  );
}

export async function updatePart(
  request: Request,
  env: Env,
  uid: string,
  applianceId: string,
  partId: string,
): Promise<Response> {
  const part = await findOwnedPart(env, uid, applianceId, partId);
  if (!part) return fail("找不到該耗材", 404);

  const body = await readJson(request);
  const validationError = validatePartInput(body);
  if (validationError || !body) return fail("更新失敗");

  const name = (body.name as string).trim();
  const cycleMonths = body.cycleMonths as number;
  const action = body.action as "replace" | "clean";
  const lastReplacedAt = body.lastReplacedAt as string;

  // 編輯有可能改到 last_replaced_at 或 cycle_months，兩者都會讓到期日移動，
  // 所以跟 renewPart 一樣把通知紀錄清掉，讓新的週期重新判斷。
  await env.DB.prepare(
    `UPDATE parts SET name = ?, cycle_months = ?, action = ?, last_replaced_at = ?, last_notified_at = NULL, updated_at = ?
     WHERE id = ?`,
  )
    .bind(name, cycleMonths, action, lastReplacedAt, Date.now(), partId)
    .run();

  return ok({ message: "更新成功" });
}

export async function deletePart(
  env: Env,
  uid: string,
  applianceId: string,
  partId: string,
): Promise<Response> {
  const part = await findOwnedPart(env, uid, applianceId, partId);
  if (!part) return fail("找不到該耗材", 404);

  await env.DB.prepare("DELETE FROM parts WHERE id = ?").bind(partId).run();

  return ok({ message: "刪除成功" });
}

export async function renewPart(
  env: Env,
  uid: string,
  applianceId: string,
  partId: string,
): Promise<Response> {
  const part = await findOwnedPart(env, uid, applianceId, partId);
  if (!part) return fail("找不到該耗材", 404);

  const today = taipeiToday();

  // last_notified_at 一併清空：它記錄的是「本週期是否已通知」，換新之後
  // 週期重新起算，舊的通知紀錄就不再適用了。
  await env.DB.prepare(
    "UPDATE parts SET last_replaced_at = ?, last_notified_at = NULL, updated_at = ? WHERE id = ?",
  )
    .bind(today, Date.now(), partId)
    .run();

  return ok({ message: "狀態更新成功" });
}
