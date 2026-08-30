import { SOON_WITHIN_DAYS } from "../shared/maintenance.js";
import type { OverduePart, UserDigest } from "./notifications.js";

const APP_URL = "https://wowkeeper.xin-ping.com";

export const MAIL_FROM = { email: "noreply@xin-ping.com", name: "WowKeeper" };

const C = {
  pageBg: "#EFE7DC", // --color-cream-300
  frameBg: "#F3EBE1", // --color-cream-200
  headerBg: "#FBF8F3", // --color-cream-50
  cardBg: "#FFFFFF", // --color-surface
  border: "#E7DFD4", // --color-cream-400
  divider: "#E1D7C9", // ⚠️ 信件專用，theme.css 無對應 token
  brand: "#b4653f", // --color-terracotta
  ink: "#2B2622", // --color-ink
  inkMuted: "#7A6E63", // --color-ink-muted
  inkFaint: "#A2968A", // --color-cream-800
  overdueBg: "rgb(254,233,231)", // --color-lamp-red-bg
  overdueFg: "rgb(144,11,9)", // --color-lamp-red-fg
  soonBg: "rgb(255,251,235)", // --color-lamp-amber-bg
  soonFg: "rgb(151,81,2)", // --color-lamp-amber-fg
} as const;

const FONT = `Inter, "Noto Sans TC", "Microsoft JhengHei", sans-serif`;

const ACTION_LABELS: Record<OverduePart["action"], string> = {
  replace: "更換",
  clean: "清潔",
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

function withUtm(path: string, content: string): string {
  return `${APP_URL}${path}?utm_source=email&utm_medium=notification&utm_campaign=maintenance&utm_content=${content}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusText(part: OverduePart): string {
  if (part.daysOverdue > 0) return `逾期 ${part.daysOverdue} 天`;
  if (part.daysOverdue === 0) return "今天到期";
  return `${Math.abs(part.daysOverdue)} 天後到期`;
}

function statusColors(part: OverduePart) {
  return part.daysOverdue > 0
    ? { bg: C.overdueBg, fg: C.overdueFg }
    : { bg: C.soonBg, fg: C.soonFg };
}

function sortByUrgency(parts: OverduePart[]): OverduePart[] {
  return [...parts].sort((a, b) => b.daysOverdue - a.daysOverdue);
}

function buildSubject(parts: OverduePart[]): string {
  const overdue = parts.filter((part) => part.daysOverdue > 0).length;
  const rest = parts.length - overdue;

  if (overdue > 0) {
    return rest > 0
      ? `【哇管家】耗材 ${overdue} 項已經逾期，另有 ${rest} 項要處理唷！`
      : `【哇管家】耗材 ${overdue} 項已經逾期囉！`;
  }
  return `【哇管家】有 ${rest} 項耗材要處理唷！`;
}

function buildPreheader(parts: OverduePart[]): string {
  const first = parts[0];
  if (!first) return "";
  return `${first.applianceName} ${first.partName} ${statusText(first)}`;
}

function renderCard(part: OverduePart): string {
  const { bg, fg } = statusColors(part);
  const href = withUtm(
    `/appliances/${part.applianceId}/parts/${part.partId}/edit`,
    "renew",
  );

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cardBg};border:1px solid ${C.border};border-radius:8px;margin:0 0 16px;">
  <tr>
    <td class="card-pad" align="center" style="padding:48px 32px;font-family:${FONT};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding:0 0 14px;">
            <span style="display:inline-block;background:${bg};color:${fg};padding:6px 16px;border-radius:9999px;font-size:14px;font-weight:600;letter-spacing:0.02em;">${statusText(part)}</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 0 4px;font-size:13px;color:${C.inkMuted};">${escapeHtml(part.applianceName)}</td>
        </tr>
        <tr>
          <td class="item-name" align="center" style="padding:0 0 4px;font-size:21px;font-weight:600;letter-spacing:-0.01em;color:${C.ink};">${escapeHtml(part.partName)}</td>
        </tr>
        <tr>
          <td align="center" style="padding:0 0 14px;font-size:14px;color:${C.inkMuted};">（該${ACTION_LABELS[part.action]}）</td>
        </tr>
        <tr>
          <td align="center">
            <a href="${href}" style="display:inline-block;padding:4px 0 2px;border-bottom:2px solid ${C.ink};font-size:14px;font-weight:600;color:${C.ink};text-decoration:none;">登記已更換 &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export function renderDigest(digest: UserDigest): RenderedEmail {
  const { nickname } = digest;
  const parts = sortByUrgency(digest.parts);
  const subject = buildSubject(parts);
  const preheader = buildPreheader(parts);

  const text = [
    `${nickname} 您好，`,
    ``,
    `以下項目該處理了：`,
    ``,
    ...parts.map(
      (part) =>
        `  ・${part.applianceName} — ${part.partName}（該${ACTION_LABELS[part.action]}）｜${statusText(part)}\n    處理完成：${withUtm(`/appliances/${part.applianceId}/parts/${part.partId}/edit`, "renew")}`,
    ),
    ``,
    `處理完之後，到 WowKeeper 按一下「登記已更換」，週期就會重新開始。`,
    withUtm("/", "cta"),
    ``,
    `— WowKeeper — 型號一秒查，濾網隨時換`,
    `這是系統自動發送的信件，請勿直接回覆。`,
  ].join("\n");

  const html = `<!doctype html>
    <html lang="zh-Hant">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(subject)}</title>
    <style>
      /* 只放 Outlook 修正與手機調整；其餘一律 inline style。 */
      table { border-collapse: collapse; }
      a { text-decoration: none; }
      @media only screen and (max-width: 600px) {
        .frame { width: 100% !important; }
        .body-pad { padding: 20px !important; }
        .head-pad { padding: 20px !important; }
        .card-pad { padding: 20px !important; }
        .item-name { font-size: 19px !important; }
      }
    </style>
    </head>
    <body style="margin:0;padding:0;background:${C.pageBg};">
      <!-- 收件匣預覽文字：不顯示在信件內容裡 -->
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.pageBg};">
        <tr>
          <td align="center" style="padding:24px 12px;">

            <table role="presentation" class="frame" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${C.frameBg};border:1px solid ${C.border};border-radius:8px;overflow:hidden;">

              <!-- 信頭 -->
              <tr>
                <td class="head-pad" style="background:${C.headerBg};border-bottom:3px solid ${C.brand};padding:22px 32px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="14" style="width:14px;font-size:0;line-height:0;">&nbsp;</td>
                      <td valign="middle" style="font-family:${FONT};">
                        <div style="font-size:19px;font-weight:700;letter-spacing:0.04em;color:${C.ink};">哇管家</div>
                        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${C.inkMuted};padding-top:2px;">WowKeeper &middot; 保養提醒</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- 內容 -->
              <tr>
                <td class="body-pad" style="padding:28px 32px 32px;font-family:${FONT};">

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left" style="padding:10px 20px;font-size:15px;line-height:1.7;color:${C.ink};text-align:left;">
                        ${escapeHtml(nickname)} 您好，
                        <div style="color:${C.inkMuted};padding-top:8px;">以下項目該處理了：</div>
                      </td>
                    </tr>
                  </table>

                  ${parts.map(renderCard).join("\n")}

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding:4px 0 20px;font-size:14px;line-height:1.7;color:${C.inkMuted};">
                        處理完之後，到 WowKeeper 按一下「登記已更換」，週期就會重新開始。
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:10px 24px;">
                        <a href="${withUtm("/", "cta")}" style="display:inline-block;background:${C.brand};color:#fff;padding:13px 30px;border-radius:4px;font-size:15px;font-weight:600;">打開 WowKeeper</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="height:1px;background:${C.divider};line-height:1px;font-size:0;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:20px 0 0;font-size:12px;line-height:1.7;color:${C.inkFaint};">
                        WowKeeper — 型號一秒查，濾網隨時換<br>
                        這是系統自動發送的信件，請勿直接回覆。
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>`;

  return { subject, text, html };
}

export const EMAIL_WITHIN_DAYS = SOON_WITHIN_DAYS;
