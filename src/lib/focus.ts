"use client";
/**
 * Modo Enfoque: lógica compartida.
 *  - En la APK usa el plugin nativo FocusLock (fijación de pantalla de Android).
 *  - En la web usa pantalla completa + Wake Lock (no se puede bloquear un navegador;
 *    las salidas se registran como interrupciones).
 */
import { registerPlugin, Capacitor } from "@capacitor/core";
import { db, type LocalFocus } from "./local-db";
import { saveFocus, awardBadge } from "./progress";

export const MIN_MINUTES = 5;
export const MAX_MINUTES = 180;
export const PRESETS = [15, 25, 45, 60, 90];

type LockState = { locked: boolean; mode: "pinned" | "kiosk" | "none" | "web" };
interface FocusLockPlugin {
  start(): Promise<LockState>;
  stop(): Promise<LockState>;
  status(): Promise<LockState>;
}

let wakeLock: { release(): Promise<void> } | null = null;

const WebFocusLock: FocusLockPlugin = {
  async start() {
    try { await document.documentElement.requestFullscreen?.({ navigationUI: "hide" }); } catch { /* el navegador puede negarlo */ }
    try { wakeLock = await (navigator as Navigator & { wakeLock?: { request(t: "screen"): Promise<{ release(): Promise<void> }> } }).wakeLock?.request("screen") ?? null; } catch { /* sin Wake Lock */ }
    return { locked: !!document.fullscreenElement, mode: "web" };
  },
  async stop() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* ignorado */ }
    try { await wakeLock?.release(); } catch { /* ignorado */ }
    wakeLock = null;
    return { locked: false, mode: "web" };
  },
  async status() { return { locked: !!document.fullscreenElement, mode: "web" }; },
};

export const isNative = () => Capacitor.isNativePlatform();
export const FocusLock: FocusLockPlugin = isNative() ? registerPlugin<FocusLockPlugin>("FocusLock") : WebFocusLock;

/**
 * Fase del bloqueo en esta carga de la página:
 *  - "none":    sin bloqueo (o se perdió al reiniciar la app).
 *  - "pending": se pidió fijar la app y Android espera que el alumno confirme "Fijar app".
 *  - "locked":  bloqueo confirmado. Solo a partir de aquí una pérdida del bloqueo cuenta como interrupción.
 */
export type LockPhase = "none" | "pending" | "locked";
let phase: LockPhase = "none";
const listeners = new Set<(p: LockPhase) => void>();
export const getPhase = () => phase;
export const setPhase = (p: LockPhase) => { phase = p; listeners.forEach((l) => l(p)); };
export const onPhase = (l: (p: LockPhase) => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const activeFocus = () => db.focus.where("status").equals("active").last();
export const endsAt = (f: LocalFocus) => f.startedAt + f.targetSec * 1000;

export async function getPreferredMinutes() {
  const v = (await db.meta.get("focusMinutes"))?.value;
  return typeof v === "number" ? v : 25;
}
export const setPreferredMinutes = (m: number) => db.meta.put({ key: "focusMinutes", value: m });

/** Inicia la sesión. Debe llamarse desde un toque del usuario (la web exige un gesto para pantalla completa). */
export async function startFocus(minutes: number) {
  const m = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, Math.round(minutes)));
  // Se marca ANTES de guardar la sesión para que el controlador no la confunda con una salida.
  setPhase(isNative() ? "pending" : "locked");
  let lock: LockState;
  try { lock = await FocusLock.start(); } catch (e) { setPhase("none"); throw new Error((e as Error).message || "No se pudo activar el bloqueo."); }
  const now = Date.now();
  const data: LocalFocus = {
    id: crypto.randomUUID(), startedAt: now, endedAt: null, targetSec: m * 60,
    status: "active", interruptions: 0, platform: isNative() ? "android" : "web", updatedAt: now,
  };
  await saveFocus(data);
  await setPreferredMinutes(m);
  // En la web la pantalla completa es inmediata; en Android falta que el alumno confirme.
  setPhase(lock.locked || !isNative() ? "locked" : "pending");
  return { session: data, lock };
}

export async function reengage() {
  setPhase(isNative() ? "pending" : "locked");
  const lock = await FocusLock.start();
  setPhase(lock.locked || !isNative() ? "locked" : "pending");
  return lock;
}

export async function addInterruption(f: LocalFocus) {
  const cur = await db.focus.get(f.id);
  if (!cur || cur.status !== "active") return;
  await saveFocus({ ...cur, interruptions: cur.interruptions + 1, updatedAt: Date.now() }, -2);
}

/** XP: 1 por minuto + 10 si no hubo interrupciones (mínimo 5). */
export const focusXp = (f: LocalFocus) => Math.max(5, Math.round(f.targetSec / 60) + (f.interruptions === 0 ? 10 : 0) - 2 * f.interruptions);

export async function completeFocus(f: LocalFocus) {
  const cur = await db.focus.get(f.id);
  if (!cur || cur.status !== "active") return null;
  const done: LocalFocus = { ...cur, status: "completed", endedAt: Date.now(), updatedAt: Date.now() };
  await saveFocus(done, focusXp(done) + 2 * cur.interruptions); // las penalizaciones ya se restaron al ocurrir
  if (done.targetSec >= 25 * 60) await awardBadge("enfocado");
  if (done.targetSec >= 90 * 60) await awardBadge("maraton-de-estudio");
  if (done.interruptions === 0 && done.targetSec >= 60 * 60) await awardBadge("hora-perfecta");
  setPhase("none");
  await FocusLock.stop().catch(() => {});
  return done;
}

/** `penalty = false` cuando el alumno cancela antes de que el bloqueo llegara a activarse. */
export async function abortFocus(f: LocalFocus, penalty = true) {
  const cur = await db.focus.get(f.id);
  if (!cur || cur.status !== "active") return;
  await saveFocus({ ...cur, status: "aborted", endedAt: Date.now(), updatedAt: Date.now() }, penalty ? -10 : 0);
  setPhase("none");
  await FocusLock.stop().catch(() => {});
}

export const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
};
