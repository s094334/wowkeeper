import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField } from "../common/FormField";
import { ACTION_LABELS, fields, type PartFormValues } from "./fields";

type PartFieldsProps = {
  register: UseFormRegister<PartFormValues>;
  errors: FieldErrors<PartFormValues>;
};

export function PartFields(props: PartFieldsProps) {
  const { register, errors } = props;

  return (
    <div className="wk-card-outline flex flex-col gap-4 p-4.5">
      {fields.map((field) => (
        <FormField
          key={field.name}
          {...field}
          register={register}
          errors={errors}
        />
      ))}

      <div className="flex flex-col gap-1.5">
        <span className="text-ink-muted text-xs font-medium">處理方式</span>
        <div className="flex gap-2">
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="border-cream-400 has-checked:border-terracotta has-checked:text-terracotta hover:bg-cream-100 flex flex-1 cursor-pointer items-center justify-center rounded-xs border py-2.5 text-sm font-medium"
            >
              <input
                type="radio"
                value={value}
                {...register("action", { required: "請選擇處理方式" })}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        {errors.action && (
          <p className="text-danger text-2xs">{errors.action.message}</p>
        )}
      </div>
    </div>
  );
}
