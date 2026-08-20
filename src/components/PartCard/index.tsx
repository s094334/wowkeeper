import { Link } from "react-router";
import type { Part } from "../../types/appliance";
import Pencil from "../../assets/icons/Pencil.svg?react";

type PartCardProps = {
  applianceId: string;
  part: Part;
};

export function PartCard(props: PartCardProps) {
  const { applianceId, part } = props;
  const verb = part.action === "clean" ? "清洗" : "更換";

  return (
    <div className="border-cream-400 bg-surface flex flex-col gap-2.5 rounded-sm border px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span className="text-body min-w-0 flex-1 truncate font-medium">
          {part.name}
        </span>
        <Link
          to={`/appliances/${applianceId}/parts/${part.id}/edit`}
          className="text-cream-800 hover:bg-cream-100 hover:text-ink -mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full"
        >
          <Pencil width={16} height={16} />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <div className="text-ink-muted flex flex-col gap-0.5 text-xs">
          <span>
            每 {part.cycleMonths} 個月{verb}
          </span>
          <span>上次 {part.lastReplacedAt.replaceAll("-", "/")}</span>
        </div>
        <button
          type="button"
          className="border-ink hover:bg-cream-100 cursor-pointer rounded-xs border px-3 py-[7px] text-sm font-medium whitespace-nowrap"
        >
          登記已{verb}
        </button>
      </div>
    </div>
  );
}
