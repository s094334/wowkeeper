import type { Response as ExpressResponse } from "express";

export function ok<T extends Record<string, unknown>>(
  body: T,
  status = 200,
): Response {
  return Response.json({ status: true, ...body }, { status });
}

export function fail(message: string, status = 400): Response {
  return Response.json({ status: false, message }, { status });
}

// express
export function statusOk<T extends Record<string, unknown>>(
  res: ExpressResponse,
  body: T,
  status = 200,
): ExpressResponse {
  return res.status(status).json({ status: true, ...body });
}

export function statusFail(
  res: ExpressResponse,
  message: string,
  status = 400,
): ExpressResponse {
  return res.status(status).json({ status: false, message });
}
