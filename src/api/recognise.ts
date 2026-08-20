import type { ApplianceCategory } from "../types/appliance";
import { compressImage } from "../lib/compressImage";

export type RecogniseResult = {
  brand: string | null;
  model: string | null;
  productName: string | null;
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

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String(body.message)
        : "辨識失敗，請稍後再試";
    throw new Error(message);
  }

  return body as RecogniseResult;
}
