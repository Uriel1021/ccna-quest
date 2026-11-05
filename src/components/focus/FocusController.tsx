"use client";
/**
 * Controlador global del Modo Enfoque (montado en el layout, activo en todas las pantallas).
 *  - Muestra el tiempo restante arriba (H1) y permite estudiar en cualquier sección de la app.
 *  - APK: espera a que el alumno confirme "Fijar app"; después desactiva Atrás y vigila si deja de estar fijada.
 *  - Web: vigila si se sale de pantalla completa o se cambia de pestaña.
 *  - Solo cuenta una interrupción si el bloqueo estuvo activo y se perdió.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Lock, Pin, Timer } from "lucide-react";
import { Button } from "@/components/ui/apple";
import { haptic } from "@/lib/feedback";
import { abortFocus, activeFocus, addInterruption, completeFocus, endsAt, FocusLock, fmtClock, getPhase, isNative, onPhase, reengage, setPhase, type LockPhase } from "@/lib/focus";
import type { LocalFocus } from "@/lib/local-db";

export function FocusController() {
  const active = useLiveQuery(() => activeFocus(), []);
  const [now, setNow] = useState(() => Date.now());
  const [phase, setPhaseState] = useState<LockPhase>(getPhase);
  const [escaped, setEscaped] = useState(false);
  const lastInterrupt = useRef(0);
  const pendingSince = useRef(0);
  const pathname = usePathname();
  const sessionRef = useRef<LocalFocus | undefined>(undefined);
  useEffect(() => { sessionRef.current = active; });
  useEffect(() => onPhase((p) => { setPhaseState(p); if (p === "pending") pendingSince.current = Date.now(); }), []);

  const interrupt = async () => {
    const f = sessionRef.current;
    setPhase("none");
    setEscaped(true);
    if (!f || Date.now() - lastInterrupt.current < 2500) return; // evita contar dos veces la misma salida
    lastInterrupt.current = Date.now();
    void haptic("error");
    await addInterruption(f);
  };

  // Sesión activa al abrir la app (p. ej. se reinició): ¿sigue fijada?
  useEffect(() => {
    if (!active || getPhase() !== "none") return;
    void FocusLock.status().then((s) => { if (s.locked) setPhase("locked"); else setEscaped(true); });
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reloj y fin de sesión
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= endsAt(active)) { clearInterval(t); setEscaped(false); void completeFocus(active).then(() => haptic("success")); }
    }, 500);
    return () => clearInterval(t);
  }, [active]);

  // Vigilancia de salidas
  useEffect(() => {
    if (!active) return;
    const cleanups: (() => void)[] = [];
    if (isNative()) {
      const poll = setInterval(async () => {
        const p = getPhase();
        if (p === "none") return;
        const s = await FocusLock.status().catch(() => null);
        if (!s) return;
        if (s.locked && p === "pending") { setPhase("locked"); setEscaped(false); void haptic("success"); }
        else if (!s.locked && p === "locked") void interrupt();
      }, 1000);
      cleanups.push(() => clearInterval(poll));
      // Botón Atrás desactivado durante la sesión.
      void import("@capacitor/app").then(async ({ App }) => {
        const h = await App.addListener("backButton", () => { void haptic("error"); });
        cleanups.push(() => void h.remove());
      });
    } else {
      const onVis = () => { if (document.visibilityState === "hidden" && getPhase() === "locked") void interrupt(); };
      const onFs = () => { if (!document.fullscreenElement && getPhase() === "locked" && Date.now() < endsAt(active)) void interrupt(); };
      const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
      document.addEventListener("visibilitychange", onVis);
      document.addEventListener("fullscreenchange", onFs);
      window.addEventListener("beforeunload", onUnload);
      cleanups.push(() => { document.removeEventListener("visibilitychange", onVis); document.removeEventListener("fullscreenchange", onFs); window.removeEventListener("beforeunload", onUnload); });
    }
    return () => cleanups.forEach((c) => c());
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;
  const left = endsAt(active) - now;
  const neverLocked = active.interruptions === 0 && Date.now() - active.startedAt < 120_000;

  return (
    <>
      {pathname !== "/enfoque" && (
        <Link href="/enfoque" className="material sticky top-12 z-20 flex items-center justify-center gap-2 border-b border-indigo/30 bg-indigo/10 py-1.5 text-[14px] font-semibold text-indigo" aria-label={`Modo enfoque activo, quedan ${fmtClock(left)}`}>
          <Lock size={14} aria-hidden /> Modo enfoque · <span className="font-mono tabular-nums">{fmtClock(left)}</span>
        </Link>
      )}

      {/* Esperando a que el alumno confirme "Fijar app" en el aviso de Android */}
      {phase === "pending" && !escaped && left > 0 && (
        <div className="pointer-events-none fixed inset-x-0 top-1/4 z-[55] flex justify-center p-6" role="status">
          <div className="animate-fade max-w-sm rounded-2xl bg-indigo p-4 text-center text-white shadow-2xl">
            <Pin className="mx-auto" aria-hidden />
            <p className="mt-2 font-semibold">Confirma en el aviso de Android</p>
            <p className="mt-1 text-[15px] opacity-90">Toca <b>&quot;Entendido&quot;</b> (o <b>&quot;Got it&quot;</b>) abajo para fijar la app y empezar a contar.</p>
          </div>
        </div>
      )}

      {(escaped || (phase === "pending" && Date.now() - pendingSince.current > 12_000)) && left > 0 && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-6" role="alertdialog" aria-modal="true" aria-labelledby="esc-title">
          <div className="animate-sheet w-full max-w-sm rounded-[20px] bg-surface p-6 text-center shadow-2xl">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo/15 text-indigo"><Timer size={28} aria-hidden /></span>
            <h2 id="esc-title" className="mt-3 text-[20px] font-bold">{escaped ? "Tu sesión de enfoque sigue activa" : "La app aún no está fijada"}</h2>
            <p className="mt-1 text-[15px] text-muted">
              Quedan <b className="font-mono text-fg">{fmtClock(left)}</b>. {active.interruptions > 0 && <>Llevas {active.interruptions} interrupción(es) (−2 XP cada una).</>}
              {isNative() ? " Fija la pantalla para continuar (Android te pedirá confirmar)." : " Vuelve a pantalla completa para continuar."}
            </p>
            <Button className="mt-5 w-full" onClick={() => { setEscaped(false); void reengage().catch(() => setEscaped(true)); }}>
              <Lock size={18} aria-hidden /> {escaped ? "Volver al enfoque" : "Intentar de nuevo"}
            </Button>
            <button className="mt-3 w-full py-2 text-[15px] font-semibold text-danger"
              onClick={() => {
                const msg = neverLocked ? "¿Cancelar la sesión? Como el bloqueo no llegó a activarse, no perderás XP." : "¿Abandonar la sesión? Se registrará como abandonada y perderás 10 XP.";
                if (confirm(msg)) void abortFocus(active, !neverLocked).then(() => setEscaped(false));
              }}>
              {neverLocked ? "Cancelar sesión" : "Abandonar sesión"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
