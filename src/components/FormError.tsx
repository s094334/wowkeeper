import type { ReactNode } from "react";
import AlertCircle from "../assets/icons/AlertCircle.svg?react";

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className="border-lamp-red-fg bg-lamp-red-bg text-lamp-red-fg flex items-center gap-1.5 rounded-sm border px-3 py-2 text-xs">
      <AlertCircle width={13} height={13} className="shrink-0" />
      {children}
    </p>
  );
}
