import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "../../components/AuthLayout";
import { FormError } from "../../components/FormError";
import { FormField } from "../../components/FormField";
import { fields, subTitle, type RegisterFormValues } from "./fields";

export function Register() {
  const navigate = useNavigate();
  const [errorLog, setErrorLog] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ mode: "onBlur" });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setErrorLog("");
    try {
      // TODO: await signUp({ email, password, nickname: values.name })
      // once POST /api/users/sign_up exists.
      console.log(values);
      navigate("/login", { replace: true, state: { justRegistered: true } });
    } catch {
      setErrorLog("發生錯誤，請稍後再試");
    }
  };

  return (
    <AuthLayout title="建立帳號" subtitle={subTitle}>
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
    </AuthLayout>
  );
}
