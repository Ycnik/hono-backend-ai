import { Hono } from "hono";
import { idSchema, suche } from "../model/soldat.mts";
import { detail, liste } from "../repository/lesen.mts";
import { Problem } from "../service/problem.mts";
export const soldaten = new Hono();
soldaten.get("/", async (c) => c.json(await liste(suche.parse(c.req.query()))));
soldaten.get("/:id", async (c) => {
  const row = await detail(idSchema.parse(c.req.param("id")));
  if (!row) throw new Problem(404, "Soldat nicht gefunden.");
  const etag = `"${row.version}"`;
  c.header("ETag", etag);
  if (
    c.req
      .header("If-None-Match")
      ?.split(",")
      .some((tag) => ["*", etag].includes(tag.trim().replace(/^W\//, "")))
  )
    return c.body(null, 304);
  return c.json(row);
});
