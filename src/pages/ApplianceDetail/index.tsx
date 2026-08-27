import { Link, useNavigate, useParams } from "react-router";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import Pencil from "../../assets/icons/Pencil.svg?react";
import Trash from "../../assets/icons/Trash.svg?react";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { FormError } from "../../components/common/FormError";
import { PartList } from "../../components/PartList";
import { useAppliance, useApplianceMutations } from "../../hooks/useAppliances";
import {
  APPLIANCE_CATEGORY_LABELS,
  APPLIANCE_ICONS,
} from "../../data/appliances";

const PAGE = "flex flex-1 flex-col sm:mx-auto sm:w-full sm:max-w-150";

export function ApplianceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { appliance, isLoading, isNotFound, errorLog } = useAppliance(id);
  const {
    removeAppliance,
    isRemoving,
    errorLog: mutationErrors,
  } = useApplianceMutations();

  if (isLoading) {
    return (
      <main className={PAGE}>
        <p className="text-ink-muted px-5 pt-6 text-xs sm:px-8">載入中…</p>
      </main>
    );
  }

  if (isNotFound) {
    return <ApplianceNotFound />;
  }

  if (!appliance) {
    return (
      <main className={PAGE}>
        <div className="px-5 pt-6 sm:px-8">
          <FormError>{errorLog[0] ?? "發生錯誤，請稍後再試"}</FormError>
        </div>
      </main>
    );
  }

  const { name, category, brand, model, purchasedAt, parts } = appliance;
  const Icon = APPLIANCE_ICONS[category];

  const handleDelete = () => {
    const confirmed = window.confirm(
      `確定要刪除「${name}」嗎？底下的 ${parts.length} 項耗材也會一起刪除。`,
    );
    if (!confirmed) return;

    removeAppliance(appliance.id, {
      onSuccess: () => navigate("/", { replace: true }),
    });
  };

  return (
    <main className={PAGE}>
      <div className="border-cream-400 flex flex-col gap-4 border-b px-5 pt-2 pb-4.5 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-ink hover:bg-cream-100 -ml-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full self-start"
        >
          <ArrowLeft width={20} height={20} />
        </button>

        <div className="flex flex-col gap-2">
          <div className="text-ink-muted flex items-center gap-2 text-xs">
            <Icon width={15} height={15} className="shrink-0" />
            <span className="truncate">
              {APPLIANCE_CATEGORY_LABELS[category]}
              {brand && ` · ${brand}`}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-h1 leading-[1.25] font-semibold tracking-[-0.02em]">
              {name}
            </h1>
            <div className="flex shrink-0 items-center gap-3.5">
              <Link
                to={`/appliances/${appliance.id}/edit`}
                className="text-ink hover:bg-cream-100 flex size-9 items-center justify-center rounded-full"
              >
                <Pencil width={18} height={18} />
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isRemoving}
                className="text-danger hover:bg-lamp-red-bg -mr-2 flex size-9 cursor-pointer items-center justify-center rounded-full disabled:opacity-50"
              >
                <Trash width={18} height={18} />
              </button>
            </div>
          </div>

          {(model || purchasedAt) && (
            <div className="mt-0.5 flex items-center gap-2">
              {model && (
                <span className="border-cream-400 bg-surface rounded-xs border px-2.5 py-[5px] text-sm font-medium tracking-[-0.01em]">
                  {model}
                </span>
              )}
              {purchasedAt && (
                <span className="text-cream-800 text-2xs">
                  {purchasedAt} 購入
                </span>
              )}
            </div>
          )}

          {mutationErrors.map((message, index) => (
            <FormError key={index}>{message}</FormError>
          ))}
        </div>
      </div>

      <PartList applianceId={appliance.id} parts={parts} />
    </main>
  );
}
