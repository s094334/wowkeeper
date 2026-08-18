import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { AuthLayout } from "../../components/common/AuthLayout";
import { FormError } from "../../components/common/FormError";
import { FormField } from "../../components/common/FormField";
import { fields, subTitle, type LoginFormValues } from "./fields";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorLog, setErrorLog] = useState("");

  const justRegistered = (location.state as { justRegistered?: boolean } | null)
    ?.justRegistered;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onBlur" });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setErrorLog("");
    try {
      // TODO: await signIn(values) once POST /api/users/sign_in exists.
      console.log(values);
      navigate("/", { replace: true });
    } catch {
      setErrorLog("發生錯誤，請稍後再試");
    }
  };

  return (
    <AuthLayout title="登入" subtitle={subTitle}>
      {justRegistered && (
        <p className="bg-lamp-green-bg text-lamp-green-fg rounded-sm px-3 py-2.5 text-xs">
          註冊成功，請用剛才的帳號登入。
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="wk-card flex flex-col gap-4 p-4.5">
          {fields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              register={register}
              errors={errors}
            />
          ))}
        </div>

        {errorLog && <FormError>{errorLog}</FormError>}

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
    </AuthLayout>
  );
}
