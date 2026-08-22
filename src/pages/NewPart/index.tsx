import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { findAppliance } from "../../api/appliances";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { FormError } from "../../components/common/FormError";
import { PartFields } from "../../components/PartFields";
import type { PartFormValues } from "../../components/PartFields/fields";
import { usePartForm } from "../../components/PartFields/usePartForm";

export function NewPart() {
  const navigate = useNavigate();
  const { id } = useParams();
  const appliance = findAppliance(id);
  const [errorLog, setErrorLog] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = usePartForm();

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
        <PartFields register={register} errors={errors} />

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
