import { db } from "./database.mts";
import {
  soldatInSoldat as s,
  ausruestungInSoldat as a,
  verletzungInSoldat as v,
} from "./generated/schema.mts";
import type { SoldatInput } from "../model/soldat.mts";
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
async function insertChildren(
  tx: Transaction,
  soldatId: number,
  { ausruestung, verletzungen }: Partial<SoldatInput>,
) {
  if (ausruestung) await tx.insert(a).values({ ...ausruestung, soldatId });
  if (verletzungen?.length)
    await tx.insert(v).values(verletzungen.map((row) => ({ ...row, soldatId })));
}
export function createSoldat({ ausruestung, verletzungen, ...fields }: SoldatInput) {
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(s).values(fields).returning({ id: s.id, version: s.version });
    await insertChildren(tx, row!.id, { ausruestung, verletzungen });
    return row!;
  });
}
import { and, eq, sql } from "drizzle-orm";
import { Problem } from "../service/problem.mts";
export function updateSoldat(
  id: number,
  version: number,
  input: Partial<SoldatInput>,
  replace: boolean,
) {
  const { ausruestung, verletzungen, ...fields } = input;
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(s)
      .set({ ...fields, version: sql`${s.version} + 1`, aktualisiert: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(s.id, id), eq(s.version, version)))
      .returning({ version: s.version });
    if (!updated) throw new Problem(412, "Die Ressource entspricht nicht der angegebenen Version.");
    if (replace || ausruestung !== undefined) await tx.delete(a).where(eq(a.soldatId, id));
    if (replace || verletzungen !== undefined) await tx.delete(v).where(eq(v.soldatId, id));
    await insertChildren(tx, id, input);
    return updated;
  });
}
