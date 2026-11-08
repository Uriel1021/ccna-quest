"use client";
/**
 * Lado navegador del motor de sincronización: decide CÓMO disparar el envío
 * y expone el estado (sincronizando / último error) a la interfaz.
 */
import { create } from "zustand";
import { flushOutbox } from "./sync";
import { pullAndMerge } from "./account";
import { SYNC_TAG } from "./sync-protocol";

type SyncState = { syncing: boolean; lastError?: string; lastSyncAt?: number };
export const useSyncState = create<SyncState>(() => ({ syncing: false }));

type SyncRegistration = ServiceWorkerRegistration & { sync?: { register(tag: string): Promise<void> } };

/** Pide sincronizar. Usa Background Sync si existe; si no (Safari, WebView de la APK), envía directo. */
export async function requestSync() {
  if (typeof window === "undefined") return;
  try {
    const reg = (await navigator.serviceWorker?.getRegistration()) as SyncRegistration | undefined;
    if (reg?.active && reg.sync) {
      await reg.sync.register(SYNC_TAG);
      if (!navigator.onLine) return; // el navegador lo enviará solo al volver la red
    }
  } catch { /* sin permisos de Background Sync: seguimos con el respaldo */ }
  if (navigator.onLine) await runSync();
}

export async function runSync() {
  useSyncState.setState({ syncing: true });
  try {
    const r = await flushOutbox();
    // Con cuenta: trae lo hecho en otros dispositivos (como mucho cada 2 min) y sube lo que resulte de combinar.
    if (!r.error && (await pullAndMerge().catch(() => false))) await flushOutbox();
    useSyncState.setState({ syncing: false, lastError: r.error, lastSyncAt: r.error ? useSyncState.getState().lastSyncAt : Date.now() });
  } catch (e) {
    useSyncState.setState({ syncing: false, lastError: (e as Error).message });
  }
}

/** Arranca todos los disparadores de respaldo. Devuelve una función de limpieza. */
export function startSyncTriggers(): () => void {
  const onOnline = () => void runSync();
  const onVisible = () => { if (document.visibilityState === "visible" && navigator.onLine) void runSync(); };
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisible);
  const timer = window.setInterval(() => { if (navigator.onLine) void runSync(); }, 60_000);

  // Pide al navegador que NO borre IndexedDB aunque falte espacio.
  void navigator.storage?.persist?.();

  // En la APK (Capacitor) el evento `online` del WebView no siempre es fiable.
  let removeNative: (() => void) | undefined;
  void import("@capacitor/core").then(async ({ Capacitor }) => {
    if (!Capacitor.isNativePlatform()) return;
    const { Network } = await import("@capacitor/network");
    const h = await Network.addListener("networkStatusChange", (s) => { if (s.connected) void runSync(); });
    removeNative = () => void h.remove();
  }).catch(() => {});

  if (navigator.onLine) void runSync();
  return () => {
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisible);
    window.clearInterval(timer);
    removeNative?.();
  };
}
