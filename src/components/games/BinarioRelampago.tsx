"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Timer, Flame } from "lucide-react";
import { haptic, randInt, shuffle } from "@/lib/feedback";
import { ProgressBar, type GameProps } from "./GameFrame";

const DURATION = 60;
const PENALTY = 3;
const TARGET = 15; // aciertos para la puntuación "perfecta"
const VALUES = [128, 64, 32, 16, 8, 4, 2, 1];

type Q =
  | { kind: "build"; target: number }
  | { kind: "read"; value: number; options: number[] }
  | { kind: "hex"; value: number; options: number[] };

const toBin = (n: number) => n.toString(2).padStart(8, "0");
const toHex = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");

function distractors(v: number) {
  const set = new Set<number>([v]);
  const tries = [v ^ 1, v ^ 16, v ^ 128, v + 10, v - 10, v ^ 4, v ^ 64, randInt(1, 255)];
  for (const t of shuffle(tries)) { if (t > 0 && t < 256) set.add(t); if (set.size === 4) break; }
  while (set.size < 4) set.add(randInt(1, 255));
  return shuffle([...set]);
}

function makeQ(n: number): Q {
  // Primero tres de construir (para aprender los valores), luego mezcla.
  const kind = n < 3 ? "build" : (["build", "read", "hex"] as const)[n % 3];
  const value = n < 2 ? randInt(1, 31) : randInt(1, 255);
  if (kind === "build") return { kind, target: value };
  return { kind, value, options: distractors(value) };
}

export default function BinarioRelampago({ onFinish }: GameProps) {
  const [endAt, setEndAt] = useState(() => Date.now() + DURATION * 1000);
  const [left, setLeft] = useState(DURATION);
  const [n, setN] = useState(0);
  const [q, setQ] = useState<Q>(() => makeQ(0));
  const [bits, setBits] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const finished = useRef(false);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.max(0, (endAt - Date.now()) / 1000);
      setLeft(s);
      if (s <= 0 && !finished.current) {
        finished.current = true;
        clearInterval(t);
        onFinish({ score: scoreRef.current, max: TARGET, summary: `${scoreRef.current} conversiones en 60 segundos` });
      }
    }, 100);
    return () => clearInterval(t);
  }, [endAt, onFinish]);

  const nextQ = () => {
    const k = n + 1;
    setN(k);
    setQ(makeQ(k));
    setBits(0);
  };
  const correct = () => {
    setScore((s) => s + 1);
    setStreak((s) => s + 1);
    setFlash("ok");
    void haptic("success");
    setTimeout(() => { setFlash(null); nextQ(); }, 350);
  };
  const wrong = () => {
    setStreak(0);
    setFlash("bad");
    setEndAt((e) => e - PENALTY * 1000);
    void haptic("error");
    setTimeout(() => setFlash(null), 450);
  };

  const toggle = (i: number) => {
    if (q.kind !== "build" || flash === "ok") return;
    const nb = bits ^ (1 << (7 - i));
    setBits(nb);
    void haptic("tap");
    if (nb === q.target) correct();
  };
  const pickOpt = (v: number) => {
    if (q.kind === "build" || flash) return;
    if (v === q.value) correct(); else wrong();
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Timer size={18} className={left < 10 ? "text-danger" : "text-muted"} aria-hidden />
        <div className="flex-1"><ProgressBar value={left / DURATION} tint={left < 10 ? "bg-danger" : "bg-ok"} /></div>
        <span className="w-10 text-right text-[15px] font-semibold tabular-nums" aria-label={`${Math.ceil(left)} segundos`}>{Math.ceil(left)}s</span>
      </div>
      <div className="mb-5 flex items-center justify-between text-[15px]">
        <span className="font-semibold">{score} aciertos</span>
        {streak >= 3 && <span className="flex items-center gap-1 font-semibold text-warn"><Flame size={16} aria-hidden /> Racha de {streak}</span>}
      </div>

      <div className={clsx("rounded-2xl bg-surface p-5 shadow-sm transition-colors", flash === "ok" && "bg-ok/15", flash === "bad" && "bg-danger/15")}>
        {q.kind === "build" && (
          <>
            <p className="text-center text-[15px] text-muted">Enciende los bits para formar</p>
            <p className="text-center font-display text-[56px] font-bold leading-tight tabular-nums">{q.target}</p>
            <div className="mt-4 grid grid-cols-8 gap-1 sm:gap-2" role="group" aria-label="Bits">
              {VALUES.map((v, i) => {
                const on = (bits >> (7 - i)) & 1;
                return (
                  <button
                    key={v}
                    onClick={() => toggle(i)}
                    aria-pressed={!!on}
                    aria-label={`Bit de valor ${v}, ${on ? "encendido" : "apagado"}`}
                    className={clsx(
                      "pressable flex aspect-[3/4] flex-col items-center justify-center rounded-xl text-center",
                      on ? "bg-ok text-white shadow" : "bg-fill",
                    )}
                  >
                    <span className="font-mono text-[22px] font-bold sm:text-[28px]">{on}</span>
                    <span className={clsx("text-[10px] font-semibold sm:text-[12px]", on ? "opacity-90" : "text-muted")}>{v}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-center text-[15px] text-muted" aria-live="polite">
              Llevas: <b className="text-fg tabular-nums">{bits}</b>
              {bits > 0 && <> = {VALUES.filter((_, i) => (bits >> (7 - i)) & 1).join(" + ")}</>}
            </p>
          </>
        )}

        {q.kind !== "build" && (
          <>
            <p className="text-center text-[15px] text-muted">{q.kind === "read" ? "¿Cuánto vale en decimal este número binario?" : "¿Cuánto vale en decimal este número hexadecimal?"}</p>
            <p className="my-2 text-center font-mono text-[34px] font-bold tracking-wider sm:text-[44px]">
              {q.kind === "read" ? <>{toBin(q.value).slice(0, 4)}<span className="text-muted"> </span>{toBin(q.value).slice(4)}</> : <>0x{toHex(q.value)}</>}
            </p>
            {q.kind === "hex" && <p className="mb-2 text-center text-[13px] text-muted">Pista: el primer dígito vale ×16. A=10, B=11, C=12, D=13, E=14, F=15.</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {q.options.map((o) => (
                <button key={o} onClick={() => pickOpt(o)} className="pressable min-h-14 rounded-xl bg-fill font-display text-[24px] font-bold tabular-nums">{o}</button>
              ))}
            </div>
          </>
        )}
      </div>
      <p className="mt-3 text-center text-[13px] text-muted">Cada error resta {PENALTY} segundos.</p>
    </div>
  );
}
