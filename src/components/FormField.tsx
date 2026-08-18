import type { ComponentProps } from "react";
import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

type FormFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  requiredMessage: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  rules?: RegisterOptions<T, Path<T>>;
} & ComponentProps<"input">;

export function FormField<T extends FieldValues>({
  label,
  name,
  requiredMessage,
  register,
  errors,
  rules,
  ...props
}: FormFieldProps<T>) {
  const error = errors[name] as FieldError | undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-ink-muted text-xs font-medium">
        {label}
      </label>
      <input
        id={name}
        className={`placeholder:text-cream-700 text-body border-b pb-2.5 outline-none ${
          error ? "border-danger" : "border-cream-300 focus:border-terracotta"
        }`}
        {...props}
        {...register(name, { required: requiredMessage, ...rules })}
      />
      {error && <p className="text-danger text-2xs">{error.message}</p>}
    </div>
  );
}
