import { ApplianceCard } from "./ApplianceCard";
import { EmptyState } from "./EmptyState";
import { FormError } from "../../components/FormError";
import type { ApplianceWithStatus } from "../../lib/applianceStatus";

type ApplianceListProps = {
  items: ApplianceWithStatus[];
  totalCount: number;
  isLoading: boolean;
  errorLog: string[];
};

export function ApplianceList(props: ApplianceListProps) {
  const { items, totalCount, isLoading, errorLog } = props;
  if (isLoading) {
    return <p className="text-ink-muted pt-2 text-xs">載入中…</p>;
  }

  if (errorLog.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        {errorLog.map((message, index) => (
          <FormError key={index}>{message}</FormError>
        ))}
      </div>
    );
  }

  if (totalCount === 0) return <EmptyState />;

  if (items.length === 0) {
    return (
      <p className="text-ink-muted pt-2 text-xs">這個狀態目前沒有家電。</p>
    );
  }

  return (
    <div className="grid grid-cols-2 content-start gap-2.5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ApplianceCard
          key={item.appliance.id}
          appliance={item.appliance}
          status={item.status}
          statusText={item.statusText}
        />
      ))}
    </div>
  );
}
