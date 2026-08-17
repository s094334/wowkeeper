import type { FieldConfig } from "../../types/form";

export type LoginFormValues = {
  email: string;
  password: string;
};

export const subTitle = "型號一秒查，濾網準時換。";

export const fields: FieldConfig<LoginFormValues>[] = [
  {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "you@studio.co",
    requiredMessage: "請輸入 email",
    rules: {
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "請輸入正確的 email 格式",
      },
    },
  },
  {
    label: "密碼",
    name: "password",
    type: "password",
    placeholder: "請輸入密碼",
    requiredMessage: "請輸入密碼",
  },
];
