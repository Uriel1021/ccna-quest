"use client";
import { useSyncExternalStore } from "react";
import { useLiveQuery } from "@/lib/use-live-query";
import { CloudOff, Check, RefreshCw, CloudUpload, AlertTriangle } from "lucide-react";
import { db } from "@/lib/local-db";
import { useSyncState, runSync } from "@/lib/sync-client";

/**
 * H1 Visibilidad del estado: el alumno siempre sabe si está en línea, cuántos cambios
 * faltan por subir y que su progreso NO se pierde sin conexión. Tocar = sincronizar ahora.
 */
function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
}

export function ConnectionStatus() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const pending = useLiveQuery(() => db.outbox.count(), [], 0);
  const { syncing, lastError } = useSyncState();

  let Icon = Check, text = "Guardado", tone = "text-muted", spin = false;
  let title = "Todo tu progreso está guardado en la nube.";
  if (!online) {
    Icon = CloudOff; tone = "text-warn"; text = pending ? `Sin conexión · ${pending}` : "Sin conexión";
    title = `Sin conexión. Tu progreso se guarda en este dispositivo${pending ? ` (${pending} cambios por subir)` : ""} y se enviará solo al volver la red.`;
  } else if (syncing) {
    Icon = RefreshCw; spin = true; text = "Sincronizando"; title = "Subiendo tu progreso…";
  } else if (pending && lastError) {
    Icon = AlertTriangle; tone = "text-warn"; text = `${pending} en espera`;
    title = `${pending} cambios guardados en el dispositivo; reintentaremos pronto. (${lastError}) Toca para reintentar ahora.`;
  } else if (pending) {
    Icon = CloudUpload; text = `${pending} por subir`; title = "Cambios guardados en el dispositivo, esperando para subir.";
  }

  return (
    <button
      type="button"
      onClick={() => online && void runSync()}
      title={title}
      aria-label={title}
      className={`pressable inline-flex h-8 items-center gap-1.5 rounded-full bg-fill px-3 text-[13px] font-medium ${tone}`}
    >
      <Icon size={14} aria-hidden className={spin ? "animate-spin" : undefined} />
      <span role="status" aria-live="polite">{text}</span>
    </button>
  );
}
