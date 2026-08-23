const FILTERS = [
  { key: "all", label: "全部" },
  { key: "overdue", label: "逾期" },
  { key: "soon", label: "快到期" },
] as const;

export type FilterKey = (typeof FILTERS)[number]["key"];

const TAB_BASE =
  "-mb-0.5 cursor-pointer rounded-t-sm border-2 px-4 pt-2 pb-[9px] text-sm";
const TAB_ON =
  "bg-cream-200 border-cream-500 border-b-cream-200 text-ink font-semibold";
const TAB_OFF = "border-transparent text-ink-muted font-medium hover:text-ink";

const BADGE =
  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-2xs font-semibold";

const BADGE_ON: Record<FilterKey, string> = {
  all: "bg-cream-300 text-ink",
  overdue: "bg-lamp-red-bg text-lamp-red-fg",
  soon: "bg-lamp-amber-bg text-lamp-amber-fg",
};

type FilterTabsProps = {
  value: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (key: FilterKey) => void;
};

export function FilterTabs(props: FilterTabsProps) {
  const { value, counts, onChange } = props;

  return (
    <div className="border-cream-500 flex gap-1 border-b-2">
      {FILTERS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`${TAB_BASE} flex items-center gap-1.5 ${
            value === tab.key ? TAB_ON : TAB_OFF
          }`}
        >
          {tab.label}
          <span
            className={`${BADGE} ${
              value === tab.key
                ? BADGE_ON[tab.key]
                : "bg-cream-300 text-ink-muted"
            }`}
          >
            {counts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  );
}
