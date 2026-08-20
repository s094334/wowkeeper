export type LampStatus = "overdue" | "soon" | "ok";

export type ApplianceCategory =
  | "aircon"
  | "waterPurifier"
  | "washer"
  | "fridge"
  | "dehumidifier"
  | "waterHeater"
  | "tv"
  | "maintenance"
  | "other";

/** 濾網用洗的、濾芯用換的，按鈕文案和提醒語氣都不一樣。 */
export type PartAction = "replace" | "clean";

export type Part = {
  id: string;
  /** 室內機濾網 */
  name: string;
  cycleMonths: number;
  action: PartAction;
  /** YYYY-MM-DD */
  lastReplacedAt: string;
};

export type Appliance = {
  id: string;
  name: string;
  category: ApplianceCategory;
  status: LampStatus;
  statusText: string;
  brand?: string;
  model?: string;
  /** YYYY-MM-DD */
  purchasedAt?: string;
  parts?: Part[];
};
