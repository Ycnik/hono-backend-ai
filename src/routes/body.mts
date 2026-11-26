import type { Context } from "hono";
import { Problem } from "../service/problem.mts";
export async function jsonBody(c: Context): Promise<unknown> {
  try {
    return await c.req.json<unknown>();
  } catch {
    throw new Problem(400, "Ungültiger JSON-Body.");
  }
}
