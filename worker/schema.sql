CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS appliances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  purchased_at TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appliances_user_id ON appliances (user_id);

CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  appliance_id TEXT NOT NULL REFERENCES appliances (id),
  name TEXT NOT NULL,
  cycle_months INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('replace', 'clean')),
  last_replaced_at TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parts_appliance_id ON parts (appliance_id);

-- 登出黑名單：sign_out 時把當下 token 的 jti 存進來，authenticate() 會擋掉已撤銷的 token。
CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
