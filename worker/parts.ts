import { generateId } from "./lib/id.js";
import { ok, fail } from "./lib/response.js";
import type { PartRow } from "./lib/types.js";

const ACTIONS = new Set(["replace", "clean"]);

// 預設 UTC+8
const TAIPEI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

/** 台北當地的今天，YYYY-MM-DD。 */
function taipeiToday(): string {
  return new Date(Date.now() + TAIPEI_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

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

function serializePart(row: PartRow) {
  return {
    id: row.id,
    name: row.name,
    cycleMonths: row.cycle_months,
    action: row.action,
    lastReplacedAt: row.last_replaced_at,
  };
}

/** name、cycleMonths、action、lastReplacedAt 皆為必填。通過回傳 null，否則回傳錯誤訊息。 */
function validatePartInput(
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

export async function listParts(
  env: Env,
  uid: string,
  applianceId: string,
): Promise<Response> {
  const appliance = await findOwnedAppliance(env, uid, applianceId);
  if (!appliance) return fail("找不到該家電", 404);

  const { results } = await env.DB.prepare(
    "SELECT * FROM parts WHERE appliance_id = ? ORDER BY created_at ASC",
  )
    .bind(applianceId)
    .all<PartRow>();

  return ok({ data: results.map(serializePart) });
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

  await env.DB.prepare(
    `INSERT INTO parts (id, appliance_id, name, cycle_months, action, last_replaced_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
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

  await env.DB.prepare(
    `UPDATE parts SET name = ?, cycle_months = ?, action = ?, last_replaced_at = ?, updated_at = ?
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

  await env.DB.prepare(
    "UPDATE parts SET last_replaced_at = ?, updated_at = ? WHERE id = ?",
  )
    .bind(today, Date.now(), partId)
    .run();

  return ok({ message: "狀態更新成功" });
}
