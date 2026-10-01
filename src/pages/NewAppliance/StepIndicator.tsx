import Check from "../../assets/icons/Check.svg?react";

type StepIndicatorProps = {
  current: number;
  labels: string[];
};

export function StepIndicator(props: StepIndicatorProps) {
  const { current, labels } = props;

  return (
    <div className="flex items-start">
      {labels.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;

        const dot = done
          ? "bg-terracotta-tint border-cream-500 text-terracotta"
          : active
            ? "bg-terracotta border-terracotta text-white"
            : "bg-cream-200 border-cream-500 text-cream-800";

        const line = (filled: boolean) =>
          filled
            ? "border-terracotta border-t"
            : "border-cream-500 border-t border-dashed";

        return (
          <div
            key={label}
            className="flex flex-1 flex-col items-center gap-[7px]"
          >
            <div className="flex w-full items-center gap-1.5">
              <span
                className={`h-0 flex-1 ${index === 0 ? "" : line(step <= current)}`}
              />
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${dot}`}
              >
                {done ? <Check width={15} height={15} /> : step}
              </span>
              <span
                className={`h-0 flex-1 ${index === labels.length - 1 ? "" : line(step < current)}`}
              />
            </div>
            <span
              className={`text-sm whitespace-nowrap ${
                active ? "text-ink font-semibold" : "text-cream-800"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
