-- 逾期通知信所需的兩個欄位。

-- 這項耗材上次寄出逾期通知的日期（YYYY-MM-DD，台北時區）。
-- NULL 代表從未通知過。排程寄信時用它做去重，避免同一項每天重複寄信。
ALTER TABLE parts ADD COLUMN last_notified_at TEXT;

-- 使用者是否接收逾期通知信。1 = 接收（預設）、0 = 已關閉。
-- 退訂連結與設定頁都會改寫這個欄位。
ALTER TABLE users ADD COLUMN notifications_enabled INTEGER NOT NULL DEFAULT 1;
