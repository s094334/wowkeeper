// DB（D1Database）已經在 worker-configuration.d.ts 裡了（`npm run cf-typegen` 產生的）。
// JWT_SECRET 是 secret/var，不會被 wrangler types 自動產生，所以在這裡手動補上。
// 本機請放進 .dev.vars，正式環境用 `wrangler secret put JWT_SECRET`。
interface Env {
  JWT_SECRET: string;
}
