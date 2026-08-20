import { Link, useNavigate, useParams } from "react-router";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import Pencil from "../../assets/icons/Pencil.svg?react";
import Trash from "../../assets/icons/Trash.svg?react";
import {
  APPLIANCE_CATEGORY_LABELS,
  APPLIANCE_ICONS,
  APPLIANCES,
} from "../../data/appliances";

export function ApplianceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const appliance = APPLIANCES.find((item) => item.id === id);

  if (!appliance) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-8 text-center">
        <p className="text-h3 font-semibold tracking-[-0.02em]">
          找不到這台家電
        </p>
        <p className="text-ink-muted text-sm">它可能已經被刪除了。</p>
        <Link to="/" className="text-terracotta text-sm font-medium underline">
          回到我的家電
        </Link>
      </main>
    );
  }

  const { name, category, brand, model, purchasedAt } = appliance;
  const Icon = APPLIANCE_ICONS[category];

  return (
    <main className="flex flex-1 flex-col sm:mx-auto sm:w-full sm:max-w-150">
      <header className="border-cream-400 flex flex-col gap-4 border-b px-5 pt-2 pb-4.5 sm:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-ink hover:bg-cream-100 -ml-2 flex size-9 cursor-pointer items-center justify-center rounded-full"
          >
            <ArrowLeft width={20} height={20} />
          </button>
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              className="text-ink hover:bg-cream-100 flex size-9 cursor-pointer items-center justify-center rounded-full"
            >
              <Pencil width={18} height={18} />
            </button>
            <button
              type="button"
              className="text-danger hover:bg-lamp-red-bg -mr-2 flex size-9 cursor-pointer items-center justify-center rounded-full"
            >
              <Trash width={18} height={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-ink-muted flex items-center gap-2 text-xs">
            <Icon width={15} height={15} className="shrink-0" />
            <span className="truncate">
              {APPLIANCE_CATEGORY_LABELS[category]}
              {brand && ` · ${brand}`}
            </span>
          </div>

          <h1 className="text-[26px] leading-[1.25] font-semibold tracking-[-0.02em]">
            {name}
          </h1>

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
        </div>
      </header>
    </main>
  );
}
