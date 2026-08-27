import { Link } from "react-router";
import type { Part } from "../../types/appliance";
import Plus from "../../assets/icons/Plus.svg?react";
import { withPartStatus } from "../../lib/applianceStatus";
import { PartCard } from "../PartCard";

type PartListProps = {
  applianceId: string;
  parts: Part[];
};

export function PartList(props: PartListProps) {
  const { applianceId, parts } = props;
  // 整批共用同一個「今天」，同一頁的耗材才不會因為跨過午夜而各自算出不同的基準日。
  const items = withPartStatus(parts);

  return (
    <section className="flex flex-1 flex-col gap-3 px-5 py-4 sm:px-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-ink-muted text-sm font-medium">耗材更換</h2>
        {parts.length > 0 && (
          <span className="text-cream-800 text-sm">{parts.length} 項</span>
        )}
      </div>

      {items.map((item) => (
        <PartCard
          key={item.part.id}
          applianceId={applianceId}
          part={item.part}
          status={item.status}
          statusText={item.statusText}
        />
      ))}

      <Link
        to={`/appliances/${applianceId}/parts/new`}
        className="border-cream-500 text-ink-muted hover:bg-cream-100 hover:border-cream-800 hover:text-ink flex items-center justify-center gap-2 rounded-sm border border-dashed p-3 text-sm font-medium"
      >
        <Plus width={16} height={16} />
        新增耗材
      </Link>
    </section>
  );
}
