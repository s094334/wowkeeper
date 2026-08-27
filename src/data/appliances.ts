import type { ApplianceCategory } from "../types/appliance";
import type { SvgrComponent } from "../types/svgr";
import CloudDrizzle from "../assets/icons/CloudDrizzle.svg?react";
import Droplet from "../assets/icons/Droplet.svg?react";
import Package from "../assets/icons/Package.svg?react";
import RefreshCw from "../assets/icons/RefreshCw.svg?react";
import Thermometer from "../assets/icons/Thermometer.svg?react";
import Tool from "../assets/icons/Tool.svg?react";
import Tv from "../assets/icons/Tv.svg?react";
import Wind from "../assets/icons/Wind.svg?react";
import Zap from "../assets/icons/Zap.svg?react";

export const APPLIANCE_ICONS: Record<ApplianceCategory, SvgrComponent> = {
  aircon: Wind,
  waterPurifier: Droplet,
  washer: RefreshCw,
  fridge: Thermometer,
  dehumidifier: CloudDrizzle,
  waterHeater: Zap,
  tv: Tv,
  maintenance: Tool,
  other: Package,
};

export const APPLIANCE_CATEGORY_LABELS: Record<ApplianceCategory, string> = {
  aircon: "冷氣 / 空氣清淨機",
  waterPurifier: "淨水器 / 濾水壺",
  washer: "洗衣機",
  fridge: "冰箱",
  dehumidifier: "除濕機",
  waterHeater: "熱水器",
  tv: "電視 / 影音",
  maintenance: "保養類項目",
  other: "其他家電",
};
