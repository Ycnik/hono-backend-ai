# hono-backend-ai

## Lokaler Start

Bun 1.4.4 verwenden und im Projektverzeichnis `bun install --frozen-lockfile` ausführen.
Für HTTPS das lokale Entwicklungszertifikat und den zugehörigen privaten Schlüssel
unter `extras/tls/server.crt` und `extras/tls/server.key` bereitstellen.

`bun start` prüft zuerst den Lesezugriff auf `soldat.soldat` in der konfigurierten Datenbank.
Bei Erfolg zeigt der Server die URL `https://127.0.0.1:3000/health` an und wartet im Terminal auf Anfragen.
Mit Strg+C beenden. Ein Datenbankfehler beendet den Start mit Exitcode 1.
`bun run dev` startet denselben Server mit automatischem Neuladen.
Der HTTP/2-Test mit einem HTTP/2-fähigen curl und lokalem Testzertifikat lautet
`curl --http2 -kv https://127.0.0.1:3000/health`.

Die Compose-Projekte liegen in `postgres/` und `keycloak/`.
Für Keycloak liest Compose das Bootstrap-Passwort aus `keycloak/.env`
(Variable `KC_BOOTSTRAP_ADMIN_PASSWORD`), für PostgreSQL aus `postgres/password.txt`.
Die lokalen TLS-Dateien und Zugangsdaten sind von Git ausgeschlossen.

## Datenbank

Die Verbindung liest die Variablen aus `.env.example`. Die lokalen Werte in `.env` setzen.
`PGSSLMODE=require` verschlüsselt die lokale Entwicklungsverbindung.
Für Zertifikatsprüfung `verify-full` verwenden und bei einer eigenen CA `PGSSLROOTCERT` setzen.

`bun run db:pull` liest ausschließlich das Schema `soldat`. Die von Drizzle Kit erzeugten
Schema- und Relationsdateien liegen unter `src/repository/generated/`. Die Datei
`schema.ts` dort löst den von Drizzle generierten Importpfad auf.

`bun run db:seed` importiert die drei CSV-Dateien in einer Transaktion. Bereits vorhandene
IDs bleiben erhalten. Die nächste automatisch vergebene ID folgt auf die höchste ID der jeweiligen Tabelle.

## Bruno

Öffne den Ordner `bruno` als Collection und wähle oben rechts das Environment
`Lokal`. Trage dort für die geheime Variable `clientSecret` den Wert von
`CLIENT_SECRET` aus der lokalen Projektdatei `.env` ein und speichere ihn.
Das lokale Testpasswort `p` ist im Environment bereits gesetzt. Aktiviere für
die lokalen selbstsignierten Zertifikate in Bruno die Option, die
TLS-Zertifikatsprüfung abzuschalten.

Starte PostgreSQL, Keycloak und das Backend. Führe zuerst `Token-admin` und
`Token-user` aus. Anschließend die übrigen Requests in der angegebenen Reihenfolge
ausführen. `Anlegen` erzeugt eine neue Testressource und setzt deren ID und ETag.

Bruno verwendet den zusätzlichen HTTPS-Port 3001 für HTTP/1.1. Der HTTP/2-Port
3000 bleibt für HTTP/2-Clients verfügbar. Nach Änderungen am Server `bun start`
neu starten und im Bruno-Environment `Lokal` für `baseUrl`
`https://127.0.0.1:3001` setzen.
