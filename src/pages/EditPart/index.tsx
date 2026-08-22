import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { findAppliance } from "../../api/appliances";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import Trash from "../../assets/icons/Trash.svg?react";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { FormError } from "../../components/common/FormError";
import { PartFields } from "../../components/PartFields";
import type { PartFormValues } from "../../components/PartFields/fields";
import { usePartForm } from "../../components/PartFields/usePartForm";

export function EditPart() {
  const navigate = useNavigate();
  const { id, partId } = useParams();
  const appliance = findAppliance(id);
  const part = appliance?.parts?.find((item) => item.id === partId);
  const [errorLog, setErrorLog] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = usePartForm({
    name: part?.name ?? "",
    cycleMonths: String(part?.cycleMonths ?? ""),
    action: part?.action ?? "replace",
    lastReplacedAt: part?.lastReplacedAt ?? "",
  });

  if (!appliance || !part) {
    return <ApplianceNotFound />;
  }

  const backToAppliance = () =>
    navigate(`/appliances/${appliance.id}`, { replace: true });

  const onSubmit: SubmitHandler<PartFormValues> = async (values) => {
    setErrorLog("");
    try {
      console.log({ ...values, cycleMonths: Number(values.cycleMonths) });
      backToAppliance();
    } catch {
      setErrorLog("儲存失敗，請稍後再試");
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(
      `確定要刪除「${part.name}」嗎？更換紀錄會一併消失。`,
    );
    if (!ok) return;

    setErrorLog("");
    try {
      console.log("刪除", part.id);
      backToAppliance();
    } catch {
      setErrorLog("刪除失敗，請稍後再試");
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
          <h1 className="text-h1 font-semibold tracking-[-0.02em]">編輯耗材</h1>
          <p className="text-ink-muted truncate text-h3">{appliance.name}</p>
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
          儲存
        </button>
      </form>

      <div className="border-cream-400 border-t pt-6">
        <button
          type="button"
          onClick={handleDelete}
          className="text-danger hover:bg-lamp-red-bg flex w-full cursor-pointer items-center justify-center gap-2 rounded-xs py-2.5 text-sm font-medium"
        >
          <Trash width={16} height={16} />
          刪除這個耗材
        </button>
      </div>
    </main>
  );
}
