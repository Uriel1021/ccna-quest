"use client";
/**
 * Pantalla del Modo Enfoque.
 *  1. El alumno elige cuánto tiempo (5–180 min) y decide activarlo.
 *  2. Una hoja de advertencia explica que NO podrá salir durante ese tiempo y pide confirmación explícita.
 *  3. Sesión activa: cronómetro, accesos para estudiar dentro de la app y salida de emergencia
 *     (mantener presionado 3 s + confirmar).
 */
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useLiveQuery } from "@/lib/use-live-query";
import { BookOpen, ClipboardCheck, Gamepad2, Lock, Minus, Plus, ShieldAlert, Timer } from "lucide-react";
import { Button, Group, LargeTitle, ProgressRing, Row } from "@/components/ui/apple";
import { db } from "@/lib/local-db";
import { haptic } from "@/lib/feedback";
import { abortFocus, activeFocus, endsAt, fmtClock, focusXp, getPreferredMinutes, isNative, MAX_MINUTES, MIN_MINUTES, PRESETS, setPreferredMinutes, startFocus } from "@/lib/focus";

function HoldToExit({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const start = () => {
    const t0 = performance.now();
    const tick = (t: number) => {
      const v = Math.min(1, (t - t0) / 3000);
      setP(v);
      if (v >= 1) { void haptic("error"); onDone(); setP(0); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const cancel = () => { cancelAnimationFrame(raf.current); setP(0); };
  return (
    <button
      onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
      onKeyDown={(e) => { if (e.key === "Enter" && !e.repeat) start(); }} onKeyUp={cancel}
      className="relative w-full overflow-hidden rounded-full bg-danger/10 py-3 text-[15px] font-semibold text-danger select-none"
      aria-label="Salida de emergencia: mantén presionado 3 segundos"
    >
      <span className="absolute inset-y-0 left-0 bg-danger/25" style={{ width: `${p * 100}%` }} aria-hidden />
      <span className="relative">{p > 0 ? "Sigue presionando…" : "Salida de emergencia (mantén presionado 3 s)"}</span>
    </button>
  );
}

export function FocusPage() {
  const active = useLiveQuery(() => activeFocus(), []);
  const history = useLiveQuery(() => db.focus.orderBy("startedAt").reverse().limit(30).toArray(), [], []);
  const [minutes, setMinutes] = useState(25);
  const [sheet, setSheet] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmAbort, setConfirmAbort] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => { void getPreferredMinutes().then(setMinutes); }, []);
  useEffect(() => { if (!active) return; const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, [active]);

  const set = (m: number) => { const v = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, m)); setMinutes(v); void setPreferredMinutes(v); void haptic("tap"); };
  const activate = async () => {
    setError(null);
    try { await startFocus(minutes); setSheet(false); setAgree(false); void haptic("success"); }
    catch (e) { setError((e as Error).message); }
  };

  const completed = history.filter((f) => f.status === "completed");
  const totalMin = Math.round(completed.reduce((s, f) => s + f.targetSec, 0) / 60);
  const last = history[0];

  /* ── Sesión activa ── */
  if (active) {
    const total = active.targetSec * 1000, left = endsAt(active) - now;
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="mt-2 text-[13px] font-semibold uppercase tracking-wide text-indigo">Modo enfoque activo</p>
        <div className="relative mx-auto mt-4 grid size-64 place-items-center">
          <ProgressRing value={1 - left / total} size={256} stroke={16} tint="var(--indigo)" />
          <div className="absolute">
            <p className="font-mono text-[52px] font-bold tabular-nums tracking-tight" role="timer" aria-live="off">{fmtClock(left)}</p>
            <p className="text-[15px] text-muted">de {Math.round(active.targetSec / 60)} min</p>
          </div>
        </div>
        <p className="mt-4 text-[15px] text-muted">
          {isNative() ? "La app está fijada: no hay notificaciones ni otras apps." : "Mantente en esta pestaña y en pantalla completa."}
          {active.interruptions > 0 && <> Interrupciones: <b className="text-warn">{active.interruptions}</b>.</>}
        </p>

        <div className="mt-6 text-left">
          <Group header="Estudia mientras tanto">
            <Row href="/aprender" icon={BookOpen} tint="orange" title="Aprender" subtitle="Lee las lecciones del temario" />
            <Row href="/juegos" icon={Gamepad2} tint="pink" title="Juegos" subtitle="Practica con los minijuegos" />
            <Row href="/examenes" icon={ClipboardCheck} tint="green" title="Exámenes" subtitle="Ponte a prueba" />
          </Group>
        </div>

        {confirmAbort ? (
          <div className="rounded-2xl bg-danger/10 p-4 text-left" role="alertdialog" aria-labelledby="abort-t">
            <p id="abort-t" className="font-semibold text-danger">¿Abandonar la sesión?</p>
            <p className="mt-1 text-[15px]">Se registrará como abandonada y perderás 10 XP. Si es una emergencia, adelante.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="tinted" onClick={() => setConfirmAbort(false)}>Seguir estudiando</Button>
              <Button className="bg-danger" onClick={() => { void abortFocus(active); setConfirmAbort(false); }}>Abandonar</Button>
            </div>
          </div>
        ) : <HoldToExit onDone={() => setConfirmAbort(true)} />}
      </div>
    );
  }

  /* ── Configuración ── */
  return (
    <div className="mx-auto max-w-2xl">
      <LargeTitle title="Modo enfoque" subtitle="Elige cuánto tiempo quieres estudiar sin distracciones. Tú decides cuándo activarlo." />

      {last && last.status !== "active" && Date.now() - (last.endedAt ?? 0) < 10 * 60_000 && (
        <section className={clsx("mb-6 rounded-2xl p-4", last.status === "completed" ? "bg-ok/12" : "bg-danger/10")} role="status">
          <p className="font-semibold">{last.status === "completed" ? `🎉 ¡Completaste ${Math.round(last.targetSec / 60)} minutos de enfoque! +${focusXp(last)} XP` : "Sesión abandonada"}</p>
          <p className="text-[15px] text-muted">{last.status === "completed" ? `Interrupciones: ${last.interruptions}.` : "No pasa nada: inténtalo con una sesión más corta."}</p>
        </section>
      )}

      <section className="mb-8 rounded-2xl bg-surface p-5 text-center shadow-sm">
        <p className="text-[15px] text-muted">Duración de la sesión</p>
        <div className="mt-2 flex items-center justify-center gap-5">
          <button onClick={() => set(minutes - 5)} disabled={minutes <= MIN_MINUTES} aria-label="Restar 5 minutos" className="pressable grid size-12 place-items-center rounded-full bg-fill disabled:opacity-40"><Minus /></button>
          <p className="min-w-36 font-display text-[56px] font-bold tabular-nums leading-none" aria-live="polite">{minutes}<span className="text-[22px] text-muted"> min</span></p>
          <button onClick={() => set(minutes + 5)} disabled={minutes >= MAX_MINUTES} aria-label="Sumar 5 minutos" className="pressable grid size-12 place-items-center rounded-full bg-fill disabled:opacity-40"><Plus /></button>
        </div>
        <input type="range" min={MIN_MINUTES} max={MAX_MINUTES} step={5} value={minutes} onChange={(e) => set(Number(e.target.value))}
          className="mt-5 w-full accent-[var(--indigo)]" aria-label="Duración en minutos" />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => set(p)} aria-pressed={minutes === p}
              className={clsx("pressable rounded-full px-4 py-1.5 text-[15px] font-semibold", minutes === p ? "bg-indigo text-white" : "bg-fill")}>{p} min</button>
          ))}
        </div>
        <Button onClick={() => { setSheet(true); setAgree(false); setError(null); }} className="mt-6 w-full bg-indigo"><Lock size={18} aria-hidden /> Activar modo enfoque</Button>
      </section>

      <Group header="Tu progreso">
        <Row icon={Timer} tint="indigo" title="Sesiones completadas" trailing={completed.length} />
        <Row icon={Timer} tint="green" title="Minutos de enfoque" trailing={totalMin} />
      </Group>

      {history.filter((f) => f.status !== "active").length > 0 && (
        <Group header="Sesiones recientes">
          {history.filter((f) => f.status !== "active").slice(0, 6).map((f) => (
            <Row key={f.id}
              leading={<span className={clsx("grid size-[29px] shrink-0 place-items-center rounded-full text-[13px] text-white", f.status === "completed" ? "bg-ok" : "bg-danger")}>{f.status === "completed" ? "✓" : "✗"}</span>}
              title={`${Math.round(f.targetSec / 60)} min · ${f.status === "completed" ? "Completada" : "Abandonada"}`}
              subtitle={`${new Date(f.startedAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })} · ${f.interruptions} interrupción(es)`} />
          ))}
        </Group>
      )}

      {/* Hoja de advertencia y consentimiento */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-labelledby="warn-title">
          <button aria-label="Cancelar" tabIndex={-1} className="animate-fade absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div className="animate-sheet relative w-full max-w-lg rounded-t-[16px] bg-bg p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:rounded-[16px]">
            <div className="mx-auto mb-3 h-[5px] w-9 rounded-full bg-muted/40 md:hidden" aria-hidden />
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-warn/15 text-warn"><ShieldAlert size={30} aria-hidden /></span>
            <h2 id="warn-title" className="mt-3 text-center text-[22px] font-bold">Antes de activar</h2>
            <p className="mt-1 text-center text-[15px] text-muted">Durante <b className="text-fg">{minutes} minutos</b>:</p>
            <ul className="mt-4 space-y-2 rounded-2xl bg-surface p-4 text-[15px]">
              {isNative() ? (
                <>
                  <li>🔒 <b>No podrás salir de CCNA Quest</b> ni abrir otras apps.</li>
                  <li>🔕 No verás notificaciones.</li>
                  <li>📱 Los botones de Inicio y Recientes no funcionarán.</li>
                  <li>📚 Sí podrás moverte por Aprender, Juegos y Exámenes.</li>
                  <li>☎️ Las llamadas de emergencia siempre funcionan.</li>
                </>
              ) : (
                <>
                  <li>🖥️ La app se pondrá en pantalla completa.</li>
                  <li>🚫 Si sales de la pestaña o de pantalla completa contará como interrupción (−2 XP).</li>
                  <li>📚 Sí podrás moverte por Aprender, Juegos y Exámenes.</li>
                  <li>💡 Para el bloqueo total usa la app de Android.</li>
                </>
              )}
            </ul>
            <p className="mt-3 text-[13px] text-muted">
              {isNative() ? "Android te pedirá confirmar \"Fijar app\". " : ""}Solo podrás terminar antes con la salida de emergencia (mantener presionado 3 segundos), y la sesión contará como abandonada.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-surface p-3">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-5 accent-[var(--indigo)]" />
              <span className="text-[15px] font-medium">Entiendo que no podré salir de la app durante {minutes} minutos.</span>
            </label>
            {error && <p className="mt-3 rounded-xl bg-danger/10 p-3 text-[15px] text-danger" role="alert">{error}</p>}
            <div className="mt-4 grid gap-2">
              <Button onClick={() => void activate()} disabled={!agree} className="bg-indigo"><Lock size={18} aria-hidden /> Activar por {minutes} min</Button>
              <Button variant="plain" onClick={() => setSheet(false)}>Ahora no</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
