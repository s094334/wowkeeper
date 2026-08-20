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
};
