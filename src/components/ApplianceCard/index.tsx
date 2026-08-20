import { Link } from "react-router";
import type { Appliance } from "../../types/appliance";
import { APPLIANCE_ICONS } from "../../data/appliances";
import { StatusLamp } from "../StatusLamp";
import { DOT_CLASS } from "./classes";

type ApplianceCardProps = {
  appliance: Appliance;
};

export function ApplianceCard(props: ApplianceCardProps) {
  const { id, name, category, status, statusText } = props.appliance;
  const Icon = APPLIANCE_ICONS[category];

  return (
    <Link
      to={`/appliances/${id}`}
      className="border-cream-400 hover:border-cream-600 bg-surface flex flex-col gap-2.5 rounded-sm border p-3.5"
    >
      <div className="flex items-start justify-between">
        <div className="bg-cream-100 flex size-9 items-center justify-center rounded-sm">
          <Icon width={18} height={18} />
        </div>
        <span className={`wk-dot ${DOT_CLASS[status]}`} />
      </div>

      <div className="text-sm leading-[1.35] font-medium tracking-[-0.01em]">
        {name}
      </div>

      <StatusLamp
        status={status}
        className={status === "ok" ? "invisible self-start" : "self-start"}
      >
        {statusText}
      </StatusLamp>
    </Link>
  );
}
