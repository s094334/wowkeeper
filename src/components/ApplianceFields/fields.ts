import type { ApplianceCategory } from "../../types/appliance";
import type { FieldConfig } from "../../types/form";

export type ApplianceFormValues = {
  name: string;
  brand: string;
  model: string;
  purchasedAt: string;
  category: ApplianceCategory | "";
};

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export const fields: FieldConfig<ApplianceFormValues>[] = [
  {
    label: "名稱",
    name: "name",
    type: "text",
    placeholder: "例：客廳冷氣",
    requiredMessage: "請輸入家電名稱",
  },
  {
    label: "品牌",
    name: "brand",
    type: "text",
    placeholder: "例：大金 DAIKIN",
  },
  {
    label: "型號",
    name: "model",
    type: "text",
    placeholder: "家電的那一串英文加數字",
  },
  {
    label: "購買日期",
    name: "purchasedAt",
    type: "date",
    max: today(),
  },
];
