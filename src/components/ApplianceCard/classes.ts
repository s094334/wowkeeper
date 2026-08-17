import type { LampStatus } from "../../types/appliance";

export const DOT_CLASS: Record<LampStatus, string> = {
  overdue: "wk-dot-overdue",
  soon: "wk-dot-soon",
  ok: "wk-dot-ok",
};
