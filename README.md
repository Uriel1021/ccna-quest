# CCNA Quest

Plataforma para aprender redes (CCNA 1 · ITN) jugando. Funciona sin conexión y se instala como app web (PWA) o como APK de Android.

- **Web:** https://ccna-quest.vercel.app
- **Stack:** Next.js 15 · React 19 · Tailwind v4 · Dexie (IndexedDB) · Serwist (Service Worker + Background Sync) · Drizzle + Neon Postgres · Capacitor 8 (Android)

## Arquitectura offline

```
UI ──▶ IndexedDB (fuente de verdad local) ──▶ outbox ──▶ POST /api/sync ──▶ Neon Postgres
                                                ▲
            Background Sync (SW) · online · visibilitychange · cada 60 s · Network (Capacitor)
```

Cada registro usa un UUID generado en el dispositivo → reenviar es idempotente.
Conflictos entre dispositivos: gana el `updatedAt` más reciente.

## Desarrollo

```bash
npm install
npx vercel link && npx vercel env pull .env.local   # credenciales de Neon
npm run dev                                          # http://localhost:3000 (sin Service Worker)
npm run build && npm start                           # producción local (con Service Worker)
```

Base de datos (`src/db/schema.ts`):

```bash
npm run db:generate -- --name <cambio>   # crea migración en drizzle/
npm run db:migrate                       # la aplica en Neon
```

## Android (APK)

La APK empaqueta una exportación estática de la app (`npm run build:mobile` → `out/`) y
sincroniza con `https://ccna-quest.vercel.app/api/sync`. Abre sin internet desde el primer arranque.

Requisitos: JDK 21 y Android SDK 36 (`brew install openjdk@21 && brew install --cask android-commandlinetools`).

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
npm run apk          # genera ./ccna-quest.apk
```

`android/app/src/main/java/.../MainActivity.java` sirve el `index.html` de cada ruta de la
exportación estática (Capacitor por defecto siempre entrega el de la raíz).

## Despliegue

```bash
npx vercel deploy --prod
```
