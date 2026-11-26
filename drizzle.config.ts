import { defineConfig } from "drizzle-kit";
import { databaseCredentials } from "./src/config/database.mts";

export default defineConfig({
  dialect: "postgresql",
  schemaFilter: ["soldat"],
  out: ".drizzle-pull",
  dbCredentials: databaseCredentials(),
});
