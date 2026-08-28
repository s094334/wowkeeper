import { Link, useNavigate, useParams } from "react-router";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import Pencil from "../../assets/icons/Pencil.svg?react";
import Plus from "../../assets/icons/Plus.svg?react";
import { ApplianceNotFound } from "../../components/ApplianceNotFound";
import { FormError } from "../../components/common/FormError";
import { PartList } from "../../components/PartList";
import { useAppliance } from "../../hooks/useAppliances";
import {
  APPLIANCE_CATEGORY_LABELS,
  APPLIANCE_ICONS,
} from "../../data/appliances";
import { BOTTOM_BUTTON, GHOST_BUTTON, PAGE } from "./classes";

export function ApplianceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { appliance, isLoading, isNotFound, errorLog } = useAppliance(id);

  if (isLoading) {
    return (
      <main className={PAGE}>
        <p className="text-ink-muted px-8 pt-6 text-xs">載入中…</p>
      </main>
    );
  }

  if (isNotFound) {
    return <ApplianceNotFound />;
  }

  if (!appliance) {
    return (
      <main className={PAGE}>
        <div className="px-8 pt-6">
          <FormError>{errorLog[0] ?? "發生錯誤，請稍後再試"}</FormError>
        </div>
      </main>
    );
  }

  const { name, category, brand, model, purchasedAt, parts } = appliance;
  const Icon = APPLIANCE_ICONS[category];

  return (
    <main className={PAGE}>
      <header className="flex shrink-0 flex-col gap-3.5 px-8 pt-2">
        <div className="flex flex-col gap-2 border-cream-500 border-b-2 pb-5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="text-ink-muted flex min-w-0 items-center gap-2 text-xs">
              <Icon width={15} height={15} className="shrink-0" />
              <span className="truncate">
                {APPLIANCE_CATEGORY_LABELS[category]}
              </span>
            </div>

            <Link
              to={`/appliances/${appliance.id}/edit`}
              className={`${GHOST_BUTTON} h-[34px]`}
            >
              <Pencil width={14} height={14} />
              編輯家電
            </Link>
          </div>
          {brand && (
            <p className="text-ink-muted text-sm leading-[1.5] ml-1 font-bold">
              {brand}
            </p>
          )}{" "}
          <h1 className="text-h1 leading-[1.3] font-semibold tracking-[-0.02em] text-pretty">
            {name}
          </h1>
          {(model || purchasedAt) && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {model && (
                <span className="border-cream-400 bg-surface rounded-xs border px-2.5 py-[5px] text-sm font-medium tracking-[-0.01em] break-all">
                  {model}
                </span>
              )}
              {purchasedAt && (
                <span className="text-cream-800 text-xs whitespace-nowrap">
                  {purchasedAt.replaceAll("-", "/")} 購入
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <PartList applianceId={appliance.id} parts={parts} />

      <div className="border-cream-400 bg-cream-50 flex shrink-0 gap-2.5 border-t px-8 pt-3.5 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={BOTTOM_BUTTON}
        >
          <ArrowLeft width={16} height={16} />
          上一頁
        </button>

        <Link
          to={`/appliances/${appliance.id}/parts/new`}
          className={BOTTOM_BUTTON}
        >
          <Plus width={16} height={16} />
          新增耗材
        </Link>
      </div>
    </main>
  );
}
