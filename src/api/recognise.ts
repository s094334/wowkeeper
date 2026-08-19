import type { ApplianceCategory } from "../types/appliance";
import { compressImage } from "../lib/compressImage";

/** 與 worker/recognise.ts 的回傳一致。每個欄位都可能是 null。 */
export type RecogniseResult = {
  brand: string | null;
  model: string | null;
  productName: string | null;
  /** Worker 已經比對過清單，這裡收到的一定是合法值或 null。 */
  category: ApplianceCategory | null;
};

export async function recogniseNameplate(file: File): Promise<RecogniseResult> {
  const image = await compressImage(file);

  const response = await fetch("/api/recognise", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: image,
  });

  const body: unknown = await response.json();

  // Worker 對每種失敗都給了可以直接顯示給使用者的中文訊息，這裡原樣拋出去。
  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String(body.message)
        : "辨識失敗，請稍後再試";
    throw new Error(message);
  }

  return body as RecogniseResult;
}
