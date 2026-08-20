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
    id: "apl_dc4defd8ac",
    name: "大金 變頻冷氣",
    category: "aircon",
    status: "overdue",
    statusText: "濾網逾期 6 天",
    brand: "DAIKIN",
    model: "RXM41SVLT",
    purchasedAt: "2023-05-12",
    parts: [
      {
        id: "prt_4b81c0a2e7",
        name: "室內機濾網",
        cycleMonths: 1,
        action: "clean",
        lastReplacedAt: "2026-07-17",
      },
      {
        id: "prt_9d20f5ac13",
        name: "室外機保養",
        cycleMonths: 12,
        action: "clean",
        lastReplacedAt: "2025-12-03",
      },
    ],
  },
  {
    id: "apl_e3e59f387b",
    name: "3M UVA3000 淨水器",
    category: "waterPurifier",
    status: "soon",
    statusText: "濾芯 3 天後",
    brand: "3M",
    model: "UVA3000",
    purchasedAt: "2024-01-08",
    parts: [
      {
        id: "prt_71ce3a8f60",
        name: "活性碳濾芯",
        cycleMonths: 6,
        action: "replace",
        lastReplacedAt: "2026-02-23",
      },
    ],
  },
  {
    id: "apl_f34a25fb4a",
    name: "Blueair 3210 清淨機",
    category: "aircon",
    status: "soon",
    statusText: "HEPA 12 天後",
    brand: "Blueair",
    model: "3210",
    purchasedAt: "2024-06-20",
    parts: [
      {
        id: "prt_2e5b17d904",
        name: "HEPA 濾網",
        cycleMonths: 6,
        action: "replace",
        lastReplacedAt: "2026-03-01",
      },
    ],
  },
  {
    id: "apl_4a0b092bd5",
    name: "LG 滾筒洗衣機",
    category: "washer",
    status: "ok",
    statusText: "",
    brand: "LG",
    model: "WD-S13VBW",
    purchasedAt: "2022-11-03",
  },
  {
    id: "apl_3fe8bf2d51",
    name: "Panasonic 冰箱",
    category: "fridge",
    status: "ok",
    statusText: "",
    brand: "Panasonic",
    model: "NR-C501XV",
    purchasedAt: "2021-09-15",
  },
  {
    id: "apl_d1df93b277",
    name: "三菱 除濕機",
    category: "dehumidifier",
    status: "ok",
    statusText: "",
    brand: "MITSUBISHI",
    model: "MJ-E105HT",
    purchasedAt: "2024-03-27",
  },
  {
    id: "apl_b8f9c8717a",
    name: "櫻花 熱水器",
    category: "waterHeater",
    status: "ok",
    statusText: "",
    brand: "櫻花 SAKURA",
    model: "DH1635",
    purchasedAt: "2020-07-01",
  },
  {
    id: "apl_fb0c2b3821",
    name: "日立 窗型冷氣",
    category: "aircon",
    status: "ok",
    statusText: "",
    brand: "HITACHI",
    model: "RA-25QV1",
    purchasedAt: "2019-06-18",
  },
  {
    id: "apl_ba4b02ec1d",
    name: "Sony 65 吋電視",
    category: "tv",
    status: "ok",
    statusText: "",
    brand: "SONY",
    model: "XRM-65X90L",
    purchasedAt: "2024-11-11",
  },
  {
    id: "apl_dffb9e9ce1",
    name: "BRITA 濾水壺",
    category: "waterPurifier",
    status: "ok",
    statusText: "",
    brand: "BRITA",
    model: "MAXTRA-PRO",
    purchasedAt: "2025-02-14",
  },
  {
    id: "apl_f922657daf",
    name: "Dyson 吸塵器",
    category: "other",
    status: "ok",
    statusText: "",
    brand: "Dyson",
    model: "V12 Detect Slim",
    purchasedAt: "2023-12-25",
  },
  {
    id: "apl_a35e475b46",
    name: "Panasonic 循環扇",
    category: "aircon",
    status: "ok",
    statusText: "",
    brand: "Panasonic",
    model: "F-GMK01",
    purchasedAt: "2025-04-30",
  },
];
