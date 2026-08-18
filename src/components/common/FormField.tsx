import type {
  FieldError,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";
import type { FieldConfig } from "../../types/form";

/** One config entry, plus the two things only the page can hand over. */
type FormFieldProps<T extends FieldValues> = FieldConfig<T> & {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
};

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
          error ? "border-danger" : "border-cream-400 focus:border-terracotta"
        }`}
        {...props}
        {...register(name, { required: requiredMessage, ...rules })}
      />
      {error && <p className="text-danger text-2xs">{error.message}</p>}
    </div>
  );
}
