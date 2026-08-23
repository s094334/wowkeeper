export function ok<T extends Record<string, unknown>>(
  body: T,
  status = 200,
): Response {
  return Response.json({ status: true, ...body }, { status });
}

export function fail(message: string, status = 400): Response {
  return Response.json({ status: false, message }, { status });
}
