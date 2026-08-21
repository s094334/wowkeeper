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
  const indent = props.type === "date" ? "pl-1.5" : "pl-2";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-ink-muted flex items-center gap-1.5 text-body font-medium"
      >
        {label}
        {requiredMessage && <span className="text-danger text-xs">必填</span>}
      </label>
      <input
        id={name}
        className={`placeholder:text-cream-700 text-sm border-b pb-2.5 outline-none ${indent} ${
          error ? "border-danger" : "border-cream-400 focus:border-terracotta"
        }`}
        {...props}
        {...register(name, { required: requiredMessage, ...rules })}
      />
      {error && <p className="text-danger text-xs">{error.message}</p>}
    </div>
  );
}
