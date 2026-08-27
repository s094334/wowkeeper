function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

/** 產生 `prefix_xxxxxxxxxx` 形式的 ID，如 `apl_dc4defd8ac`、`prt_4b81c0a2e7`。 */
export function generateId(prefix: string): string {
  return `${prefix}_${randomHex(10)}`;
}
