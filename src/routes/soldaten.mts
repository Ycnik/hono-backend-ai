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
import { soldat } from "../model/soldat.mts";
import { createSoldat } from "../repository/schreiben.mts";
import { jsonBody } from "./body.mts";
soldaten.post("/", async (c) => {
  const row = await createSoldat(soldat.parse(await jsonBody(c)));
  return c.json(row, 201, { Location: `/soldaten/${row.id}`, ETag: `"${row.version}"` });
});
import type { Context } from "hono";
import { aenderung } from "../model/soldat.mts";
import { updateSoldat } from "../repository/schreiben.mts";
async function update(c: Context, replace: boolean) {
  const id = idSchema.parse(c.req.param("id"));
  const match = c.req.header("If-Match");
  if (match === undefined) throw new Problem(428, "If-Match mit der aktuellen Version angeben.");
  if (!/^"(0|[1-9]\d*)"$/.test(match))
    throw new Problem(400, "Eine Version in Anführungszeichen angeben.");
  const version = Number(match.slice(1, -1));
  if (version > 2147483647) throw new Problem(412, "Version stimmt nicht überein.");
  const input = (replace ? soldat : aenderung).parse(await jsonBody(c));
  const row = await updateSoldat(id, version, input, replace);
  return c.body(null, 204, { ETag: `"${row.version}"` });
}
soldaten.put("/:id", (c) => update(c, true));
soldaten.patch("/:id", (c) => update(c, false));
