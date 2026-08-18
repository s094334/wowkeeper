import type { ComponentProps } from "react";
import type { FieldValues, Path, RegisterOptions } from "react-hook-form";

export type FieldConfig<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  type: string;
  placeholder?: string;
  requiredMessage?: string;
  rules?: RegisterOptions<T, Path<T>>;
} & ComponentProps<"input">;
