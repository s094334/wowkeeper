import type { Part } from "../../types/appliance";

export function PartCard({ part }: { part: Part }) {
  const verb = part.action === "clean" ? "清洗" : "更換";

  return (
    <div className="border-cream-400 bg-surface flex flex-col gap-2.5 rounded-sm border px-4 py-3.5">
      <span className="text-body truncate font-medium">{part.name}</span>

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
