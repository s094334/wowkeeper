import { Link } from "react-router";
import Plus from "../../assets/icons/Plus.svg?react";

type EmptyStateProps = {
  to: string;
};

export function EmptyState(props: EmptyStateProps) {
  const { to } = props;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-10 text-center">
      <Link
        to={to}
        className="border-cream-500 text-cream-700 hover:bg-cream-100 hover:border-cream-800 hover:text-ink flex size-18 items-center justify-center rounded-lg border border-dashed"
      >
        <Plus width={26} height={26} />
      </Link>
      <div className="flex max-w-65 flex-col gap-2">
        <p className="text-h3 font-semibold tracking-[-0.02em]">先建第一台</p>
        <p className="text-ink-muted text-sm leading-relaxed text-pretty">
          登記名稱、型號與購買日期，之後濾網該換，我會提醒你。
        </p>
      </div>
    </div>
  );
}
