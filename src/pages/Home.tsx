import { Link } from "react-router";
import type { Appliance, LampStatus } from "../types/appliance";
import { ApplianceCard } from "../components/ApplianceCard";
import { StatusLamp } from "../components/StatusLamp";
import { APPLIANCES } from "../data/appliances";
import Plus from "../assets/icons/Plus.svg?react";

const NEW_APPLIANCE_PATH = "/appliances/new";

function summarise(appliances: Appliance[]) {
  const overdue = appliances.filter((a) => a.status === "overdue").length;
  const pending = appliances.filter((a) => a.status !== "ok").length;

  let status: LampStatus = "ok";
  if (overdue > 0) {
    status = "overdue";
  } else if (pending > 0) {
    status = "soon";
  }

  const text = pending > 0 ? `${pending} 件待換` : "全部正常";

  return { status, text };
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-10 text-center">
      <button
        type="button"
        className="border-cream-500 text-cream-700 hover:bg-cream-100 hover:border-cream-800 hover:text-ink flex size-18 cursor-pointer items-center justify-center rounded-lg border border-dashed"
      >
        <Plus width={26} height={26} />
      </button>
      <div className="flex max-w-65 flex-col gap-2">
        <p className="text-h3 font-semibold tracking-[-0.02em]">先建第一台</p>
        <p className="text-ink-muted text-sm leading-relaxed text-pretty">
          建立您的第一個家電，開始追蹤濾網
        </p>
      </div>
      <Link
        to={NEW_APPLIANCE_PATH}
        className="wk-cta flex w-full max-w-70 items-center justify-center"
      >
        新增家電
      </Link>
    </div>
  );
}

const PAGE = "flex flex-1 flex-col px-5 py-8 sm:px-8";
const SHOW_EMPTY_STATE = false;

export function Home() {
  const appliances: Appliance[] = SHOW_EMPTY_STATE ? [] : APPLIANCES;
  const summary = summarise(appliances);

  if (appliances.length === 0) {
    return (
      <main className={PAGE}>
        <h1 className="text-h1 font-semibold tracking-[-0.02em]">我的家電</h1>
        <EmptyState />
      </main>
    );
  }

  return (
    <main className={`${PAGE} gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className=" font-semibold tracking-[-0.02em] text-h1">
            我的家電
          </h1>
          <StatusLamp
            status={summary.status}
            className="px-2.5 py-[5px] text-xs"
          >
            {summary.text}
          </StatusLamp>
        </div>

        <Link
          to={NEW_APPLIANCE_PATH}
          className="border-cream-400 hover:bg-cream-100 flex size-10 shrink-0 items-center justify-center rounded-full border sm:size-auto sm:gap-1.5 sm:rounded-xs sm:px-3 sm:py-2"
        >
          <Plus width={18} height={18} />
          <span className="hidden text-xs font-medium whitespace-nowrap sm:inline">
            新增家電
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {appliances.map((appliance) => (
          <ApplianceCard key={appliance.id} appliance={appliance} />
        ))}
      </div>
    </main>
  );
}
