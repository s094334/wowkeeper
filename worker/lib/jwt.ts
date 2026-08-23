export type JwtPayload = {
  uid: string;
  exp: number;
  jti: string;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeJson(value: unknown): string {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(value))) as T;
}

function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** 簽發 HS256 JWT，回傳 token 字串本身、到期時間（Unix timestamp）與 jti。 */
export async function signJwt(
  payload: Pick<JwtPayload, "uid">,
  secret: string,
  expiresInSeconds: number,
): Promise<{ token: string; exp: number; jti: string }> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const jti = crypto.randomUUID();
  const fullPayload: JwtPayload = { uid: payload.uid, exp, jti };

  const signingInput = `${encodeJson({ alg: "HS256", typ: "JWT" })}.${encodeJson(fullPayload)}`;
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput),
  );

  return {
    token: `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`,
    exp,
    jti,
  };
}

/** 驗證簽章與到期時間，通過則回傳解出的 payload，否則回傳 null。 */
export async function verifyJwt(
  token: string,
  secret: string,
): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const key = await importKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(signature),
    new TextEncoder().encode(`${header}.${body}`),
  );
  if (!valid) return null;

  const payload = decodeJson<JwtPayload>(body);
  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now())
    return null;

  return payload;
}
