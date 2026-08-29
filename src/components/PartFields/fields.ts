import { taipeiToday } from "../../../shared/maintenance";
import type { PartAction, PartInput } from "../../types/appliance";
import type { FieldConfig } from "../../types/form";

export type PartFormValues = {
  name: string;
  cycleMonths: string;
  action: PartAction | "";
  lastReplacedAt: string;
};

export function toPartInput(values: PartFormValues): PartInput {
  return {
    name: values.name.trim(),
    cycleMonths: Number(values.cycleMonths),
    action: values.action as PartAction,
    lastReplacedAt: values.lastReplacedAt,
  };
}

export const ACTION_LABELS: Record<PartAction, string> = {
  replace: "更換",
  clean: "清洗",
};

export const fields: FieldConfig<PartFormValues>[] = [
  {
    label: "名稱",
    name: "name",
    type: "text",
    placeholder: "例：室內機濾網",
    requiredMessage: "請輸入耗材名稱",
  },
  {
    label: "週期（幾個月）",
    name: "cycleMonths",
    type: "number",
    inputMode: "numeric",
    placeholder: "例：6",
    min: 1,
    max: 120,
    requiredMessage: "請輸入處理週期",
    rules: {
      min: { value: 1, message: "至少 1 個月" },
      max: { value: 120, message: "最多 120 個月" },
    },
  },
  {
    label: "上次處理日期",
    name: "lastReplacedAt",
    type: "date",
    max: taipeiToday(),
    requiredMessage: "請選擇上次處理的日期",
  },
];
