import { serve } from "@hono/node-server";
import { readFileSync } from "node:fs";
import { createSecureServer } from "node:http2";
import { app } from "./routes/app.mts";

serve({
  fetch: app.fetch,
  hostname: Bun.env.BIND_HOST ?? "127.0.0.1",
  port: Number(Bun.env.PORT ?? 3000),
  createServer: createSecureServer,
  serverOptions: {
    cert: readFileSync(new URL("../extras/tls/server.crt", import.meta.url)),
    key: readFileSync(new URL("../extras/tls/server.key", import.meta.url)),
  },
});
