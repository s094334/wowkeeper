import { Link } from "react-router";
import Plus from "../../assets/icons/Plus.svg?react";

const NEW_APPLIANCE_PATH = "/appliances/new";

// display 交給呼叫端指定：標題右側那顆是 hidden + md:inline-flex，
// 底部那條是 flex，放進共用樣式會互相蓋掉。
const BASE =
  "bg-surface text-ink border-cream-400 hover:bg-terracotta hover:border-terracotta " +
  "items-center gap-2 rounded-sm border font-medium hover:text-white";

type NewApplianceButtonProps = {
  className: string;
};

export function NewApplianceButton(props: NewApplianceButtonProps) {
  return (
    <Link to={NEW_APPLIANCE_PATH} className={`${BASE} ${props.className}`}>
      <Plus width={18} height={18} />
      新增家電
    </Link>
  );
}
