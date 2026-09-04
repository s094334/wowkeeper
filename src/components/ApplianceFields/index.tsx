import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { APPLIANCE_CATEGORY_LABELS } from "../../data/appliances";
import { FormField } from "../FormField";
import { fields, type ApplianceFormValues } from "./fields";

type ApplianceFieldsProps = {
  register: UseFormRegister<ApplianceFormValues>;
  errors: FieldErrors<ApplianceFormValues>;
};

export function ApplianceFields({ register, errors }: ApplianceFieldsProps) {
  return (
    <div className="wk-card-outline flex flex-col gap-4 p-4.5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="category"
          className="text-ink-muted flex items-center gap-1.5 text-body font-medium"
        >
          家電類型
          <span className="text-danger text-xs">必填</span>
        </label>
        <select
          id="category"
          {...register("category", { required: "請選擇家電類型" })}
          className="border-cream-400 focus:border-terracotta text-sm cursor-pointer border-b py-2.5 pl-1 outline-none"
        >
          <option value="">選擇家電類型</option>
          {Object.entries(APPLIANCE_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-danger text-xs">{errors.category.message}</p>
        )}
      </div>

      {fields.map((field) => (
        <FormField
          key={field.name}
          {...field}
          register={register}
          errors={errors}
        />
      ))}
    </div>
  );
}
