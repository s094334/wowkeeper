import type { Appliance, ApplianceCategory } from "../types/appliance";
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

export const APPLIANCES: Appliance[] = [
  {
    id: "1",
    name: "大金 變頻冷氣",
    category: "aircon",
    status: "overdue",
    statusText: "濾網逾期 6 天",
  },
  {
    id: "2",
    name: "3M UVA3000 淨水器",
    category: "waterPurifier",
    status: "soon",
    statusText: "濾芯 3 天後",
  },
  {
    id: "3",
    name: "Blueair 3210 清淨機",
    category: "aircon",
    status: "soon",
    statusText: "HEPA 12 天後",
  },
  {
    id: "4",
    name: "LG 滾筒洗衣機",
    category: "washer",
    status: "ok",
    statusText: "",
  },
  {
    id: "5",
    name: "Panasonic 冰箱",
    category: "fridge",
    status: "ok",
    statusText: "",
  },
  {
    id: "6",
    name: "三菱 除濕機",
    category: "dehumidifier",
    status: "ok",
    statusText: "",
  },
  {
    id: "7",
    name: "櫻花 熱水器",
    category: "waterHeater",
    status: "ok",
    statusText: "",
  },
  {
    id: "8",
    name: "日立 窗型冷氣",
    category: "aircon",
    status: "ok",
    statusText: "",
  },
  {
    id: "9",
    name: "Sony 65 吋電視",
    category: "tv",
    status: "ok",
    statusText: "",
  },
  {
    id: "10",
    name: "BRITA 濾水壺",
    category: "waterPurifier",
    status: "ok",
    statusText: "",
  },
  {
    id: "11",
    name: "Dyson 吸塵器",
    category: "other",
    status: "ok",
    statusText: "",
  },
  {
    id: "12",
    name: "Panasonic 循環扇",
    category: "aircon",
    status: "ok",
    statusText: "",
  },
];
