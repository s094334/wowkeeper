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

export type PartAction = "replace" | "clean";

export type Part = {
  id: string;
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
