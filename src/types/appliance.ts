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

/**
 * 新增家電時可以夾帶耗材，後端會用一個 transaction 一起寫入。
 * 更新家電不吃 parts，所以只有新增用這個型別。
 */
export type CreateApplianceInput = ApplianceInput & {
  parts?: PartInput[];
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

export type PartMessageResponse = {
  status: boolean;
  message: string;
};
