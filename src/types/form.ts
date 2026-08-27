import type { ComponentProps } from "react";
import type { FieldValues, Path, RegisterOptions } from "react-hook-form";

/** 後端失敗時統一回 { status: false, message }。 */
export type ApiErrorBody = {
  status: false;
  message: string;
};

export type FieldConfig<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  type: string;
  placeholder?: string;
  requiredMessage?: string;
  rules?: RegisterOptions<T, Path<T>>;
} & ComponentProps<"input">;
