import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type DB = ReturnType<typeof drizzle<typeof schema>>;

const g = globalThis as unknown as { __pgliteDb?: DB };

/**
 * Devuelve null si la BD aún no está configurada (el cliente conserva su cola).
 * Solo en pruebas locales: `PGLITE_DIR=<carpeta>` usa PGlite (Postgres embebido) en lugar de Neon,
 * para probar con SQL real sin tocar la base de producción. Nunca se activa en Vercel.
 */
export function getDb(): DB | null {
  if (process.env.PGLITE_DIR) {
    if (!g.__pgliteDb) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PGlite } = require("@electric-sql/pglite");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { drizzle: drizzlePglite } = require("drizzle-orm/pglite");
      g.__pgliteDb = drizzlePglite(new PGlite(process.env.PGLITE_DIR), { schema }) as DB;
    }
    return g.__pgliteDb!;
  }
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return drizzle(neon(url), { schema });
}
