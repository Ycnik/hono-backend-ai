import { createRemoteJWKSet, jwtVerify } from "jose";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { Problem } from "../service/problem.mts";
const issuer = process.env.KEYCLOAK_ISSUER ?? "https://localhost:8843/realms/javascript";
const jwks = new URL(process.env.KEYCLOAK_JWKS_URL ?? `${issuer}/protocol/openid-connect/certs`);
if (
  jwks.protocol !== "https:" &&
  !(
    process.env.NODE_ENV !== "production" &&
    jwks.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(jwks.hostname)
  )
)
  throw new Error("JWKS benötigt HTTPS oder eine lokale Entwicklungsadresse.");
const keys = createRemoteJWKSet(jwks);
const claims = z.object({
  resource_access: z.object({ "javascript-client": z.object({ roles: z.array(z.string()) }) }),
});
export const adminOnly = createMiddleware(async (c, next) => {
  const token = /^Bearer ([^\s]+)$/i.exec(c.req.header("Authorization") ?? "")?.[1];
  if (!token) throw new Problem(401, "Bearer-Token erforderlich.");
  let payload;
  try {
    ({ payload } = await jwtVerify(token, keys, {
      issuer,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "sub", "azp"],
    }));
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        "code" in error &&
        ["ERR_JWKS_TIMEOUT", "ERR_JOSE_GENERIC"].includes(String(error.code)))
    )
      throw new Problem(503, "Keycloak-Schlüssel momentan nicht verfügbar.");
    throw new Problem(401, "Access Token ungültig oder abgelaufen.");
  }
  if (payload.azp !== "javascript-client" || payload.typ !== "Bearer")
    throw new Problem(401, "Kein Access Token für javascript-client.");
  const parsed = claims.safeParse(payload);
  if (!parsed.success || !parsed.data.resource_access["javascript-client"].roles.includes("admin"))
    throw new Problem(403, "Die Client-Rolle admin ist erforderlich.");
  await next();
});
