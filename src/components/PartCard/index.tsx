import { Link } from "react-router";
import type { LampStatus, Part } from "../../types/appliance";
import Pencil from "../../assets/icons/Pencil.svg?react";
import { GHOST_BUTTON } from "../../pages/ApplianceDetail/classes";
import { StatusLamp } from "../StatusLamp";

type PartCardProps = {
  applianceId: string;
  part: Part;
  status: LampStatus;
  statusText: string;
};

export function PartCard(props: PartCardProps) {
  const { applianceId, part, status, statusText } = props;
  const verb = part.action === "clean" ? "清洗" : "更換";

  return (
    <div className="border-cream-400 bg-surface flex flex-col gap-2.5 rounded-sm border px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
          {part.name}
        </span>
        <StatusLamp status={status} className="shrink-0">
          {statusText}
        </StatusLamp>
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <div className="text-ink-muted flex flex-col gap-0.5 text-xs">
          <span>
            每 {part.cycleMonths} 個月{verb}
          </span>
          <span>上次 {part.lastReplacedAt.replaceAll("-", "/")}</span>
        </div>

        <Link
          to={`/appliances/${applianceId}/parts/${part.id}/edit`}
          className={GHOST_BUTTON}
        >
          <Pencil width={14} height={14} />
          編輯耗材
        </Link>
      </div>
    </div>
  );
}
