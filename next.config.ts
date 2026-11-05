import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { randomUUID } from "node:crypto";
import { GAME_SLUGS } from "./src/content/game-slugs";
import { syllabus } from "./src/content/syllabus";

/**
 * Dos modos de build:
 *  - Web (Vercel):   `npm run build`        → SSR + API + Service Worker (PWA).
 *  - Móvil (APK):    `npm run build:mobile` → exportación estática en `out/`, empaquetada
 *    dentro de la APK. Abre sin internet desde el primer arranque y sincroniza con la API
 *    de Vercel (NEXT_PUBLIC_API_BASE).
 * La API (`src/app/api`) solo existe en el build web: `scripts/build-mobile.mjs` la aparta
 * temporalmente durante la exportación estática.
 */
const MOBILE = process.env.BUILD_TARGET === "mobile";

// Revisión única por build: invalida las páginas precacheadas en cada despliegue.
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // En la APK los archivos ya están en el teléfono: no hace falta Service Worker.
  disable: process.env.NODE_ENV === "development" || MOBILE,
  cacheOnNavigation: true,
  reloadOnOnline: false, // nunca recargar a mitad de un examen
  // Todas las pantallas quedan disponibles offline desde la primera visita.
  additionalPrecacheEntries: [
    "/", "/aprender", "/juegos", "/examenes", "/enfoque", "/recordatorios", "/~offline",
    ...syllabus.flatMap((m) => [
      `/aprender/modulo-${m.id}`, `/aprender/modulo-${m.id}/reto`,
      ...m.lessons.map(([id]) => `/aprender/modulo-${m.id}/leccion-${id.replace(".", "-")}`),
    ]),
    ...GAME_SLUGS.map((g) => `/juegos/${g}`),
    "/examenes/itn-m1-3", "/examenes/itn-m4-7", "/examenes/itn-m8-10", "/examenes/itn-m11-13",
    "/examenes/itn-m14-15", "/examenes/itn-m16-17", "/examenes/itn-final", "/examenes/practica",
  ].map((url) => ({ url, revision })),
});

const nextConfig: NextConfig = MOBILE
  ? {
      output: "export",
      trailingSlash: true, // /aprender/ → aprender/index.html (lo que sirve Capacitor)
      images: { unoptimized: true },
      env: { NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE ?? "https://ccna-quest.vercel.app" },
    }
  : {
      async headers() {
        return [{ source: "/sw.js", headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ] }];
      },
    };

export default withSerwist(nextConfig);
