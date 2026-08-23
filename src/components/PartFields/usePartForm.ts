import { useForm } from "react-hook-form";
import type { PartFormValues } from "./fields";

export function usePartForm(defaultValues?: Partial<PartFormValues>) {
  return useForm<PartFormValues>({
    mode: "onBlur",
    defaultValues: { action: "replace", ...defaultValues },
  });
}
