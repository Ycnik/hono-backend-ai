import { relations } from "drizzle-orm/relations";
import { soldatInSoldat, ausruestungInSoldat, verletzungInSoldat } from "./schema";

export const ausruestungInSoldatRelations = relations(ausruestungInSoldat, ({one}) => ({
	soldatInSoldat: one(soldatInSoldat, {
		fields: [ausruestungInSoldat.soldatId],
		references: [soldatInSoldat.id]
	}),
}));

export const soldatInSoldatRelations = relations(soldatInSoldat, ({many}) => ({
	ausruestungInSoldats: many(ausruestungInSoldat),
	verletzungInSoldats: many(verletzungInSoldat),
}));

export const verletzungInSoldatRelations = relations(verletzungInSoldat, ({one}) => ({
	soldatInSoldat: one(soldatInSoldat, {
		fields: [verletzungInSoldat.soldatId],
		references: [soldatInSoldat.id]
	}),
}));