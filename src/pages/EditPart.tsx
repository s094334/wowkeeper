import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import ArrowLeft from "../assets/icons/ArrowLeft.svg?react";
import Trash from "../assets/icons/Trash.svg?react";
import { ApplianceNotFound } from "../components/ApplianceNotFound";
import { FormError } from "../components/FormError";
import { PartFields } from "../components/PartFields";
import {
  toPartInput,
  type PartFormValues,
} from "../components/PartFields/fields";
import { usePartForm } from "../hooks/usePartForm";
import { useAppliance } from "../hooks/useAppliances";
import { usePartMutations } from "../hooks/useParts";

const PAGE =
  "flex flex-1 flex-col gap-6 px-5 py-8 sm:mx-auto sm:w-full sm:max-w-150 sm:px-8";

export function EditPart() {
  const navigate = useNavigate();
  const { id, partId } = useParams();
  const { appliance, isLoading, isNotFound, errorLog } = useAppliance(id);
  const {
    editPart,
    removePart,
    renewPart,
    isEditing,
    isRemoving,
    isRenewing,
    errorLog: mutationErrors,
  } = usePartMutations(id);

  const part = appliance?.parts.find((item) => item.id === partId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = usePartForm({
    name: part?.name ?? "",
    cycleMonths: String(part?.cycleMonths ?? ""),
    action: part?.action ?? "replace",
    lastReplacedAt: part?.lastReplacedAt ?? "",
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

  if (!part) {
    return <ApplianceNotFound />;
  }

  const verb = part.action === "clean" ? "清洗" : "更換";

  const backToAppliance = () =>
    navigate(`/appliances/${appliance.id}`, { replace: true });

  const onSubmit: SubmitHandler<PartFormValues> = (values) => {
    editPart(
      { partId: part.id, input: toPartInput(values) },
      { onSuccess: backToAppliance },
    );
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `確定要刪除「${part.name}」嗎？更換紀錄會一併消失。`,
    );
    if (!confirmed) return;

    removePart(part.id, { onSuccess: backToAppliance });
  };

  return (
    <main className={PAGE}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-h1 font-semibold tracking-[-0.02em]">編輯耗材</h1>
          <p className="text-ink-muted truncate text-h3">{appliance.name}</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isRemoving}
          className="text-danger hover:bg-lamp-red-bg -mr-1.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full disabled:opacity-50"
        >
          <Trash width={18} height={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <PartFields register={register} errors={errors} />

        {mutationErrors.map((message, index) => (
          <FormError key={index}>{message}</FormError>
        ))}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => renewPart(part.id, { onSuccess: backToAppliance })}
            disabled={isRenewing}
            className="border-cream-400 bg-surface hover:bg-cream-100 hover:border-cream-600 h-12 w-full cursor-pointer rounded-md border text-[15px] font-medium disabled:opacity-60"
          >
            {isRenewing ? "登記中…" : `登記已${verb}`}
          </button>

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
        </div>
      </form>
    </main>
  );
}
