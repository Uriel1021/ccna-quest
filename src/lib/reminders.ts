"use client";
/**
 * Recordatorios diarios (solo en la app de Android).
 *  - Dos al día: mañana y tarde/noche, a la hora que elija el alumno.
 *  - Opt-in: nunca se activan sin que el alumno lo decida.
 *  - Se programan en el propio teléfono (funcionan sin internet) y se reprograman al abrir la app
 *    para que el mensaje mencione la siguiente lección pendiente.
 *  - Canal propio: sonido "ccna_chime", visibles en la pantalla de bloqueo, sin ventana emergente.
 */
import { Capacitor } from "@capacitor/core";
import { db } from "./local-db";
import { syllabus } from "@/content/syllabus";
import { lessonSlug } from "@/content/lessons";

export type ReminderSettings = { enabled: boolean; morning: string; evening: string; decided: boolean };
export const DEFAULT_REMINDERS: ReminderSettings = { enabled: false, morning: "08:00", evening: "19:30", decided: false };

const CHANNEL = "recordatorios-v1";   // el sonido de un canal no se puede cambiar: si cambia el tono, nuevo id
const ID_MORNING = 101, ID_EVENING = 102, ID_TEST = 199;

export const remindersSupported = () => Capacitor.isNativePlatform();

export async function getReminderSettings(): Promise<ReminderSettings> {
  const v = (await db.meta.get("reminders"))?.value as Partial<ReminderSettings> | undefined;
  return { ...DEFAULT_REMINDERS, ...(v ?? {}) };
}
async function saveSettings(s: ReminderSettings) { await db.meta.put({ key: "reminders", value: s }); }

/* El plugin se devuelve dentro de un objeto: un proxy de Capacitor devuelto directamente desde
   una función async se trata como "thenable" y falla con "LocalNotifications.then() is not implemented". */
const plugin = async () => ({ LN: (await import("@capacitor/local-notifications")).LocalNotifications });

export async function permissionState(): Promise<"granted" | "denied" | "prompt"> {
  if (!remindersSupported()) return "denied";
  const { LN } = await plugin();
  const p = await LN.checkPermissions();
  return p.display === "granted" ? "granted" : p.display === "denied" ? "denied" : "prompt";
}

async function ensureChannel() {
  const { LN } = await plugin();
  await LN.createChannel({
    id: CHANNEL,
    name: "Recordatorios de estudio",
    description: "Dos avisos al día para seguir aprendiendo redes. Puedes cambiarlos o apagarlos en la app.",
    importance: 3,        // DEFAULT: suena y aparece en el panel, sin ventana emergente
    visibility: 1,        // PUBLIC: visible completa en la pantalla de bloqueo
    sound: "ccna_chime.wav",
    vibration: true,
    lights: true,
    lightColor: "#007AFF",
  });
}

/* ── Mensajes amigables ── */
const MORNING = [
  { t: "☀️ ¡Buenos días!", b: "5 minutos de redes con tu café. Hoy te toca: {next}." },
  { t: "🌱 Un pasito hoy", b: "Una lección corta y listo. Sigue con {next}." },
  { t: "📚 Tu mente está fresca", b: "Es buen momento para {next}. ¡Tú puedes!" },
  { t: "🚀 Arranca el día aprendiendo", b: "{next} te espera. Te tomará pocos minutos." },
];
const EVENING = [
  { t: "🌙 ¿Repasamos un poquito?", b: "Un minijuego rápido o {next} antes de descansar." },
  { t: "🎮 Hora de jugar y aprender", b: "Un reto corto para cerrar el día. Siguiente: {next}." },
  { t: "✨ Casi terminas el día", b: "Lo que repasas en la noche se recuerda mejor. Sigue con {next}." },
  { t: "🧠 Momento de repaso", b: "5 minutos bastan. Te toca {next}." },
];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

async function nextLesson() {
  const done = new Set((await db.lessons.toArray()).filter((l) => l.done).map((l) => l.lessonId));
  for (const m of syllabus) for (const [id, title] of m.lessons) if (!done.has(id)) return { id, title, url: `/aprender/modulo-${m.id}/${lessonSlug(id)}` };
  return null;
}
const hm = (s: string) => { const [h, m] = s.split(":").map(Number); return { hour: h, minute: m }; };

/** Programa (o reprograma) los dos recordatorios diarios. */
export async function scheduleReminders(s: ReminderSettings) {
  if (!remindersSupported()) return;
  const { LN } = await plugin();
  await LN.cancel({ notifications: [{ id: ID_MORNING }, { id: ID_EVENING }] }).catch(() => {});
  if (!s.enabled) return;
  await ensureChannel();
  const nl = await nextLesson();
  const next = nl ? `la lección ${nl.id} «${nl.title}»` : "un reto de módulo";
  const url = nl?.url ?? "/juegos";
  const mk = (id: number, tpl: { t: string; b: string }, time: string, tag: string) => ({
    id, channelId: CHANNEL,
    title: tpl.t, body: tpl.b.replace("{next}", next), largeBody: tpl.b.replace("{next}", next),
    summaryText: "CCNA Quest · recordatorio de estudio",
    schedule: { on: hm(time), allowWhileIdle: true },
    // Alarma "inexacta": no pide el permiso extra de "Alarmas y recordatorios" (sería invasivo);
    // Android la entrega a la hora elegida con unos minutos de margen para cuidar la batería.
    isExactNotification: false,
    smallIcon: "ic_stat_ccna", iconColor: "#007AFF", sound: "ccna_chime.wav",
    autoCancel: true, group: "recordatorios",
    extra: { url, tag },
  });
  await LN.schedule({ notifications: [mk(ID_MORNING, pick(MORNING), s.morning, "mañana"), mk(ID_EVENING, pick(EVENING), s.evening, "noche")] });
}

/** Activa (pide permiso si hace falta). Devuelve false si el alumno negó el permiso. */
export async function enableReminders(partial?: Partial<ReminderSettings>) {
  const { LN } = await plugin();
  let perm = await LN.checkPermissions();
  if (perm.display !== "granted") perm = await LN.requestPermissions();
  const s = { ...(await getReminderSettings()), ...partial, decided: true, enabled: perm.display === "granted" };
  await saveSettings(s);
  await scheduleReminders(s);
  return s.enabled;
}

export async function updateReminders(partial: Partial<ReminderSettings>) {
  const s = { ...(await getReminderSettings()), ...partial, decided: true };
  await saveSettings(s);
  await scheduleReminders(s);
  return s;
}

export async function declineReminders() { await saveSettings({ ...(await getReminderSettings()), decided: true, enabled: false }); }

/** Notificación de prueba en 3 segundos (para escuchar el tono y verla en la pantalla de bloqueo). */
export async function testReminder() {
  const { LN } = await plugin();
  await ensureChannel();
  const nl = await nextLesson();
  await LN.schedule({ notifications: [{
    id: ID_TEST, channelId: CHANNEL, title: "👋 ¡Así se verán tus recordatorios!",
    body: nl ? `Te avisaremos con algo como: «Sigue con la lección ${nl.id}».` : "Te avisaremos dos veces al día.",
    schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true },
    isExactNotification: false,
    smallIcon: "ic_stat_ccna", iconColor: "#007AFF", sound: "ccna_chime.wav", autoCancel: true,
    extra: { url: nl?.url ?? "/" },
  }] });
}

/** Al abrir la app: reprograma con la lección actual y abre la pantalla correcta al tocar un aviso. */
export async function initReminders(navigate: (url: string) => void) {
  if (!remindersSupported()) return () => {};
  const { LN } = await plugin();
  const h = await LN.addListener("localNotificationActionPerformed", (a) => {
    const url = (a.notification.extra as { url?: string } | undefined)?.url;
    if (url) navigate(url);
  });
  const s = await getReminderSettings();
  if (s.enabled && (await permissionState()) === "granted") await scheduleReminders(s);
  return () => void h.remove();
}
