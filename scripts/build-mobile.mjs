/**
 * Build estático para la APK. La exportación estática no admite rutas de API,
 * así que `src/app/api` se aparta durante el build y SIEMPRE se restaura.
 */
import { execSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import { globSync } from "node:fs";

const API = "src/app/api", PARKED = ".api-parked";
for (const f of ["public/sw.js", ...globSync("public/swe-worker-*.js")]) rmSync(f, { force: true });

if (existsSync(PARKED)) throw new Error(`${PARKED} ya existe: restáuralo a ${API} antes de continuar.`);
renameSync(API, PARKED);
const restore = () => { if (existsSync(PARKED)) renameSync(PARKED, API); };
process.on("SIGINT", () => { restore(); process.exit(130); });
try {
  execSync("next build", { stdio: "inherit", env: { ...process.env, BUILD_TARGET: "mobile" } });
} finally {
  restore();
}
