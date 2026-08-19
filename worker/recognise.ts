import { RECOGNISE_PROMPT } from "./prompt.js";

// 評測結果：型號 3/3 全對、JSON 100% 可解析、中位 5.9s。
// Mistral 型號也全對，但 JSON 只有 33% 解析得出來，對自動填表單是致命傷。
const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

// 前端會先壓到長邊 1568px（約 300KB），這只是防呆上限。
const MAX_BYTES = 4 * 1024 * 1024;

export type RecogniseResult = {
  brand: string | null;
  model: string | null;
  productName: string | null;
};

/**
 * 位元組轉 data URI。模型只吃 data URI，不接受 HTTP 網址。
 *
 * 分段是必要的：String.fromCharCode(...bytes) 一次攤開三十萬個參數會爆掉呼叫堆疊。
 */
function toDataUri(bytes: Uint8Array, contentType: string): string {
  const CHUNK = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:${contentType};base64,${btoa(binary)}`;
}

/** 模型很愛在 JSON 外面包 markdown 圍籬或補一句話，所以只取大括號中間那段。 */
function parseJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  // 有些模型會照 markdown 的習慣轉義底線，吐出 "product\_name"。
  // \_ 不是合法的 JSON escape，不清掉整包都解析不了。
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

/** 模型可能回字串 "null"、空字串、或根本不是字串，一律收斂成 null。 */
function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
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
    // 型別宣告說 response 是 string，但 binding 實測會回已解析好的物件
    // （走外部 REST API 才是字串）。兩種都接。
    payload = "response" in output ? output.response : null;
  } catch (error) {
    // 免費額度每天 10,000 neurons、00:00 UTC 重置。超過後重試不會好，
    // 所以要跟一般失敗分開講，不然使用者會一直重拍。
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
    // 只記形狀不記內容 —— 看得出模型回了什麼結構，但銘牌上的文字不會留在 log。
    console.error(
      "AI 回應無法解析",
      typeof payload,
      payload && typeof payload === "object" ? Object.keys(payload) : "",
    );
    return Response.json({ message: "看不清楚，請手動填寫" }, { status: 422 });
  }

  const result: RecogniseResult = {
    brand: text(parsed.brand),
    model: text(parsed.model),
    productName: text(parsed.product_name),
  };

  return Response.json(result);
}
