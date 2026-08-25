export type { LampStatus } from "../lib/status";

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
  brand?: string;
  model?: string;
  /** YYYY-MM-DD */
  purchasedAt?: string;
  parts: Part[];
};

export type ApplianceInput = {
  name: string;
  category: ApplianceCategory;
  brand?: string;
  model?: string;
  /** YYYY-MM-DD */
  purchasedAt?: string;
};

export type ListAppliancesResponse = {
  status: boolean;
  data: Appliance[];
};

export type GetApplianceResponse = {
  status: boolean;
  data: Appliance;
};

export type CreateApplianceResponse = {
  status: boolean;
  newAppliance: Appliance;
};

export type ApplianceMessageResponse = {
  status: boolean;
  message: string;
};

export type PartInput = {
  name: string;
  cycleMonths: number;
  action: PartAction;
  /** YYYY-MM-DD */
  lastReplacedAt: string;
};

export type CreatePartResponse = {
  status: boolean;
  newPart: Part;
};

/** 更新、刪除與一鍵保養只回訊息，沒有資料。 */
export type PartMessageResponse = {
  status: boolean;
  message: string;
};
