import type { PartAction, PartInput } from "../../types/appliance";
import type { FieldConfig } from "../../types/form";

export type PartFormValues = {
  name: string;
  cycleMonths: string;
  action: PartAction | "";
  lastReplacedAt: string;
};

/**
 * 表單值轉成要送給後端的 body。
 *
 * cycleMonths 一定要轉成數字：<input type="number"> 拿到的還是字串，而 worker 的
 * validatePartInput 用 typeof 檢查，收到 "6" 會直接判定驗證失敗。
 */
export function toPartInput(values: PartFormValues): PartInput {
  return {
    name: values.name.trim(),
    cycleMonths: Number(values.cycleMonths),
    // 送出前一定通過了 required 驗證，所以這裡不會是空字串。
    action: values.action as PartAction,
    lastReplacedAt: values.lastReplacedAt,
  };
}

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
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
    requiredMessage: "請輸入更換週期",
    rules: {
      min: { value: 1, message: "至少 1 個月" },
      max: { value: 120, message: "最多 120 個月" },
    },
  },
  {
    label: "上次更換日期",
    name: "lastReplacedAt",
    type: "date",
    max: today(),
    requiredMessage: "請選擇上次更換的日期",
  },
];
