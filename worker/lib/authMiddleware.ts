import { env } from "cloudflare:workers";
import { authenticate } from "./auth.js";
import { statusFail } from "./response.js";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";

export const authMiddleware = async (
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) => {
  const auth = await authenticate(request.headers.authorization, env);
  if (!auth) {
    return statusFail(response, "驗證失敗", 401);
  }

  response.locals.uid = auth.uid;
  next();
};
