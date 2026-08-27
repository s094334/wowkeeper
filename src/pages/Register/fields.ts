import type { FieldConfig } from "../../types/form";

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  password2: string;
};

export const subTitle = "哇哇哇一起來註冊吧！";

export const fields: FieldConfig<RegisterFormValues>[] = [
  {
    label: "姓名",
    name: "name",
    type: "text",
    placeholder: "請輸入您的姓名",
    requiredMessage: "請輸入您的姓名",
  },
  {
    label: "電子郵件",
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
    placeholder: "至少 6 個字元",
    requiredMessage: "請輸入密碼",
    rules: {
      minLength: { value: 6, message: "密碼至少需要 6 個字元" },
    },
  },
  {
    label: "確認密碼",
    name: "password2",
    type: "password",
    placeholder: "再輸入一次",
    requiredMessage: "請再次輸入密碼",
    rules: {
      minLength: { value: 6, message: "密碼至少需要 6 個字元" },
      validate: (value, formValues) =>
        value === formValues.password || "再次輸入的密碼不符",
    },
  },
];
