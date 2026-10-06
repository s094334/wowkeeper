import { httpServerHandler } from "cloudflare:node";
import express, {
  type Request as ExpressRequest,
  type Response as ExpressResponse,
  type NextFunction,
} from "express";

import usersRouter from "./users.js";
import appliancesRouter from "./appliances.js";
import recogniseRouter from "./recognise.js";
import notificationsRouter, { runDailyNotifications } from "./notifications.js";
import { statusFail } from "./lib/response.js";

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/appliances", appliancesRouter);
app.use("/api/recognise", recogniseRouter);
app.use("/api/notifications", notificationsRouter);
app.use(
  (
    error: Error,
    _request: ExpressRequest,
    response: ExpressResponse,
    _next: NextFunction,
  ) => {
    console.error("未預期的錯誤", error);
    return statusFail(response, "伺服器發生錯誤", 500);
  },
);

app.listen(PORT);

const expressHandler = httpServerHandler({ port: PORT });

export default {
  async fetch(request, env, ctx) {
    return await expressHandler.fetch!(request, env, ctx);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      runDailyNotifications(env).catch((error: unknown) => {
        console.error("[notify] 排程執行失敗", error);
      }),
    );
  },
} satisfies ExportedHandler<Env>;
