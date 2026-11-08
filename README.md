# CCNA Quest

Plataforma para aprender redes (CCNA 1 · ITN) jugando. Funciona sin conexión y se instala como app web (PWA) o como APK de Android.

- **Web / instalar como app (PWA):** https://ccna-quest.vercel.app — en el navegador, "Instalar app" (Android, Windows, Mac) o "Compartir → Agregar a pantalla de inicio" (iPhone). Guía: `/instalar`.
- **APK de Android:** https://github.com/Uriel1021/ccna-quest/releases/latest/download/ccna-quest.apk (actualizaciones automáticas con [Obtainium](https://github.com/ImranR98/Obtainium) apuntando a este repositorio).
- **Stack:** Next.js 15 · React 19 · Tailwind v4 · Dexie (IndexedDB) · Serwist (Service Worker + Background Sync) · Drizzle + Neon Postgres · Capacitor 8 (Android)

## Arquitectura offline

```
UI ──▶ IndexedDB (fuente de verdad local) ──▶ outbox ──▶ POST /api/sync ──▶ Neon Postgres
                                                ▲
            Background Sync (SW) · online · visibilitychange · cada 60 s · Network (Capacitor)
```

Cada registro usa un UUID generado en el dispositivo → reenviar es idempotente.
Conflictos entre dispositivos: gana el `updatedAt` más reciente.

## Cuentas

**La app exige cuenta** (web y APK): al entrar por primera vez se muestra la bienvenida para crear cuenta o
iniciar sesión (`AuthGate`). Solo `/instalar` está abierta. La primera vez hace falta internet; después funciona
sin conexión. Con sesión vencida se puede seguir estudiando y el indicador pide "Vuelve a entrar".

- **Crear cuenta** "reclama" el identificador anónimo del dispositivo: lo ya estudiado queda en la cuenta.
- **Iniciar sesión** en otro dispositivo sube lo local y descarga lo de la nube (`GET /api/sync`); se combina sin duplicar.
- **Recuperar cuenta** con el código de recuperación (16 caracteres) que se muestra al crearla; da uno nuevo y cierra las demás sesiones.
- Contraseñas y códigos con `scrypt`; sesiones con token Bearer (en la BD solo su SHA-256); bloqueo de 15 min tras 5 intentos fallidos.
- Una cuenta con contraseña solo acepta sincronización con un token de su sesión.

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
npm run apk          # genera ./ccna-quest.apk firmada (release)
npm run apk:debug    # ./ccna-quest-debug.apk (para depurar el WebView)
```

**Firma:** la clave vive FUERA del repo, en `~/.ccna-quest/release.keystore` y `~/.ccna-quest/keystore.properties`
(o la ruta en `CCNA_KEYSTORE_PROPERTIES`). **Respáldala**: sin ella no se pueden publicar actualizaciones que
se instalen encima de la versión actual.

`android/app/src/main/java/.../MainActivity.java` sirve el `index.html` de cada ruta de la
exportación estática (Capacitor por defecto siempre entrega el de la raíz).

## Pruebas

```bash
npm test                 # contenido + API (BD simulada y Postgres en memoria con PGlite)
# e2e: servidor con BD local, nunca la de producción
npx tsx tests/e2e/pglite-setup.mts .pglite-e2e && npm run build
PGLITE_DIR=.pglite-e2e DATABASE_URL= npx next start -p 3100 &
npm run test:e2e                                   # 157 rutas (móvil y escritorio) + flujos
TSX_TSCONFIG_PATH=tests/tsconfig.json npx tsx tests/e2e/account.mts   # cuentas y PWA
# Android: APK debug contra la API LOCAL (permite HTTP solo a localhost, solo en debug)
NEXT_PUBLIC_API_BASE=http://localhost:3100 npm run apk:debug && npm run build   # (rehace .next para el servidor)
adb reverse tcp:3100 tcp:3100 && adb install -r ccna-quest-debug.apk
npm run test:android
```

## Licencia

Código bajo [MIT](LICENSE). Contenido educativo (`src/content/`) bajo [CC BY-SA 4.0](LICENSE-CONTENT.md).

## Despliegue

```bash
npm run db:migrate       # primero: aplica migraciones nuevas en Neon
git push                 # Vercel publica con cada push a main
```
