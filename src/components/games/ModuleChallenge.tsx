"use client";
/**
 * Reto del módulo: minijuego final que reemplaza al examen del módulo.
 * Se desbloquea al estudiar todas las lecciones. Preguntas del módulo a contrarreloj,
 * con 3 vidas, rachas que multiplican los puntos y bono por rapidez.
 * Si aciertas al menos el 70 %, ganas la insignia "Módulo N dominado".
 */
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Check, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/apple";
import { haptic, shuffle } from "@/lib/feedback";
import { awardBadge } from "@/lib/progress";
import { questionsForModules } from "@/content/questions";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";
import { Lives } from "./TimerBar";

const SECONDS = 25;
export const PASS_RATIO = 0.7;

export function makeChallenge(moduleId: number) {
  function Challenge({ onFinish }: GameProps) {
    const qs = useMemo(() => shuffle(questionsForModules([moduleId])).map((q) => ({ q, order: shuffle(q.options.map((_, i) => i)) })), []);
    const [i, setI] = useState(0);
    const [lives, setLives] = useState(3);
    const [correct, setCorrect] = useState(0);
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [picked, setPicked] = useState<number[]>([]);
    const [result, setResult] = useState<null | { ok: boolean; gained: number; timeout?: boolean }>(null);
    const [left, setLeft] = useState(SECONDS);
    const start = useRef(performance.now());
    const timeoutRef = useRef<() => void>(() => {});

    const cur = qs[i];
    const multi = cur.q.correct.length > 1;

    const judge = (ans: number[], timeout = false) => {
      if (result) return;
      const ok = !timeout && ans.length === cur.q.correct.length && cur.q.correct.every((c) => ans.includes(c));
      if (ok) {
        const s = streak + 1;
        const mult = s >= 5 ? 2 : s >= 3 ? 1.5 : 1;
        const gained = Math.round((100 + Math.round((left / SECONDS) * 50)) * mult);
        setStreak(s); setCorrect((c) => c + 1); setPoints((p) => p + gained);
        setResult({ ok: true, gained }); void haptic("success");
      } else {
        setStreak(0); setLives((l) => l - 1);
        setResult({ ok: false, gained: 0, timeout }); void haptic("error");
      }
    };
    timeoutRef.current = () => judge(picked, true);

    useEffect(() => {
      if (result) return;
      start.current = performance.now();
      const t = setInterval(() => {
        const l = Math.max(0, SECONDS - (performance.now() - start.current) / 1000);
        setLeft(l);
        if (l <= 0) { clearInterval(t); timeoutRef.current(); }
      }, 100);
      return () => clearInterval(t);
    }, [i, result]);

    const choose = (o: number) => {
      if (result) return;
      void haptic("tap");
      if (!multi) { setPicked([o]); return judge([o]); }
      setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : p.length < cur.q.correct.length ? [...p, o] : p));
    };

    const next = async () => {
      const over = lives <= 0 || i + 1 >= qs.length;
      if (over) {
        const ratio = correct / qs.length;
        if (ratio >= PASS_RATIO) await awardBadge(`dominado-m${moduleId}`);
        onFinish({
          score: correct, max: qs.length,
          summary: ratio >= PASS_RATIO ? `¡Módulo ${moduleId} dominado! ${points} puntos` : lives <= 0 ? `Te quedaste sin vidas · ${points} puntos` : `Necesitas 70 % para dominar el módulo · ${points} puntos`,
        });
        return;
      }
      setI(i + 1); setPicked([]); setResult(null); setLeft(SECONDS);
    };

    return (
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex-1"><ProgressBar value={(i + (result ? 1 : 0)) / qs.length} tint="bg-warn" /></div>
          <Lives n={lives} />
        </div>
        <div className="mb-4 flex items-center justify-between text-[15px]">
          <span className="inline-flex items-center gap-1 font-semibold"><Zap size={16} className="text-accent" aria-hidden /> {points} pts</span>
          {streak >= 3 && <span className="inline-flex items-center gap-1 font-semibold text-warn"><Flame size={16} aria-hidden /> Racha ×{streak >= 5 ? 2 : 1.5}</span>}
          <span className="text-muted">Pregunta {i + 1}/{qs.length}</span>
        </div>

        {/* Mecha del tiempo */}
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-fill" role="timer" aria-label={`${Math.ceil(left)} segundos`}>
          <div className={clsx("h-full rounded-full", left < 7 ? "bg-danger" : "bg-warn")} style={{ width: `${(left / SECONDS) * 100}%` }} />
        </div>

        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <p className="text-[19px] font-semibold leading-snug">{cur.q.prompt}</p>
          {multi && <p className="mt-1 text-[14px] font-medium text-brand">Elige {cur.q.correct.length} · llevas {picked.length}</p>}
        </div>
        <div className="mt-3 grid gap-2">
          {cur.order.map((o) => {
            const isAns = !!result && cur.q.correct.includes(o);
            const isBad = !!result && picked.includes(o) && !cur.q.correct.includes(o);
            const sel = picked.includes(o);
            return (
              <button key={o} onClick={() => choose(o)} disabled={!!result}
                className={clsx("pressable flex min-h-14 items-center gap-3 rounded-xl bg-surface px-4 text-left text-[16px] ring-1 ring-border/60",
                  sel && !result && "ring-2 ring-brand", isAns && "!bg-ok text-white ring-0", isBad && "!bg-danger text-white ring-0", result && !isAns && !isBad && "opacity-50")}>
                {multi && <span className={clsx("grid size-5 shrink-0 place-items-center rounded-md border-2", sel ? "border-current" : "border-muted/40")}>{sel && <Check size={12} strokeWidth={3} />}</span>}
                {cur.q.options[o]}
              </button>
            );
          })}
        </div>
        {multi && !result && <Button onClick={() => judge(picked)} disabled={picked.length !== cur.q.correct.length} className="mt-3 w-full">Comprobar</Button>}

        {result && (
          <Feedback ok={result.ok} title={result.ok ? `¡Correcto! +${result.gained}` : result.timeout ? "¡Se acabó el tiempo!" : "Incorrecto"} onNext={() => void next()}
            nextLabel={lives <= 0 ? "Ver resultados" : i + 1 >= qs.length ? "Ver resultados" : "Siguiente"}>
            {cur.q.explain}
          </Feedback>
        )}
      </div>
    );
  }
  return Challenge;
}
