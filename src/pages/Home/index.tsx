import { useState } from "react";
import { Link } from "react-router";
import type { LampStatus } from "../../types/appliance";
import { ApplianceCard } from "../../components/ApplianceCard";
import { EmptyState } from "../../components/EmptyState";
import { APPLIANCES } from "../../data/appliances";
import Plus from "../../assets/icons/Plus.svg?react";
import { FilterTabs, type FilterKey } from "./FilterTabs";

const NEW_APPLIANCE_PATH = "/appliances/new";

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

        <FilterTabs value={filter} counts={counts} onChange={setFilter} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-4 sm:px-8">
        {appliances.length === 0 ? (
          <EmptyState to={NEW_APPLIANCE_PATH} />
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
