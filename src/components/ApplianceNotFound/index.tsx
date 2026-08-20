import { Link } from "react-router";

export function ApplianceNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-8 text-center">
      <p className="text-h3 font-semibold tracking-[-0.02em]">找不到這台家電</p>
      <p className="text-ink-muted text-sm">它可能已經被刪除了。</p>
      <Link to="/" className="text-terracotta text-sm font-medium underline">
        回到我的家電
      </Link>
    </main>
  );
}
