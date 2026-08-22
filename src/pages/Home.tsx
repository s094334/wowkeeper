import { useState } from "react";
import { Link } from "react-router";
import type { LampStatus } from "../types/appliance";
import { ApplianceCard } from "../components/ApplianceCard";
import { APPLIANCES } from "../data/appliances";
import Plus from "../assets/icons/Plus.svg?react";

const NEW_APPLIANCE_PATH = "/appliances/new";

const FILTERS = [
  { key: "all", label: "全部" },
  { key: "overdue", label: "逾期" },
  { key: "soon", label: "快到期" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const TAB_BASE =
  "-mb-0.5 cursor-pointer rounded-t-sm border-2 px-4 pt-2 pb-[9px] text-sm";
const TAB_ON =
  "bg-cream-200 border-cream-500 border-b-cream-200 text-ink font-semibold";
const TAB_OFF = "border-transparent text-ink-muted font-medium hover:text-ink";

const BADGE =
  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-2xs font-semibold";

const BADGE_ON: Record<string, string> = {
  all: "bg-cream-300 text-ink",
  overdue: "bg-lamp-red-bg text-lamp-red-fg",
  soon: "bg-lamp-amber-bg text-lamp-amber-fg",
};

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-10 text-center">
      <Link
        to={NEW_APPLIANCE_PATH}
        className="border-cream-500 text-cream-700 hover:bg-cream-100 hover:border-cream-800 hover:text-ink flex size-18 items-center justify-center rounded-lg border border-dashed"
      >
        <Plus width={26} height={26} />
      </Link>
      <div className="flex max-w-65 flex-col gap-2">
        <p className="text-h3 font-semibold tracking-[-0.02em]">先建第一台</p>
        <p className="text-ink-muted text-sm leading-relaxed text-pretty">
          登記名稱、型號與購買日期，之後濾網該換，我會提醒你。
        </p>
      </div>
    </div>
  );
}

export function Home() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const appliances = APPLIANCES;
  const counts = {
    all: appliances.length,
    overdue: appliances.filter((item) => item.status === "overdue").length,
    soon: appliances.filter((item) => item.status === "soon").length,
  };

  const visible =
    filter === "all"
      ? appliances
      : appliances.filter((item) => item.status === (filter as LampStatus));

  return (
    <main className="flex min-h-0 flex-1 flex-col sm:mx-auto sm:w-full sm:max-w-150">
      <div className="flex flex-col gap-3.5 px-5 pt-6 sm:px-8">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-h1">
          我的家電
        </h1>

        <div className="border-cream-500 flex gap-1 border-b-2">
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`${TAB_BASE} flex items-center gap-1.5 ${
                filter === tab.key ? TAB_ON : TAB_OFF
              }`}
            >
              {tab.label}
              <span
                className={`${BADGE} ${
                  filter === tab.key
                    ? BADGE_ON[tab.key]
                    : "bg-cream-300 text-ink-muted"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-4 sm:px-8">
        {appliances.length === 0 ? (
          <EmptyState />
        ) : visible.length === 0 ? (
          <p className="text-ink-muted pt-2 text-xs">這個狀態目前沒有家電。</p>
        ) : (
          <div className="grid grid-cols-2 content-start gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((appliance) => (
              <ApplianceCard key={appliance.id} appliance={appliance} />
            ))}
          </div>
        )}
      </div>

      <div className="border-cream-400 bg-cream-200 sticky bottom-0 shrink-0 border-t px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
        <Link
          to={NEW_APPLIANCE_PATH}
          className="bg-surface text-ink border-cream-400 hover:bg-terracotta hover:border-terracotta flex h-12 items-center justify-center gap-2 rounded-sm border text-body font-medium hover:text-white"
        >
          <Plus width={18} height={18} />
          新增家電
        </Link>
      </div>
    </main>
  );
}
