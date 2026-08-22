import { generateId } from "./lib/id.js";
import { ok, fail } from "./lib/response.js";
import { computeApplianceStatus } from "./lib/status.js";
import type { ApplianceRow, PartRow } from "./lib/types.js";

const CATEGORIES = new Set([
  "aircon",
  "waterPurifier",
  "washer",
  "fridge",
  "dehumidifier",
  "waterHeater",
  "tv",
  "maintenance",
  "other",
]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isOptionalDate(value: unknown): value is string | undefined {
  return (
    value === undefined ||
    (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
  );
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

function serializeAppliance(row: ApplianceRow, parts: PartRow[] | null) {
  const { status, statusText } = computeApplianceStatus(
    (parts ?? []).map((part) => ({
      name: part.name,
      cycleMonths: part.cycle_months,
      lastReplacedAt: part.last_replaced_at,
    })),
  );

  const base = {
    id: row.id,
    name: row.name,
    category: row.category,
    status,
    statusText,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    purchasedAt: row.purchased_at ?? undefined,
  };

  return parts ? { ...base, parts: parts.map(serializePart) } : base;
}

/** 驗證新增/更新家電的欄位，通過回傳 null，失敗回傳要顯示的錯誤訊息。 */
function validateApplianceInput(
  body: Record<string, unknown> | null,
): string | null {
  if (!body) return "欄位驗證失敗";
  const { name, category, brand, model, purchasedAt } = body;

  if (!isNonEmptyString(name)) return "欄位驗證失敗";
  if (typeof category !== "string" || !CATEGORIES.has(category))
    return "欄位驗證失敗";
  if (!isOptionalString(brand)) return "欄位驗證失敗";
  if (!isOptionalString(model)) return "欄位驗證失敗";
  if (!isOptionalDate(purchasedAt)) return "欄位驗證失敗";

  return null;
}

export async function listAppliances(env: Env, uid: string): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM appliances WHERE user_id = ? ORDER BY created_at DESC",
  )
    .bind(uid)
    .all<ApplianceRow>();

  return ok({ data: results.map((row) => serializeAppliance(row, null)) });
}

export async function getAppliance(
  env: Env,
  uid: string,
  id: string,
): Promise<Response> {
  const appliance = await env.DB.prepare(
    "SELECT * FROM appliances WHERE id = ? AND user_id = ?",
  )
    .bind(id, uid)
    .first<ApplianceRow>();
  if (!appliance) return fail("找不到該家電", 404);

  const { results: parts } = await env.DB.prepare(
    "SELECT * FROM parts WHERE appliance_id = ? ORDER BY created_at ASC",
  )
    .bind(id)
    .all<PartRow>();

  return ok({ data: serializeAppliance(appliance, parts) });
}

export async function createAppliance(
  request: Request,
  env: Env,
  uid: string,
): Promise<Response> {
  const body = await readJson(request);
  const validationError = validateApplianceInput(body);
  if (validationError || !body) return fail("新增失敗");

  const name = (body.name as string).trim();
  const category = body.category as string;
  const brand = (body.brand as string | undefined) ?? null;
  const model = (body.model as string | undefined) ?? null;
  const purchasedAt = (body.purchasedAt as string | undefined) ?? null;

  const id = generateId("apl");
  const now = Date.now();

  await env.DB.prepare(
    `INSERT INTO appliances (id, user_id, name, category, brand, model, purchased_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, uid, name, category, brand, model, purchasedAt, now, now)
    .run();

  const row: ApplianceRow = {
    id,
    user_id: uid,
    name,
    category,
    brand,
    model,
    purchased_at: purchasedAt,
    created_at: now,
    updated_at: now,
  };

  return Response.json(
    { status: true, newAppliance: serializeAppliance(row, []) },
    { status: 201 },
  );
}

export async function updateAppliance(
  request: Request,
  env: Env,
  uid: string,
  id: string,
): Promise<Response> {
  const existing = await env.DB.prepare(
    "SELECT id FROM appliances WHERE id = ? AND user_id = ?",
  )
    .bind(id, uid)
    .first();
  if (!existing) return fail("找不到該家電", 404);

  const body = await readJson(request);
  const validationError = validateApplianceInput(body);
  if (validationError || !body) return fail("更新失敗");

  const name = (body.name as string).trim();
  const category = body.category as string;
  const brand = (body.brand as string | undefined) ?? null;
  const model = (body.model as string | undefined) ?? null;
  const purchasedAt = (body.purchasedAt as string | undefined) ?? null;

  await env.DB.prepare(
    `UPDATE appliances SET name = ?, category = ?, brand = ?, model = ?, purchased_at = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
  )
    .bind(name, category, brand, model, purchasedAt, Date.now(), id, uid)
    .run();

  return ok({ message: "更新成功" });
}

export async function deleteAppliance(
  env: Env,
  uid: string,
  id: string,
): Promise<Response> {
  const existing = await env.DB.prepare(
    "SELECT id FROM appliances WHERE id = ? AND user_id = ?",
  )
    .bind(id, uid)
    .first();
  if (!existing) return fail("找不到該家電", 404);

  await env.DB.batch([
    env.DB.prepare("DELETE FROM parts WHERE appliance_id = ?").bind(id),
    env.DB.prepare("DELETE FROM appliances WHERE id = ?").bind(id),
  ]);

  return ok({ message: "刪除成功" });
}
