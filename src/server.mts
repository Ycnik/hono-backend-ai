import { serve } from "@hono/node-server";
import { readFileSync } from "node:fs";
import { createSecureServer } from "node:http2";
import { createServer as createHttpsServer } from "node:https";
import { db, sql } from "./repository/database.mts";
import { soldatInSoldat } from "./repository/generated/schema.mts";
import { app } from "./routes/app.mts";

const hostname = Bun.env.BIND_HOST ?? "127.0.0.1";
const port = Number(Bun.env.PORT ?? 3000);
const cert = readFileSync(new URL("../extras/tls/server.crt", import.meta.url));
const key = readFileSync(new URL("../extras/tls/server.key", import.meta.url));

try {
  await db.select({ id: soldatInSoldat.id }).from(soldatInSoldat).limit(0);
} catch (error) {
  await sql.end({ timeout: 0 });
  const cause = error instanceof Error ? (error.cause ?? error) : error;
  const reason = cause instanceof Error ? cause.message : "Verbindung fehlgeschlagen";
  console.error(
    `PostgreSQL ${Bun.env.PGHOST}:${Bun.env.PGPORT ?? 5432}/${Bun.env.PGDATABASE}: ${reason}`,
  );
  process.exit(1);
}

serve(
  {
    fetch: async (request) => {
      const response = await app.fetch(request);
      return new Response(response.body, { status: response.status, headers: response.headers });
    },
    hostname,
    port,
    createServer: createSecureServer,
    serverOptions: { cert, key },
  },
  (address) => {
    console.info(
      `PostgreSQL verbunden. Hono ist bereit: https://${hostname}:${address.port}/health (HTTP/2). Beenden mit Strg+C.`,
    );
  },
);

serve(
  {
    fetch: app.fetch,
    hostname,
    port: Number(Bun.env.HTTP1_PORT ?? 3001),
    createServer: createHttpsServer,
    serverOptions: { cert, key },
  },
  (address) => console.info(`HTTP/1.1: https://${hostname}:${address.port}`),
);
