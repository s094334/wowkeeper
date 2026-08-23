import { verifyJwt } from "./jwt.js";

export type AuthResult = {
  uid: string;
  jti: string;
  exp: number;
  token: string;
};

/**
 * 從 `authorization` header 取出 token（比照參考 API，直接放 token 本身，不加 Bearer 前綴），
 * 驗證簽章、到期時間，並確認尚未被登出黑名單（revoked_tokens）撤銷。
 */
export async function authenticate(
  request: Request,
  env: Env,
): Promise<AuthResult | null> {
  const token = request.headers.get("authorization");
  if (!token) return null;

  const payload = await verifyJwt(token, env.JWT_SECRET);
  if (!payload) return null;

  const revoked = await env.DB.prepare(
    "SELECT 1 FROM revoked_tokens WHERE jti = ?",
  )
    .bind(payload.jti)
    .first();
  if (revoked) return null;

  return { uid: payload.uid, jti: payload.jti, exp: payload.exp, token };
}
