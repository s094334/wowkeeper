import ChevronDown from "../../assets/icons/ChevronDown.svg?react";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 text-center">
      <div className="my-auto flex max-w-65 flex-col gap-2">
        <p className="text-h3 font-semibold tracking-[-0.02em]">
          加入你第一台家電吧！
        </p>
        <p className="text-ink-muted text-sm leading-relaxed text-pretty">
          登記名稱、型號與購買日期，
          <br />
          當濾網到期，哇會告訴你。
        </p>
      </div>

      <div className="text-cream-800 flex flex-col items-center gap-1 text-xs">
        <span>從下面的「+ 新增家電」開始</span>
        <ChevronDown
          width={20}
          height={20}
          className="motion-safe:animate-bounce"
        />
      </div>
    </div>
  );
}
