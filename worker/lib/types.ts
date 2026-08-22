export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  nickname: string;
  created_at: number;
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
  created_at: number;
  updated_at: number;
};
