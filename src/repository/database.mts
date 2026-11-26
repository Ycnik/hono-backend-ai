import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { databaseCredentials } from "../config/database.mts";

export const sql = postgres({ ...databaseCredentials(), connect_timeout: 5 });
export const db = drizzle(sql);
