import { generateId } from "./lib/id.js";
import { INSERT_PART_SQL, validatePartInput } from "./parts.js";
import { ok, fail } from "./lib/response.js";
import type { ApplianceRow, PartRow } from "./lib/types.js";

type PartInputBody = {
  name: string;
  cycleMonths: number;
  action: "replace" | "clean";
  lastReplacedAt: string;
};

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

/**
 * DB 資料列轉成前端要的形狀：欄位改 camelCase、NULL 改成 undefined（JSON 會直接省略該 key）、
 * 不外流 user_id 與 created_at/updated_at。
 *
 * 狀態（逾期 / 快到期）不在這裡算——那要看「今天」是哪一天，而只有瀏覽器知道使用者的時區，
 * 所以一律回原始的 parts，由前端用 src/lib/status.ts 現算。
 */
function serializeAppliance(row: ApplianceRow, parts: PartRow[]) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    purchasedAt: row.purchased_at ?? undefined,
    parts: parts.map(serializePart),
  };
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

/**
 * 新增家電時可以夾帶 parts 陣列一起建立。沒帶就當空陣列，帶了就每一筆都要通過耗材的驗證。
 * 通過回傳 null，失敗回傳錯誤訊息。
 */
function validatePartsInput(value: unknown): string | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return "欄位驗證失敗";

  for (const part of value) {
    const body =
      typeof part === "object" && part !== null
        ? (part as Record<string, unknown>)
        : null;
    const error = validatePartInput(body);
    if (error) return error;
  }

  return null;
}

export async function listAppliances(env: Env, uid: string): Promise<Response> {
  // 兩支查詢同時發，耗材用 JOIN 一次撈完整個使用者的，避免每台家電各查一次（N+1），
  // 也不必把家電 id 一個個綁進 IN (...)。
  const [appliances, parts] = await Promise.all([
    env.DB.prepare(
      "SELECT * FROM appliances WHERE user_id = ? ORDER BY created_at DESC",
    )
      .bind(uid)
      .all<ApplianceRow>(),
    env.DB.prepare(
      `SELECT parts.* FROM parts
       JOIN appliances ON appliances.id = parts.appliance_id
       WHERE appliances.user_id = ?
       ORDER BY parts.created_at ASC`,
    )
      .bind(uid)
      .all<PartRow>(),
  ]);

  const partsByAppliance = new Map<string, PartRow[]>();
  for (const part of parts.results) {
    const existing = partsByAppliance.get(part.appliance_id);
    if (existing) existing.push(part);
    else partsByAppliance.set(part.appliance_id, [part]);
  }

  return ok({
    data: appliances.results.map((row) =>
      serializeAppliance(row, partsByAppliance.get(row.id) ?? []),
    ),
  });
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
  if (validatePartsInput(body.parts)) return fail("新增失敗");

  const name = (body.name as string).trim();
  const category = body.category as string;
  const brand = (body.brand as string | undefined) ?? null;
  const model = (body.model as string | undefined) ?? null;
  const purchasedAt = (body.purchasedAt as string | undefined) ?? null;

  const id = generateId("apl");
  const now = Date.now();

  const partRows: PartRow[] = (
    (body.parts as PartInputBody[] | undefined) ?? []
  ).map((part) => ({
    id: generateId("prt"),
    appliance_id: id,
    name: part.name.trim(),
    cycle_months: part.cycleMonths,
    action: part.action,
    last_replaced_at: part.lastReplacedAt,
    created_at: now,
    updated_at: now,
  }));

  // batch 是一個 SQL transaction：其中一句失敗會整批回滾，所以不會留下
  // 「家電建好了、但耗材只寫進去一半」的資料。
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO appliances (id, user_id, name, category, brand, model, purchased_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, uid, name, category, brand, model, purchasedAt, now, now),
    ...partRows.map((part) =>
      env.DB.prepare(INSERT_PART_SQL).bind(
        part.id,
        part.appliance_id,
        part.name,
        part.cycle_months,
        part.action,
        part.last_replaced_at,
        part.created_at,
        part.updated_at,
      ),
    ),
  ]);

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
    { status: true, newAppliance: serializeAppliance(row, partRows) },
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
