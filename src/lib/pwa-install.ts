"use client";
/**
 * Instalar la web como app (PWA).
 *  - Chrome/Edge/Samsung Internet (Android y escritorio): evento `beforeinstallprompt` → botón "Instalar".
 *    Se captura al cargar este módulo (lo importa AppShell, presente en todas las páginas), antes de que
 *    React hidrate. No se pinta ningún <script>: un nodo extra en el árbol rompía la hidratación.
 *  - iPhone/iPad (Safari): no hay evento; se explica "Compartir → Agregar a pantalla de inicio".
 *  - Ya instalada (display-mode standalone) o dentro de la APK: no se ofrece.
 */
import { useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";

type BeforeInstallPromptEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
declare global { interface Window { __ccnaBip?: BeforeInstallPromptEvent | null; __ccnaInstalled?: boolean } }

if (typeof window !== "undefined" && !("__ccnaBip" in window)) {
  window.__ccnaBip = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // sin la mini barra automática de Chrome: ofrecemos nuestro botón
    window.__ccnaBip = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event("ccna-install"));
  });
  window.addEventListener("appinstalled", () => {
    window.__ccnaBip = null;
    window.__ccnaInstalled = true;
    window.dispatchEvent(new Event("ccna-install"));
  });
}

export type InstallState = "unknown" | "native" | "installed" | "prompt" | "ios" | "manual";

function compute(): InstallState {
  if (Capacitor.isNativePlatform()) return "native";
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  if (standalone || window.__ccnaInstalled) return "installed";
  if (window.__ccnaBip) return "prompt";
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "manual";
}

function subscribe(cb: () => void) {
  const mq = window.matchMedia?.("(display-mode: standalone)");
  window.addEventListener("ccna-install", cb);
  mq?.addEventListener?.("change", cb);
  return () => { window.removeEventListener("ccna-install", cb); mq?.removeEventListener?.("change", cb); };
}

/** "unknown" durante la hidratación (el HTML del servidor no sabe nada del navegador). */
export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, compute, () => "unknown");
}

/** Muestra el diálogo nativo del navegador. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const e = window.__ccnaBip;
  if (!e) return "unavailable";
  await e.prompt();
  const { outcome } = await e.userChoice;
  window.__ccnaBip = null; // el evento solo se puede usar una vez
  window.dispatchEvent(new Event("ccna-install"));
  return outcome;
}

const DISMISS_KEY = "ccna-install-dismissed";
export function installDismissed(): boolean {
  try { return Number(localStorage.getItem(DISMISS_KEY) ?? 0) > Date.now(); } catch { return false; }
}
/** "Ahora no": vuelve a ofrecerse en 14 días. */
export function dismissInstall() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now() + 14 * 86_400_000)); } catch { /* sin almacenamiento */ }
}
