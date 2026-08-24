import { useState } from "react";
import type { LampStatus } from "../../types/appliance";
import { ApplianceCard } from "../../components/ApplianceCard";
import { EmptyState } from "../../components/EmptyState";
import { NewApplianceButton } from "../../components/NewApplianceButton";
import { withStatus } from "../../lib/applianceStatus";
import { APPLIANCES } from "../../data/appliances";
import { FilterTabs, type FilterKey } from "./FilterTabs";

export function Home() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const appliances = withStatus(APPLIANCES);
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
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3.5 pt-6 px-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-h1 font-semibold tracking-[-0.02em] sm:text-h1">
            我的家電
          </h1>

          <NewApplianceButton className="hidden h-10 shrink-0 px-4 text-sm md:inline-flex" />
        </div>

        <FilterTabs value={filter} counts={counts} onChange={setFilter} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-4 pb-4 px-8">
        {appliances.length === 0 ? (
          <EmptyState />
        ) : visible.length === 0 ? (
          <p className="text-ink-muted pt-2 text-xs">這個狀態目前沒有家電。</p>
        ) : (
          <div className="grid grid-cols-2 content-start gap-2.5 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((item) => (
              <ApplianceCard
                key={item.appliance.id}
                appliance={item.appliance}
                status={item.status}
                statusText={item.statusText}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-cream-400 bg-cream-200 sticky bottom-0 shrink-0 border-t px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 md:hidden">
        <NewApplianceButton className="text-body flex h-12 justify-center" />
      </div>
    </main>
  );
}
