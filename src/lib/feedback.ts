"use client";
/**
 * Respuesta háptica: nativa en la APK (Capacitor Haptics), `navigator.vibrate` en la web.
 * Nunca falla: si el dispositivo no vibra, simplemente no pasa nada.
 */
export type HapticKind = "tap" | "success" | "error";

export async function haptic(kind: HapticKind) {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
      if (kind === "tap") return void (await Haptics.impact({ style: ImpactStyle.Light }));
      return void (await Haptics.notification({ type: kind === "success" ? NotificationType.Success : NotificationType.Error }));
    }
  } catch { /* sin plugin: usamos la API web */ }
  try { navigator.vibrate?.(kind === "error" ? [30, 50, 30] : kind === "success" ? 25 : 8); } catch { /* ignorado */ }
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
export const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
