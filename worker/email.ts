import type { OverduePart, UserDigest } from "./notifications.js";

const APP_URL = "https://wowkeeper.xin-ping.com";

export const MAIL_FROM = { email: "noreply@xin-ping.com", name: "WowKeeper" };

const ACTION_LABELS: Record<OverduePart["action"], string> = {
  replace: "更換",
  clean: "清潔",
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

function worstStage(parts: OverduePart[]): OverduePart["stage"] {
  if (parts.some((p) => p.stage === "overdue")) return "overdue";
  if (parts.some((p) => p.stage === "due")) return "due";
  return "soon";
}

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
        ? `今天有 ${urgent} 項該保養，另有 ${rest} 項要注意`
        : `今天有 ${urgent} 項該保養囉`;
    case "soon":
      return `提醒你，${urgent} 項要注意`;
  }
}

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

  const html = `
<div style="font-family:-apple-system,'Noto Sans TC',sans-serif;max-width:520px;margin:0;padding:24px;color:#2b2622;">
  <p style="font-size:16px;margin:0 0 20px;">${escapeHtml(nickname)} 您好，</p>
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
