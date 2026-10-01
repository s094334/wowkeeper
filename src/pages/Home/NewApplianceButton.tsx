import { Link } from "react-router";
import Plus from "../../assets/icons/Plus.svg?react";

const BASE =
  "bg-surface text-ink border-cream-400 hover:bg-terracotta hover:border-terracotta " +
  "items-center gap-2 rounded-sm border font-medium hover:text-white";

type NewApplianceButtonProps = {
  className: string;
};

export function NewApplianceButton(props: NewApplianceButtonProps) {
  return (
    <Link to="/appliances/new" className={`${BASE} ${props.className}`}>
      <Plus width={18} height={18} />
      新增家電
    </Link>
  );
}
