import {
  computeApplianceStatus,
  daysUntilDue,
  statusOf,
  type LampStatus,
} from "./computeStatus";
import type { Appliance, Part } from "../types/appliance";

function daysText(status: LampStatus, daysLeft: number): string {
  return status === "overdue"
    ? `逾期 ${Math.abs(daysLeft)} 天`
    : `${daysLeft} 天後`;
}

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
