/**
 * Motor de sincronización (patrón "transactional outbox").
 *  1. Cada cambio se escribe en su tabla local + en `outbox` dentro de UNA transacción.
 *  2. `flushOutbox()` envía la cola en orden a /api/sync y borra lo confirmado.
 *  3. Disparadores: Background Sync del Service Worker (Chrome/Android), evento `online`,
 *     volver a la app, temporizador y Network de Capacitor (el WebView de la APK no
 *     soporta Background Sync, por eso hay respaldo).
 * Sin `window`: este archivo se importa también desde el Service Worker.
 */
import { db, getProfile } from "./local-db";
import { SYNC_ENDPOINT, type SyncOp, type SyncRequest, type SyncResponse } from "./sync-protocol";

const BATCH = 50;
export type FlushResult = { sent: number; remaining: number; error?: string };

let inFlight: Promise<FlushResult> | null = null;

/** Envía la cola. Llamadas concurrentes comparten la misma ejecución. */
export function flushOutbox(): Promise<FlushResult> {
  inFlight ??= doFlush().finally(() => { inFlight = null; });
  return inFlight;
}

async function doFlush(): Promise<FlushResult> {
  const { userId } = await getProfile();
  let sent = 0;

  // Web Locks evita que la pestaña y el Service Worker envíen el mismo lote a la vez.
  const run = async (): Promise<FlushResult> => {
    for (;;) {
      const batch = await db.outbox.orderBy("seq").limit(BATCH).toArray();
      if (batch.length === 0) return { sent, remaining: 0 };

      const body: SyncRequest = { userId, ops: batch.map((b) => ({ seq: b.seq!, op: b.op })) };
      let res: Response;
      try {
        res = await fetch(SYNC_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(15_000),
        });
      } catch (e) {
        return fail(batch.map((b) => b.seq!), `Sin conexión (${(e as Error).name})`, sent);
      }
      if (!res.ok) return fail(batch.map((b) => b.seq!), `Servidor respondió ${res.status}`, sent);

      const { applied, rejected } = (await res.json()) as SyncResponse;
      // Las rechazadas por validación no se reintentan nunca (evita bloquear la cola).
      await db.outbox.bulkDelete([...applied, ...rejected.map((r) => r.seq)]);
      await db.meta.put({ key: "lastSyncAt", value: Date.now() });
      sent += applied.length;
      if (applied.length + rejected.length === 0) return fail([], "Respuesta vacía del servidor", sent);
    }
  };

  const locks = (globalThis.navigator as Navigator | undefined)?.locks;
  return locks ? locks.request("ccna-outbox", run) : run();
}

async function fail(seqs: number[], error: string, sent: number): Promise<FlushResult> {
  await db.transaction("rw", db.outbox, db.meta, async () => {
    await db.outbox.where("seq").anyOf(seqs).modify((i) => { i.tries += 1; i.lastError = error; });
    await db.meta.put({ key: "lastSyncError", value: { error, at: Date.now() } });
  });
  return { sent, remaining: await db.outbox.count(), error };
}

/** Añade una operación a la cola (se usa DENTRO de una transacción que incluya `db.outbox`). */
export function enqueue(op: SyncOp) {
  return db.outbox.add({ op, createdAt: Date.now(), tries: 0 });
}
