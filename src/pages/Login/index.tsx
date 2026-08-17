import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { fields, subTitle, type LoginFormValues } from "./fields";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const justRegistered = (location.state as { justRegistered?: boolean } | null)
    ?.justRegistered;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onBlur" });

  const onSubmit: SubmitHandler<LoginFormValues> = (values) => {
    console.log(values);
    navigate("/", { replace: true });
  };

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pt-14 pb-10 sm:mx-auto sm:w-full sm:max-w-105 sm:justify-center sm:py-12">
      <div className="flex flex-col gap-3.5">
        <p className="text-terracotta text-sm font-semibold tracking-[0.02em]">
          哇管家 WowKeeper
        </p>
        <h1 className="text-hero font-semibold">登入</h1>
        <p className="text-ink-muted text-body">{subTitle}</p>
      </div>

      {justRegistered && (
        <p className="bg-lamp-green-bg text-lamp-green-fg rounded-sm px-3 py-2.5 text-xs">
          註冊成功，請用剛才的帳號登入。
        </p>
      )}

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
            登入
          </button>
          <p className="text-ink-muted text-center text-xs">
            還沒有帳號？
            <Link to="/register" className="text-ink font-medium underline">
              註冊
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
