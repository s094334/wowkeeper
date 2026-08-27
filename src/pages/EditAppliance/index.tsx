import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import { ApplianceFields } from "../../components/ApplianceFields";
import {
  toApplianceInput,
  type ApplianceFormValues,
} from "../../components/ApplianceFields/fields";
import { FormError } from "../../components/common/FormError";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { useAppliance, useApplianceMutations } from "../../hooks/useAppliances";

const PAGE =
  "flex flex-1 flex-col gap-6 px-5 py-8 sm:mx-auto sm:w-full sm:max-w-150 sm:px-8";

export function EditAppliance() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { appliance, isLoading, isNotFound, errorLog } = useAppliance(id);
  const {
    editAppliance,
    isEditing,
    errorLog: mutationErrors,
  } = useApplianceMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplianceFormValues>({
    mode: "onBlur",
    values: {
      name: appliance?.name ?? "",
      brand: appliance?.brand ?? "",
      model: appliance?.model ?? "",
      purchasedAt: appliance?.purchasedAt ?? "",
      category: appliance?.category ?? "",
    },
  });

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

  const onSubmit: SubmitHandler<ApplianceFormValues> = (values) => {
    editAppliance(
      { id: appliance.id, input: toApplianceInput(values) },
      {
        onSuccess: () =>
          navigate(`/appliances/${appliance.id}`, { replace: true }),
      },
    );
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
        <h1 className="text-h1 font-semibold tracking-[-0.02em]">編輯家電</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <ApplianceFields register={register} errors={errors} />

        {mutationErrors.map((message, index) => (
          <FormError key={index}>{message}</FormError>
        ))}

        <button
          type="submit"
          disabled={isEditing}
          className="wk-cta w-full cursor-pointer disabled:opacity-60"
        >
          {isEditing ? "儲存中…" : "儲存"}
        </button>
      </form>
    </main>
  );
}
