# hono-backend-ai

## Lokaler Start

Bun 1.4.4 verwenden und im Projektverzeichnis `bun install --frozen-lockfile` ausführen.
Für HTTPS das lokale Entwicklungszertifikat und den zugehörigen privaten Schlüssel
unter `extras/tls/server.crt` und `extras/tls/server.key` bereitstellen.

`bun run start` startet Hono unter `https://127.0.0.1:3000`.
`bun run dev` startet denselben Server mit automatischem Neuladen.
Der HTTP/2-Test mit einem HTTP/2-fähigen curl und lokalem Testzertifikat lautet
`curl --http2 -kv https://127.0.0.1:3000/health`.

Die Compose-Projekte liegen in `postgres/` und `keycloak/`.
Für Keycloak liest Compose das Bootstrap-Passwort aus `keycloak/.env`
(Variable `KC_BOOTSTRAP_ADMIN_PASSWORD`), für PostgreSQL aus `postgres/password.txt`.
Die lokalen TLS-Dateien und Zugangsdaten sind von Git ausgeschlossen.
