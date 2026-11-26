import { readFileSync } from "node:fs";

function databaseCredentials() {
  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGSSLROOTCERT } = process.env;
  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    throw new Error("PGHOST, PGDATABASE, PGUSER und PGPASSWORD in .env setzen.");
  }
  const port = Number(PGPORT ?? 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Ungültiger PGPORT.");
  if (PGSSLMODE !== "require" && PGSSLMODE !== "verify-full")
    throw new Error("PGSSLMODE muss require oder verify-full sein.");
  if (PGSSLMODE === "require" && process.env.NODE_ENV === "production")
    throw new Error("In Produktion PGSSLMODE=verify-full verwenden.");
  const ssl =
    PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : {
          rejectUnauthorized: true,
          ...(PGSSLROOTCERT && { ca: readFileSync(PGSSLROOTCERT, "utf8") }),
        };
  return { host: PGHOST, port, database: PGDATABASE, user: PGUSER, password: PGPASSWORD, ssl };
}
export { databaseCredentials };
