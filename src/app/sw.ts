/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { flushOutbox } from "@/lib/sync";
import { SYNC_TAG } from "@/lib/sync-protocol";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [{ url: "/~offline", matcher: ({ request }) => request.destination === "document" }],
  },
});

/*
 * Background Sync: el navegador despierta al Service Worker cuando vuelve la red,
 * incluso si el alumno ya cerró la pestaña. Si el envío falla, lanzar un error
 * hace que el navegador lo reintente más tarde con espera exponencial.
 */
type SyncEvent = ExtendableEvent & { tag: string; lastChance?: boolean };
self.addEventListener("sync", ((event: SyncEvent) => {
  if (event.tag !== SYNC_TAG) return;
  event.waitUntil(
    flushOutbox().then((r) => {
      if (r.error && r.remaining > 0 && !event.lastChance) throw new Error(r.error);
    }),
  );
}) as EventListener);

serwist.addEventListeners();
