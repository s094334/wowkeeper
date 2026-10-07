import express from "express";
import { env } from "cloudflare:workers";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

import { generateId } from "./lib/id.js";
import { hashPassword, verifyPassword } from "./lib/password.js";
import { signJwt } from "./lib/jwt.js";
import { statusOk, statusFail } from "./lib/response.js";
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

const router = express.Router();

router.post(
  "/sign_up",
  async (request: ExpressRequest, response: ExpressResponse) => {
    const body = request.body;
    const email = body?.email;
    const password = body?.password;
    const nickname = body?.nickname;

    if (
      !isNonEmptyString(email) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(nickname)
    ) {
      return statusFail(response, "欄位驗證失敗");
    }
    if (password.length < 6) {
      return statusFail(response, "欄位驗證失敗");
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return statusFail(response, "欄位驗證失敗");
    }

    // 回 403 而不是 400：讓被擋下的人知道是「不開放」，不是自己填錯。
    // 訊息不透露名單內容，也不區分「不在名單上」與其他失敗。
    const allowlist = signupAllowlist(env);
    if (allowlist && !allowlist.has(normalizedEmail)) {
      return statusFail(response, "目前未開放註冊", 403);
    }

    const existing = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?",
    )
      .bind(normalizedEmail)
      .first();

    if (existing) {
      return statusFail(response, "欄位驗證失敗");
    }

    const id = generateId("usr");
    const passwordHash = await hashPassword(password);

    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, nickname, created_at) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(id, normalizedEmail, passwordHash, nickname.trim(), Date.now())
      .run();
    return statusOk(response, { uid: id }, 201);
  },
);

router.post(
  "/sign_in",
  async (request: ExpressRequest, response: ExpressResponse) => {
    const body = request.body;
    const email = body?.email;
    const password = body?.password;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return statusFail(response, "欄位驗證失敗");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?")
      .bind(normalizedEmail)
      .first<UserRow>();

    if (!user) {
      // 查無使用者時也跑一次同樣成本的雜湊，讓兩條失敗路徑耗時一致
      await hashPassword(password);
      return statusFail(response, "帳號密碼驗證錯誤", 401);
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);
    if (!passwordMatches) {
      return statusFail(response, "帳號密碼驗證錯誤", 401);
    }

    const { token, exp } = await signJwt(
      { uid: user.id },
      env.JWT_SECRET,
      TOKEN_TTL_SECONDS,
    );
    return statusOk(response, {
      exp,
      token,
      nickname: user.nickname,
      email: user.email,
    });
  },
);

router.post(
  "/sign_out",
  async (request: ExpressRequest, response: ExpressResponse) => {
    const auth = await authenticate(request.headers.authorization, env);
    if (!auth) {
      return statusFail(response, "登出失敗", 401);
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
    return statusOk(response, { message: "登出成功" });
  },
);

export default router;
