import { parse } from "csv-parse/sync";
import { sql } from "../src/repository/database.mts";

const tables = {
  soldat: [
    "id",
    "version",
    "vorname",
    "nachname",
    "geburtsdatum",
    "geschlecht",
    "rang",
    "username",
    "erzeugt",
    "aktualisiert",
  ],
  ausruestung: ["id", "waffe", "seriennummer", "soldat_id"],
  verletzung: [
    "id",
    "verletzungsbezeichnung",
    "behandelt",
    "schweregrad",
    "verletzungsdatum",
    "soldat_id",
  ],
};

try {
  await sql.begin(async (tx) => {
    await tx`lock table soldat.soldat, soldat.ausruestung, soldat.verletzung in share row exclusive mode`;
    for (const [table, columns] of Object.entries(tables)) {
      const file = Bun.file(new URL(`../postgres/init/soldat/csv/${table}.csv`, import.meta.url));
      const rows: Record<string, string>[] = parse(await file.text(), {
        delimiter: ";",
        bom: true,
        skip_empty_lines: true,
        columns(header: string[]) {
          if (header.join(";") !== columns.join(";"))
            throw new Error(`Unerwartete Kopfzeile in ${table}.csv`);
          return columns;
        },
      });
      if (rows.length)
        await tx`insert into soldat.${tx(table)} ${tx(rows, ...columns)} on conflict (id) do nothing`;
    }
    for (const table of Object.keys(tables)) {
      const [result] =
        await tx`select count(*) as anzahl, setval(pg_get_serial_sequence(${`soldat.${table}`}, 'id'), coalesce(max(id), 1), max(id) is not null) as sequenz from soldat.${tx(table)}`;
      console.info(table, result);
    }
  });
} finally {
  await sql.end();
}
