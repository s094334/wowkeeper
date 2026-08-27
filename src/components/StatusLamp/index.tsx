import type { ReactNode } from "react";
import type { LampStatus } from "../../types/appliance";
import { LAMP_CLASS } from "./classes";

type StatusLampProps = {
  status: LampStatus;
  children: ReactNode;
  className?: string;
};

export function StatusLamp(props: StatusLampProps) {
  const { status, children, className = "" } = props;

  return (
    <span className={`wk-lamp ${LAMP_CLASS[status]} ${className}`}>
      <span className="wk-lamp-dot" />
      {children}
    </span>
  );
}
