import type { Context } from "hono";
import { ZodError } from "zod";
export class Problem extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 412 | 422 | 428 | 500 | 503,
    message: string,
  ) {
    super(message);
  }
}
const titles = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  412: "Precondition Failed",
  422: "Unprocessable Content",
  428: "Precondition Required",
  500: "Internal Server Error",
  503: "Service Unavailable",
};
export function problemResponse(error: Error, c: Context) {
  const problem =
    error instanceof Problem
      ? error
      : error instanceof ZodError
        ? new Problem(
            422,
            error.issues.map((i) => `${i.path.join(".") || "Eingabe"}: ${i.message}`).join("; "),
          )
        : new Problem(500, "Interner Serverfehler.");
  if (problem.status === 500) console.error(error.name, "bei", c.req.method, c.req.path);
  if (problem.status === 401) c.header("WWW-Authenticate", 'Bearer realm="javascript"');
  return c.json(
    {
      type: "about:blank",
      title: titles[problem.status],
      status: problem.status,
      detail: problem.message,
      instance: c.req.path,
    },
    problem.status,
    { "Content-Type": "application/problem+json" },
  );
}
