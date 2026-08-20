import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import { ApplianceFields } from "../../components/ApplianceFields";
import type { ApplianceFormValues } from "../../components/ApplianceFields/fields";
import { FormError } from "../../components/common/FormError";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { APPLIANCES } from "../../data/appliances";

export function EditAppliance() {
  const navigate = useNavigate();
  const { id } = useParams();
  const appliance = APPLIANCES.find((item) => item.id === id);
  const [errorLog, setErrorLog] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplianceFormValues>({
    mode: "onBlur",
    defaultValues: {
      name: appliance?.name ?? "",
      brand: appliance?.brand ?? "",
      model: appliance?.model ?? "",
      purchasedAt: appliance?.purchasedAt ?? "",
      category: appliance?.category ?? "",
    },
  });

  if (!appliance) {
    return <ApplianceNotFound />;
  }

  const onSubmit: SubmitHandler<ApplianceFormValues> = async (values) => {
    setErrorLog("");
    try {
      console.log(values);
      navigate(`/appliances/${appliance.id}`, { replace: true });
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
        <h1 className="text-h1 font-semibold tracking-[-0.02em]">編輯家電</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <ApplianceFields register={register} errors={errors} />

        {errorLog && <FormError>{errorLog}</FormError>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="wk-cta w-full cursor-pointer disabled:opacity-60"
        >
          儲存
        </button>
      </form>
    </main>
  );
}
