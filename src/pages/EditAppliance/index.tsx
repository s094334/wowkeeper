import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import Trash from "../../assets/icons/Trash.svg?react";
import { ApplianceFields } from "../../components/ApplianceFields";
import {
  toApplianceInput,
  type ApplianceFormValues,
} from "../../components/ApplianceFields/fields";
import { FormError } from "../../components/common/FormError";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { useApplianceForm } from "../../hooks/useApplianceForm";
import { useAppliance, useApplianceMutations } from "../../hooks/useAppliances";

const PAGE =
  "flex flex-1 flex-col gap-6 px-5 py-8 sm:mx-auto sm:w-full sm:max-w-150 sm:px-8";

export function EditAppliance() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { appliance, isLoading, isNotFound, errorLog } = useAppliance(id);
  const {
    editAppliance,
    removeAppliance,
    isEditing,
    isRemoving,
    errorLog: mutationErrors,
  } = useApplianceMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useApplianceForm({
    name: appliance?.name ?? "",
    brand: appliance?.brand ?? "",
    model: appliance?.model ?? "",
    purchasedAt: appliance?.purchasedAt ?? "",
    category: appliance?.category ?? "",
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

  const handleDelete = () => {
    const confirmed = window.confirm(
      `確定要刪除「${appliance.name}」嗎？底下的 ${appliance.parts.length} 項耗材也會一起刪除。`,
    );
    if (!confirmed) return;

    removeAppliance(appliance.id, {
      onSuccess: () => navigate("/", { replace: true }),
    });
  };

  return (
    <main className={PAGE}>
      <div className="flex items-center gap-2">
        <h1 className="min-w-0 flex-1 text-h1 font-semibold tracking-[-0.02em]">
          編輯家電
        </h1>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isRemoving}
          aria-label="刪除家電"
          className="text-danger hover:bg-lamp-red-bg -mr-1.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full disabled:opacity-50"
        >
          <Trash width={18} height={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <ApplianceFields register={register} errors={errors} />

        {mutationErrors.map((message, index) => (
          <FormError key={index}>{message}</FormError>
        ))}

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="wk-cta-ghost flex flex-1 cursor-pointer items-center justify-center gap-2"
          >
            <ArrowLeft width={16} height={16} />
            上一頁
          </button>

          <button
            type="submit"
            disabled={isEditing}
            className="wk-cta flex-1 cursor-pointer disabled:opacity-60"
          >
            {isEditing ? "儲存中…" : "儲存"}
          </button>
        </div>
      </form>
    </main>
  );
}
