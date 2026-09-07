import { Link } from "react-router";
import type { Appliance, LampStatus } from "../../types/appliance";
import { APPLIANCE_ICONS } from "../../constants/applianceCategories";
import { StatusLamp } from "../../components/StatusLamp";

const DOT_CLASS: Record<LampStatus, string> = {
  overdue: "wk-dot-overdue",
  soon: "wk-dot-soon",
  ok: "wk-dot-ok",
};

type ApplianceCardProps = {
  appliance: Appliance;
  status: LampStatus;
  statusText: string;
};

export function ApplianceCard(props: ApplianceCardProps) {
  const { status, statusText } = props;
  const { id, name, model, category } = props.appliance;
  const Icon = APPLIANCE_ICONS[category];

  return (
    <Link
      to={`/appliances/${id}`}
      className="border-cream-400 hover:border-cream-600 bg-surface flex flex-col gap-2.5 rounded-sm border p-3.5"
    >
      <div className="flex items-start justify-between">
        <div className="bg-cream-400 flex size-9 items-center justify-center rounded-sm">
          <Icon width={18} height={18} />
        </div>
        <span className={`wk-dot ${DOT_CLASS[status]}`} />
      </div>

      <div className="flex flex-col gap-[3px]">
        <span className="truncate text-sm leading-[1.35] font-medium tracking-[-0.01em]">
          {name}
        </span>
        {model && (
          <span className="text-cream-800 truncate text-2xs tracking-[-0.01em]">
            {model}
          </span>
        )}
      </div>

      <StatusLamp status={status} className="mt-auto self-start">
        {statusText}
      </StatusLamp>
    </Link>
  );
}
