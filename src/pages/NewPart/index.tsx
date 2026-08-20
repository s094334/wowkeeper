import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { findAppliance } from "../../api/appliances";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { FormError } from "../../components/common/FormError";
import { FormField } from "../../components/common/FormField";
import { ACTION_LABELS, fields, type PartFormValues } from "./fields";

export function NewPart() {
  const navigate = useNavigate();
  const { id } = useParams();
  const appliance = findAppliance(id);
  const [errorLog, setErrorLog] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartFormValues>({
    mode: "onBlur",
    defaultValues: { action: "replace" },
  });

  if (!appliance) {
    return <ApplianceNotFound />;
  }

  const onSubmit: SubmitHandler<PartFormValues> = async (values) => {
    setErrorLog("");
    try {
      console.log({ ...values });
      navigate(-1);
    } catch {
      setErrorLog("儲存失敗，請稍後再試");
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8 sm:mx-auto sm:w-full sm:max-w-150 sm:px-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-ink hover:bg-cream-100 -ml-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
        >
          <ArrowLeft width={20} height={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-h1 font-semibold tracking-[-0.02em]">新增耗材</h1>
          <p className="text-ink-muted truncate text-xs">{appliance.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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

        {errorLog && <FormError>{errorLog}</FormError>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="wk-cta w-full cursor-pointer disabled:opacity-60"
        >
          新增耗材
        </button>
      </form>
    </main>
  );
}
