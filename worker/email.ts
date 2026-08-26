import type { OverduePart, UserDigest } from "./notifications.js";

/** 信裡的連結指向正式站，與 wrangler.jsonc 的 routes 一致。 */
const APP_URL = "https://wowkeeper.xin-ping.com";

const ACTION_LABELS: Record<OverduePart["action"], string> = {
  replace: "更換",
  clean: "清潔",
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

/** 這封信裡最急迫的狀態，決定標題的語氣。 */
function worstStage(parts: OverduePart[]): OverduePart["stage"] {
  if (parts.some((p) => p.stage === "overdue")) return "overdue";
  if (parts.some((p) => p.stage === "due")) return "due";
  return "soon";
}

/**
 * 主旨以最急迫的階段起頭，但數字只算「該階段」的項目，其餘另外帶一句。
 *
 * 不能拿總數配上最急迫階段的措辭——三項裡只有一項逾期時，寫成「3 項逾期了」
 * 是不實的。
 */
function buildSubject(parts: OverduePart[]): string {
  const stage = worstStage(parts);
  const urgent = parts.filter((part) => part.stage === stage).length;
  const rest = parts.length - urgent;

  switch (stage) {
    case "overdue":
      return rest > 0
        ? `哇！${urgent} 項已經逾期，另有 ${rest} 項要注意`
        : `哇！有 ${urgent} 項該保養的項目逾期了`;
    case "due":
      return rest > 0
        ? `今天有 ${urgent} 項該保養，另有 ${rest} 項快到期`
        : `今天有 ${urgent} 項該保養囉`;
    case "soon":
      // soon 是最輕的階段，走到這裡代表全部都是 soon，urgent 就是總數。
      return `提醒你，${urgent} 項耗材快到期了`;
  }
}

/** 單一項目的狀態描述，例如「逾期 14 天」「今天到期」「15 天後到期」。 */
function statusText(part: OverduePart): string {
  if (part.daysOverdue > 0) return `逾期 ${part.daysOverdue} 天`;
  if (part.daysOverdue === 0) return "今天到期";
  return `${Math.abs(part.daysOverdue)} 天後到期`;
}

function lineOf(part: OverduePart): string {
  const action = ACTION_LABELS[part.action];
  return `${part.applianceName} — ${part.partName}（該${action}）｜${statusText(part)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 把一位使用者的逾期彙整算成一封信。
 *
 * text 與 html 兩種格式都要給：有些信件軟體只顯示純文字，而且缺少 text 版本
 * 會讓垃圾信分數變高。
 */
export function renderDigest(digest: UserDigest): RenderedEmail {
  const { nickname, parts } = digest;
  const subject = buildSubject(parts);

  const text = [
    `${nickname} 您好，`,
    ``,
    `以下項目該保養了：`,
    ``,
    ...parts.map((part) => `  ・${lineOf(part)}`),
    ``,
    `處理完之後，到 WowKeeper 按一下「完成保養」，週期就會重新開始：`,
    APP_URL,
    ``,
    `— WowKeeper`,
  ].join("\n");

  // 信件軟體對 CSS 的支援很有限，所以用 inline style、不用 class 或外部樣式表。
  const html = `
<div style="font-family:-apple-system,'Noto Sans TC',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#2b2622;">
  <p style="font-size:16px;margin:0 0 20px;">${escapeHtml(nickname)} 你好，</p>
  <p style="font-size:15px;margin:0 0 12px;">以下項目該保養了：</p>
  <ul style="padding-left:20px;margin:0 0 24px;">
    ${parts
      .map(
        (part) => `<li style="font-size:15px;line-height:1.9;">
      <strong>${escapeHtml(part.applianceName)}</strong> — ${escapeHtml(part.partName)}
      （該${ACTION_LABELS[part.action]}）
      <span style="color:${part.daysOverdue > 0 ? "#c0442e" : "#9a7b3f"};">｜${statusText(part)}</span>
    </li>`,
      )
      .join("\n    ")}
  </ul>
  <p style="font-size:14px;margin:0 0 20px;color:#6b625a;">
    處理完之後，到 WowKeeper 按一下「完成保養」，週期就會重新開始。
  </p>
  <p style="margin:0 0 28px;">
    <a href="${APP_URL}" style="display:inline-block;background:#c0442e;color:#fff;text-decoration:none;padding:11px 22px;border-radius:4px;font-size:15px;">
      打開 WowKeeper
    </a>
  </p>
  <p style="font-size:12px;color:#9c948c;margin:0;border-top:1px solid #e5ded6;padding-top:16px;">
    WowKeeper — 型號一秒查，濾網隨時換
  </p>
</div>`.trim();

  return { subject, text, html };
}
