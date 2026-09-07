import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField } from "../FormField";
import { ACTION_LABELS, fields, type PartFormValues } from "./fields";

type PartFieldsProps = {
  register: UseFormRegister<PartFormValues>;
  errors: FieldErrors<PartFormValues>;
  footer?: ReactNode;
};

export function PartFields(props: PartFieldsProps) {
  const { register, errors, footer } = props;

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
        <span className="text-ink-muted text-body font-medium">處理方式</span>
        <div className="bg-cream-200 flex gap-1 rounded-md p-1">
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="text-ink-muted has-checked:bg-surface has-checked:text-terracotta has-checked:shadow-card flex flex-1 cursor-pointer items-center justify-center rounded-sm py-2 text-sm font-medium has-checked:font-semibold"
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

      {footer && (
        <div className="border-cream-300 -mx-4.5 -mb-4.5 border-t px-4.5 pt-3.5 pb-3.5">
          {footer}
        </div>
      )}
    </div>
  );
}
