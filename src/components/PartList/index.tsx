import type { Part } from "../../types/appliance";
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
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-8 py-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-ink-muted text-[13px] font-medium">耗材更換</h2>
        {parts.length > 0 && (
          <span className="text-cream-800 text-[13px]">{parts.length} 項</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="border-cream-500 text-ink-muted rounded-sm border border-dashed p-3 text-center text-sm">
          還沒有登記耗材，從下面的「新增耗材」開始。
        </p>
      ) : (
        items.map((item) => (
          <PartCard
            key={item.part.id}
            applianceId={applianceId}
            part={item.part}
            status={item.status}
            statusText={item.statusText}
          />
        ))
      )}
    </section>
  );
}
