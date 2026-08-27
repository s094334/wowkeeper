import { generateId } from "./lib/id.js";
import { hashPassword, verifyPassword } from "./lib/password.js";
import { signJwt } from "./lib/jwt.js";
import { ok, fail } from "./lib/response.js";
import { authenticate } from "./lib/auth.js";
import type { UserRow } from "./lib/types.js";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 天

// 與前端 src/pages/Register/fields.ts 的規則一致。前端擋得住一般使用者，
// 但 API 可以被直接呼叫，所以這裡是繞過表單時的最後一道防線。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 只有名單上的 email 能註冊。留空則不限制，正式開放時就是留空。
 *
 * 走 secret 而不是 wrangler.jsonc 的 vars：註冊時不驗證 email 所有權，所以
 * 這份名單一旦公開，任何人看到名單就能拿上面的地址去註冊。名單本身即是門檻。
 */
function signupAllowlist(env: Env): Set<string> | null {
  const raw = env.SIGNUP_ALLOWLIST?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
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

export async function signUp(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = body?.email;
  const password = body?.password;
  const nickname = body?.nickname;

  if (
    !isNonEmptyString(email) ||
    !isNonEmptyString(password) ||
    !isNonEmptyString(nickname)
  ) {
    return fail("欄位驗證失敗");
  }
  if (password.length < 6) {
    return fail("欄位驗證失敗");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return fail("欄位驗證失敗");
  }

  // 回 403 而不是 400：讓被擋下的人知道是「不開放」，不是自己填錯。
  // 訊息不透露名單內容，也不區分「不在名單上」與其他失敗。
  const allowlist = signupAllowlist(env);
  if (allowlist && !allowlist.has(normalizedEmail)) {
    return fail("目前未開放註冊", 403);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first();
  if (existing) {
    return fail("用戶已存在");
  }

  const id = generateId("usr");
  const passwordHash = await hashPassword(password);

  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, nickname, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(id, normalizedEmail, passwordHash, nickname.trim(), Date.now())
    .run();

  return Response.json({ status: true, uid: id }, { status: 201 });
}

export async function signIn(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = body?.email;
  const password = body?.password;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return fail("欄位驗證失敗");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first<UserRow>();

  if (!user) {
    return fail("用戶不存在", 404);
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    return fail("帳號密碼驗證錯誤", 401);
  }

  const { token, exp } = await signJwt(
    { uid: user.id },
    env.JWT_SECRET,
    TOKEN_TTL_SECONDS,
  );

  return Response.json(
    { status: true, exp, token, nickname: user.nickname, email: user.email },
    { status: 200 },
  );
}

export async function signOut(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (!auth) {
    return fail("登出失敗");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  // 跟寫入新黑名單紀錄同一趟 batch，順手把已經過期（token 自然失效、黑名單也用不到了）的
  // 舊紀錄刪掉，讓 revoked_tokens 不會無限長大。
  await env.DB.batch([
    env.DB.prepare(
      "INSERT OR REPLACE INTO revoked_tokens (jti, expires_at) VALUES (?, ?)",
    ).bind(auth.jti, auth.exp),
    env.DB.prepare("DELETE FROM revoked_tokens WHERE expires_at < ?").bind(
      nowSeconds,
    ),
  ]);

  return ok({ message: "登出成功" });
}
