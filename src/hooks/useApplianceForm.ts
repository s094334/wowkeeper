import { useForm } from "react-hook-form";
import type { ApplianceFormValues } from "../components/ApplianceFields/fields";

export function useApplianceForm(values?: ApplianceFormValues) {
  return useForm<ApplianceFormValues>({
    mode: "onBlur",
    defaultValues: { category: "" },
    values,
  });
}
