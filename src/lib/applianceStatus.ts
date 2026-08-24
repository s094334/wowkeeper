import {
  computeApplianceStatus,
  daysUntilDue,
  statusOf,
  type LampStatus,
} from "./status";
import type { Appliance, Part } from "../types/appliance";

/**
 * 單筆耗材的狀態文案，不帶耗材名稱——詳情頁的卡片上方已經顯示名稱了。
 * ok 與 soon 的文字相同（都是「還有幾天」），差別只在燈號顏色。
 */
function daysText(status: LampStatus, daysLeft: number): string {
  return status === "overdue"
    ? `逾期 ${Math.abs(daysLeft)} 天`
    : `${daysLeft} 天後`;
}

/** 家電層級的文案：在剩餘天數前面冠上最急迫的那筆耗材名稱。 */
const STATUS_TEXT = {
  ok: () => "哇～優秀",
  overdue: (name: string, daysLeft: number) =>
    `${name}${daysText("overdue", daysLeft)}`,
  soon: (name: string, daysLeft: number) =>
    `${name} ${daysText("soon", daysLeft)}`,
};

export type ApplianceWithStatus = {
  appliance: Appliance;
  status: LampStatus;
  statusText: string;
};

export type PartWithStatus = {
  part: Part;
  status: LampStatus;
  statusText: string;
};

export function withStatus(
  appliances: Appliance[],
  today: Date = new Date(),
): ApplianceWithStatus[] {
  return appliances.map((appliance) => {
    const { status, worst } = computeApplianceStatus(appliance.parts, today);

    return {
      appliance,
      status,
      statusText: worst
        ? STATUS_TEXT[status](worst.name, worst.daysLeft)
        : STATUS_TEXT.ok(),
    };
  });
}

/** 同一台家電底下的每筆耗材各自的狀態，整批共用同一個「今天」。 */
export function withPartStatus(
  parts: Part[],
  today: Date = new Date(),
): PartWithStatus[] {
  return parts.map((part) => {
    const daysLeft = daysUntilDue(part, today);
    const status = statusOf(daysLeft);

    return { part, status, statusText: daysText(status, daysLeft) };
  });
}
