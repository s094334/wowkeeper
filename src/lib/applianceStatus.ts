import { computeApplianceStatus, type LampStatus } from "./status";
import type { Appliance } from "../types/appliance";

const STATUS_TEXT = {
  ok: () => "哇～優秀",
  overdue: (name: string, daysLeft: number) =>
    `${name}逾期 ${Math.abs(daysLeft)} 天`,
  soon: (name: string, daysLeft: number) => `${name} ${daysLeft} 天後`,
};

export type ApplianceWithStatus = {
  appliance: Appliance;
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
