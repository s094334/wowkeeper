import type { ApplianceCategory } from "../types/appliance";
import { compressImage } from "../lib/compressImage";
import { getToken } from "../lib/authStorage";

export type RecogniseResult = {
  brand: string | null;
  model: string | null;
  productName: string | null;
  category: ApplianceCategory | null;
};

export async function recogniseNameplate(file: File): Promise<RecogniseResult> {
  const image = await compressImage(file);

  // 這支送的是原始圖片位元組、不是 JSON，所以沒有走 axios，也就沒有
  // src/api/system.ts 那個自動補 token 的攔截器，要自己帶。
  const token = getToken();

  const response = await fetch("/api/recognise", {
    method: "POST",
    headers: {
      "Content-Type": "image/jpeg",
      ...(token ? { authorization: token } : {}),
    },
    body: image,
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String(body.message)
        : "辨識失敗，請稍後再試";
    throw new Error(message);
  }

  return body as RecogniseResult;
}
