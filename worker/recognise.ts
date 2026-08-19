import { RECOGNISE_PROMPT } from "./prompt.js";

const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const MAX_BYTES = 4 * 1024 * 1024;
const CATEGORIES = new Set([
  "aircon",
  "waterPurifier",
  "washer",
  "fridge",
  "dehumidifier",
  "waterHeater",
  "tv",
  "other",
]);

export type RecogniseResult = {
  brand: string | null;
  model: string | null;
  productName: string | null;
  category: string | null;
};

function toDataUri(bytes: Uint8Array, contentType: string): string {
  const CHUNK = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:${contentType};base64,${btoa(binary)}`;
}

function parseJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  const cleaned = text.slice(start, end + 1).replace(/\\(?!["\\/bfnrtu])/g, "");

  try {
    const parsed: unknown = JSON.parse(cleaned);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  return trimmed && trimmed.toLowerCase() !== "null" ? trimmed : null;
}

export async function recognise(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ message: "只接受 POST" }, { status: 405 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return Response.json({ message: "請直接傳圖片位元組" }, { status: 415 });
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length === 0) {
    return Response.json({ message: "沒有收到圖片" }, { status: 400 });
  }
  if (bytes.length > MAX_BYTES) {
    return Response.json({ message: "圖片太大，請重拍" }, { status: 413 });
  }

  let payload: unknown;
  try {
    const output = await env.AI.run(MODEL, {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: RECOGNISE_PROMPT },
            {
              type: "image_url",
              image_url: { url: toDataUri(bytes, contentType) },
            },
          ],
        },
      ],
      max_tokens: 1024,
    });
    payload = "response" in output ? output.response : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const outOfQuota = /3036|4006|account limited|capacity/i.test(message);
    console.error("AI 辨識失敗", message);

    return Response.json(
      { message: outOfQuota ? "今日辨識次數已用完" : "辨識服務暫時無法使用" },
      { status: 503 },
    );
  }

  const parsed =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : parseJson(typeof payload === "string" ? payload : "");

  if (!parsed) {
    console.error(
      "AI 回應無法解析",
      typeof payload,
      payload && typeof payload === "object" ? Object.keys(payload) : "",
    );
    return Response.json({ message: "看不清楚，請手動填寫" }, { status: 422 });
  }

  const category = text(parsed.category);

  const result: RecogniseResult = {
    brand: text(parsed.brand),
    model: text(parsed.model),
    productName: text(parsed.product_name),
    category: category && CATEGORIES.has(category) ? category : null,
  };

  return Response.json(result);
}
