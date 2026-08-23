const ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function deriveHex(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
  return toHex(new Uint8Array(derived));
}

/** 回傳 `iterations:saltHex:hashHex`，可直接存進 `users.password_hash`。 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hashHex = await deriveHex(password, salt, ITERATIONS);
  return `${ITERATIONS}:${toHex(salt)}:${hashHex}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [iterationsText, saltHex, hashHex] = stored.split(":");
  const iterations = Number(iterationsText);
  if (!iterations || !saltHex || !hashHex) return false;

  const candidateHex = await deriveHex(password, fromHex(saltHex), iterations);
  if (candidateHex.length !== hashHex.length) return false;

  // 固定長度逐字元比對，避免時間差攻擊洩漏雜湊內容。
  let diff = 0;
  for (let i = 0; i < candidateHex.length; i++) {
    diff |= candidateHex.charCodeAt(i) ^ hashHex.charCodeAt(i);
  }
  return diff === 0;
}
