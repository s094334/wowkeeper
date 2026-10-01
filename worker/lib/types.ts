export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  nickname: string;
  created_at: number;
  notifications_enabled: number;
};

export type ApplianceRow = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  purchased_at: string | null;
  created_at: number;
  updated_at: number;
};

export type PartRow = {
  id: string;
  appliance_id: string;
  name: string;
  cycle_months: number;
  action: "replace" | "clean";
  last_replaced_at: string;
  /** 本週期已寄出逾期通知的日期，YYYY-MM-DD；NULL 代表尚未通知。 */
  last_notified_at: string | null;
  created_at: number;
  updated_at: number;
};
