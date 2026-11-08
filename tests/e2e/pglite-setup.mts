/**
 * Crea una BD PGlite local con las migraciones del repo, para levantar el servidor sin tocar Neon:
 *   npx tsx tests/e2e/pglite-setup.mts .pglite-e2e
 *   PGLITE_DIR=.pglite-e2e DATABASE_URL= npx next start -p 3100
 */
import { rmSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const dir = process.argv[2] ?? ".pglite-e2e";
rmSync(dir, { recursive: true, force: true });
const client = new PGlite(dir);
await migrate(drizzle(client), { migrationsFolder: "drizzle" });
await client.close();
console.log(`BD de prueba lista en ${dir}`);
