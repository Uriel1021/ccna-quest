"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Bell, BellOff, Moon, Sun, Volume2, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { Button, Group, LargeTitle, Row } from "@/components/ui/apple";
import { AppIcon } from "@/components/brand/AppIcon";
import { haptic } from "@/lib/feedback";
import { enableReminders, getReminderSettings, permissionState, remindersSupported, testReminder, updateReminders, DEFAULT_REMINDERS, type ReminderSettings } from "@/lib/reminders";

export function playChime() {
  try { const a = new Audio("/sounds/ccna_chime.wav"); a.volume = 0.8; void a.play(); } catch { /* sin audio */ }
}

/** Vista previa de cómo se verá el aviso en la pantalla de bloqueo. */
function LockPreview({ time, title, body }: { time: string; title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-b from-[#1d3b6e] via-[#3a4a8c] to-[#7b5ea7] p-4 pt-6 text-white shadow-inner">
      <div className="text-center">
        <Lock size={14} className="mx-auto opacity-80" aria-hidden />
        <p className="mt-1 font-display text-[44px] font-semibold leading-none tracking-tight">{time}</p>
        <p className="text-[13px] opacity-80">Pantalla de bloqueo</p>
      </div>
      <div className="mt-4 rounded-2xl bg-white/22 p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[12px] opacity-90">
          <span className="overflow-hidden rounded-[5px]"><AppIcon size={18} /></span>
          <span className="font-semibold">CCNA Quest</span><span className="ml-auto">ahora</span>
        </div>
        <p className="mt-1 text-[15px] font-semibold">{title}</p>
        <p className="text-[14px] leading-snug opacity-95">{body}</p>
      </div>
    </div>
  );
}

export function RemindersPage() {
  const native = remindersSupported();
  const [s, setS] = useState<ReminderSettings>(DEFAULT_REMINDERS);
  const [perm, setPerm] = useState<"granted" | "denied" | "prompt">("prompt");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { void getReminderSettings().then(setS); void permissionState().then(setPerm); }, []);

  const toggle = async () => {
    setMsg(null);
    if (!s.enabled) {
      const ok = await enableReminders();
      setPerm(await permissionState());
      setS(await getReminderSettings());
      if (ok) { void haptic("success"); setMsg("Listo: te avisaremos dos veces al día."); }
      else setMsg("Android no dio permiso de notificaciones. Puedes activarlo en Ajustes → Apps → CCNA Quest → Notificaciones.");
    } else {
      setS(await updateReminders({ enabled: false }));
      setMsg("Recordatorios apagados. Puedes volver a activarlos cuando quieras.");
    }
  };
  const setTime = async (k: "morning" | "evening", v: string) => {
    if (!v) return;
    setS(await updateReminders({ [k]: v }));
    void haptic("tap");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <LargeTitle title="Recordatorios" subtitle="Dos avisos amables al día para no perder el ritmo. Tú decides si los quieres y a qué hora." />

      {!native ? (
        <Group footer="Los recordatorios funcionan en la app de Android, porque se programan en el propio teléfono y se muestran aunque esté bloqueado.">
          <Row icon={Smartphone} tint="green" title="Disponible en la app de Android" subtitle="Descárgala desde la página del proyecto en GitHub" href="https://github.com/Uriel1021/ccna-quest/releases/latest" />
        </Group>
      ) : (
        <>
          <section className="mb-8 rounded-2xl bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className={clsx("grid size-12 place-items-center rounded-2xl", s.enabled ? "bg-brand/15 text-brand" : "bg-fill text-muted")}>
                {s.enabled ? <Bell aria-hidden /> : <BellOff aria-hidden />}
              </span>
              <div className="flex-1">
                <p className="text-[17px] font-semibold">Recordatorios diarios</p>
                <p className="text-[14px] text-muted">{s.enabled ? `Activos · ${s.morning} y ${s.evening}` : "Apagados"}</p>
              </div>
              <button role="switch" aria-checked={s.enabled} aria-label="Activar recordatorios" onClick={() => void toggle()}
                className={clsx("relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors", s.enabled ? "bg-ok" : "bg-fill ring-1 ring-border")}>
                <span className={clsx("absolute top-[2px] size-[27px] rounded-full bg-white shadow transition-[left]", s.enabled ? "left-[22px]" : "left-[2px]")} />
              </button>
            </div>
            {msg && <p className="mt-3 rounded-xl bg-fill p-3 text-[14px]" role="status">{msg}</p>}
            {perm === "denied" && !s.enabled && !msg && <p className="mt-3 rounded-xl bg-warn/12 p-3 text-[14px]">Las notificaciones están bloqueadas para esta app. Actívalas en Ajustes → Apps → CCNA Quest → Notificaciones.</p>}
          </section>

          <Group header="Horario" footer="Android puede entregarlos con unos minutos de diferencia para cuidar la batería.">
            <Row icon={Sun} tint="orange" title="Mañana" trailing={
              <input type="time" value={s.morning} onChange={(e) => void setTime("morning", e.target.value)} aria-label="Hora del recordatorio de la mañana"
                className="rounded-lg bg-fill px-2 py-1 font-semibold text-fg tabular-nums" />} />
            <Row icon={Moon} tint="indigo" title="Tarde / noche" trailing={
              <input type="time" value={s.evening} onChange={(e) => void setTime("evening", e.target.value)} aria-label="Hora del recordatorio de la tarde o noche"
                className="rounded-lg bg-fill px-2 py-1 font-semibold text-fg tabular-nums" />} />
          </Group>

          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <Button variant="tinted" onClick={() => { playChime(); void haptic("tap"); }}><Volume2 size={18} aria-hidden /> Escuchar el tono</Button>
            <Button variant="tinted" disabled={perm !== "granted"} onClick={() => { void testReminder().then(() => setMsg("Bloquea el teléfono: en 3 segundos llegará un aviso de prueba.")); }}>
              <Bell size={18} aria-hidden /> Enviar uno de prueba
            </Button>
          </div>
        </>
      )}

      <h2 className="mb-2 px-4 text-[13px] uppercase tracking-wide text-muted">Así se verán</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <LockPreview time={s.morning} title="☀️ ¡Buenos días!" body="5 minutos de redes con tu café. Hoy te toca: la lección 3.5 «Modelos de referencia»." />
        <LockPreview time={s.evening} title="🌙 ¿Repasamos un poquito?" body="Un minijuego rápido o la lección 3.6 antes de descansar." />
      </div>

      <Group header="Lo que debes saber">
        <Row icon={ShieldCheck} tint="green" title={<span className="whitespace-normal">Solo 2 avisos al día, nunca más.</span>} subtitle="Suenan una vez con un tono propio y no aparecen encima de lo que estás haciendo." />
        <Row icon={Lock} tint="blue" title={<span className="whitespace-normal">Se ven en la pantalla de bloqueo y en el panel de notificaciones.</span>} subtitle="Al tocarlos, la app abre directo tu siguiente lección." />
        <Row icon={Smartphone} tint="gray" title={<span className="whitespace-normal">Se programan en tu teléfono.</span>} subtitle="Funcionan sin internet y no se envía nada a ningún servidor." />
        <Row icon={BellOff} tint="red" title={<span className="whitespace-normal">Puedes apagarlos aquí cuando quieras.</span>} subtitle="También desde Ajustes de Android → Notificaciones." />
      </Group>
    </div>
  );
}
