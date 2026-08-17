import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { fields, subTitle, type RegisterFormValues } from "./fields";

export function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ mode: "onBlur" });

  const onSubmit: SubmitHandler<RegisterFormValues> = (values) => {
    console.log(values);
    navigate("/login", { replace: true, state: { justRegistered: true } });
  };

  return (
    <main className="flex flex-1 flex-col gap-7 px-6 py-4 sm:mx-auto sm:w-full sm:max-w-120 sm:justify-center sm:py-12">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-title font-semibold">建立帳號</h1>
        <p className="text-ink-muted text-body">{subTitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="wk-card flex flex-col gap-4 p-4.5">
          {fields.map((field) => {
            const error = errors[field.name];

            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.name}
                  className="text-ink-muted text-xs font-medium"
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name, {
                    required: field.requiredMessage,
                    ...field.rules,
                  })}
                  className={`placeholder:text-cream-700 text-body border-b pb-2.5 outline-none ${
                    error
                      ? "border-danger"
                      : "border-cream-300 focus:border-terracotta"
                  }`}
                />
                {error && (
                  <p className="text-danger text-2xs">{error.message}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3.5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="wk-cta w-full cursor-pointer disabled:opacity-60"
          >
            建立帳號
          </button>
          <p className="text-ink-muted text-center text-xs">
            已經有帳號？
            <Link to="/login" className="text-ink font-medium underline">
              登入
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
