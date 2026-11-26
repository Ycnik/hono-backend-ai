import { copyFile, mkdir, rm } from "node:fs/promises";

// Drizzle Kit kann bei einem Verbindungsfehler ohne Fehlercode enden.
for (const name of ["schema", "relations"]) {
  await rm(`.drizzle-pull/${name}.ts`, { force: true });
}
const result = Bun.spawnSync([process.execPath, "node_modules/drizzle-kit/bin.cjs", "pull"], {
  stdout: "inherit",
  stderr: "inherit",
});
if (result.exitCode !== 0) process.exit(result.exitCode);
await mkdir("src/repository/generated", { recursive: true });
for (const name of ["schema", "relations"]) {
  await copyFile(`.drizzle-pull/${name}.ts`, `src/repository/generated/${name}.mts`);
}
