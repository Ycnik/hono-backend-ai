import { z } from "zod";
import {
  geschlechtInSoldat,
  rangInSoldat,
  schweregradInSoldat,
  waffeInSoldat,
} from "../repository/generated/schema.mts";
const text = (max: number) => z.string().trim().min(1).max(max);
const rang = z.enum(rangInSoldat.enumValues);
const geschlecht = z.enum(geschlechtInSoldat.enumValues);
export const ausruestung = z.strictObject({
  waffe: z.enum(waffeInSoldat.enumValues),
  seriennummer: text(30).regex(/^AOT-[A-Za-z0-9]+$/),
});
export const verletzung = z.strictObject({
  verletzungsbezeichnung: text(200),
  behandelt: z.boolean(),
  schweregrad: z.enum(schweregradInSoldat.enumValues),
  verletzungsdatum: z.iso.date(),
});
export const soldat = z.strictObject({
  vorname: text(80),
  nachname: text(80),
  geburtsdatum: z.iso.date(),
  geschlecht,
  rang,
  username: text(50),
  ausruestung: ausruestung.optional(),
  verletzungen: z.array(verletzung).optional(),
});
export type SoldatInput = z.infer<typeof soldat>;
export const idSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .pipe(z.coerce.number<string>().int().max(2147483647));
export const suche = z.strictObject({
  nachname: text(80).optional(),
  rang: rang.optional(),
  geschlecht: geschlecht.optional(),
  page: idSchema.default(1),
  size: idSchema.pipe(z.number().max(100)).default(20),
});
export type Suche = z.infer<typeof suche>;
