import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { databaseCredentials } from "../config/database.mts";

export const sql = postgres({ ...databaseCredentials(), connect_timeout: 5 });
import * as schema from "./generated/schema.mts";
import * as relations from "./generated/relations.mts";
export const db = drizzle(sql, { schema: { ...schema, ...relations } });
