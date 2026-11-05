import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

// Carga .env.local igual que Next.js (drizzle-kit no lo hace solo).
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migraciones por conexión directa (sin pooler).
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
});
