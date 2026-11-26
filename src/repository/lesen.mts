import { and, asc, count, eq, ilike } from "drizzle-orm";
import type { Suche } from "../model/soldat.mts";
import { db } from "./database.mts";
import { soldatInSoldat as s } from "./generated/schema.mts";
export async function detail(id: number) {
  const row = await db.query.soldatInSoldat.findFirst({
    where: eq(s.id, id),
    with: {
      ausruestungInSoldats: true,
      verletzungInSoldats: { orderBy: (v, { asc }) => [asc(v.id)] },
    },
  });
  if (!row) return undefined;
  const { ausruestungInSoldats, verletzungInSoldats, ...soldat } = row;
  return {
    ...soldat,
    ausruestung: ausruestungInSoldats[0] ?? null,
    verletzungen: verletzungInSoldats,
  };
}
export async function liste({ nachname, rang, geschlecht, page, size }: Suche) {
  const where = and(
    nachname ? ilike(s.nachname, `%${nachname.replace(/[\\%_]/g, "\\$&")}%`) : undefined,
    rang ? eq(s.rang, rang) : undefined,
    geschlecht ? eq(s.geschlecht, geschlecht) : undefined,
  );
  return db.transaction(
    async (tx) => {
      const [row] = await tx.select({ total: count() }).from(s).where(where);
      const total = row!.total;
      const content = await tx
        .select()
        .from(s)
        .where(where)
        .orderBy(asc(s.id))
        .limit(size)
        .offset((page - 1) * size);
      return { content, page, size, total, pages: Math.ceil(total / size) };
    },
    { isolationLevel: "repeatable read", accessMode: "read only" },
  );
}
