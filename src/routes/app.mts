import { Hono } from "hono";

export const app = new Hono();
app.get("/health", (context) => context.json({ status: "ok" }));
import { soldaten } from "./soldaten.mts";
import { Problem, problemResponse } from "../service/problem.mts";
app.route("/soldaten", soldaten);
app.onError(problemResponse);
app.notFound((c) => problemResponse(new Problem(404, "Ressource nicht gefunden."), c));
