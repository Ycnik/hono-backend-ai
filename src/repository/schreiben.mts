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
