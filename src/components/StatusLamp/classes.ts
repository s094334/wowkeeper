import type { LampStatus } from "../../types/appliance";

export const LAMP_CLASS: Record<LampStatus, string> = {
  overdue: "wk-lamp-overdue",
  soon: "wk-lamp-soon",
  ok: "wk-lamp-ok",
};
