import { pgTable, pgSchema, unique, check, integer, varchar, date, timestamp, index, foreignKey, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const soldat = pgSchema("soldat");
export const geschlechtInSoldat = soldat.enum("geschlecht", ['MAENNLICH', 'WEIBLICH'])
export const rangInSoldat = soldat.enum("rang", ['REKRUT', 'SOLDAT', 'CAPTAIN'])
export const schweregradInSoldat = soldat.enum("schweregrad", ['LEICHT', 'MITTEL', 'SCHWER'])
export const waffeInSoldat = soldat.enum("waffe", ['Klinge', 'Schrotflinte', 'ODM_GEAR'])


export const soldatInSoldat = soldat.table("soldat", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "soldat_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	version: integer().default(0).notNull(),
	vorname: varchar({ length: 80 }).notNull(),
	nachname: varchar({ length: 80 }).notNull(),
	geburtsdatum: date().notNull(),
	geschlecht: geschlechtInSoldat().notNull(),
	rang: rangInSoldat().notNull(),
	username: varchar({ length: 50 }).notNull(),
	erzeugt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	aktualisiert: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("soldat_username_key").on(table.username),
	check("soldat_version_check", sql`version >= 0`),
	check("soldat_vorname_check", sql`length(btrim((vorname)::text)) > 0`),
	check("soldat_nachname_check", sql`length(btrim((nachname)::text)) > 0`),
]);

export const ausruestungInSoldat = soldat.table("ausruestung", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "ausruestung_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	waffe: waffeInSoldat().notNull(),
	seriennummer: varchar({ length: 30 }).notNull(),
	soldatId: integer("soldat_id").notNull(),
}, (table) => [
	index("ix_ausruestung_soldat_id").using("btree", table.soldatId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.soldatId],
			foreignColumns: [soldatInSoldat.id],
			name: "ausruestung_soldat_id_fkey"
		}).onDelete("cascade"),
	unique("ausruestung_seriennummer_key").on(table.seriennummer),
	unique("ausruestung_soldat_id_key").on(table.soldatId),
	check("ausruestung_seriennummer_check", sql`(seriennummer)::text ~ '^AOT-[A-Za-z0-9]+$'::text`),
]);

export const verletzungInSoldat = soldat.table("verletzung", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "verletzung_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	verletzungsbezeichnung: varchar({ length: 200 }).notNull(),
	behandelt: boolean().notNull(),
	schweregrad: schweregradInSoldat().notNull(),
	verletzungsdatum: date().notNull(),
	soldatId: integer("soldat_id").notNull(),
}, (table) => [
	index("ix_verletzung_schweregrad").using("btree", table.schweregrad.asc().nullsLast().op("enum_ops")),
	index("ix_verletzung_soldat_id").using("btree", table.soldatId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.soldatId],
			foreignColumns: [soldatInSoldat.id],
			name: "verletzung_soldat_id_fkey"
		}).onDelete("cascade"),
	check("verletzung_verletzungsbezeichnung_check", sql`length(btrim((verletzungsbezeichnung)::text)) > 0`),
]);
