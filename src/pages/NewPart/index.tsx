import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { FormError } from "../../components/FormError";
import { PartFields } from "../../components/PartFields";
import {
  toPartInput,
  type PartFormValues,
} from "../../components/PartFields/fields";
import { usePartForm } from "../../hooks/usePartForm";
import { useAppliance } from "../../hooks/useAppliances";
import { usePartMutations } from "../../hooks/useParts";

const PAGE =
  "flex flex-1 flex-col gap-6 px-5 py-8 sm:mx-auto sm:w-full sm:max-w-150 sm:px-8";

export function NewPart() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { appliance, isLoading, isNotFound, errorLog } = useAppliance(id);
  const { addPart, isAdding, errorLog: mutationErrors } = usePartMutations(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = usePartForm();

  if (isLoading) {
    return (
      <main className={PAGE}>
        <p className="text-ink-muted text-xs">載入中…</p>
      </main>
    );
  }

  if (isNotFound) {
    return <ApplianceNotFound />;
  }

  if (!appliance) {
    return (
      <main className={PAGE}>
        <FormError>{errorLog[0] ?? "發生錯誤，請稍後再試"}</FormError>
      </main>
    );
  }

  const onSubmit: SubmitHandler<PartFormValues> = (values) => {
    addPart(toPartInput(values), {
      onSuccess: () =>
        navigate(`/appliances/${appliance.id}`, { replace: true }),
    });
  };

  return (
    <main className={PAGE}>
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

        {mutationErrors.map((message, index) => (
          <FormError key={index}>{message}</FormError>
        ))}

        <button
          type="submit"
          disabled={isAdding}
          className="wk-cta w-full cursor-pointer disabled:opacity-60"
        >
          {isAdding ? "新增中…" : "新增耗材"}
        </button>
      </form>
    </main>
  );
}
