"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { haptic, pick, randInt, shuffle } from "@/lib/feedback";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";

const strip = (g: string) => g.replace(/^0+/, "") || "0";
const hex4 = (n: number) => n.toString(16).padStart(4, "0");

/** Bloque de ceros más largo (≥2 grupos); si empatan, el de la izquierda. */
function longestZeroRun(groups: string[]) {
  let best = { start: -1, len: 0 };
  for (let i = 0; i < 8; ) {
    if (strip(groups[i]) !== "0") { i++; continue; }
    let j = i;
    while (j < 8 && strip(groups[j]) === "0") j++;
    if (j - i > best.len) best = { start: i, len: j - i };
    i = j;
  }
  return best.len >= 2 ? best : { start: -1, len: 0 };
}
export function compress(groups: string[]) {
  const s = groups.map(strip);
  const r = longestZeroRun(groups);
  if (r.start < 0) return s.join(":");
  return `${s.slice(0, r.start).join(":")}::${s.slice(r.start + r.len).join(":")}`;
}

function makeAddress(): string[] {
  const prefix = pick([["2001", "0db8"], ["fe80", "0000"], ["2001", "0db8"], ["2001", "0420"], ["2600", "0a0b"]]);
  const groups: string[] = [...prefix];
  while (groups.length < 8) {
    const r = Math.random();
    groups.push(r < 0.35 ? "0000" : r < 0.6 ? hex4(randInt(1, 0xff)) : r < 0.8 ? hex4(randInt(0x100, 0xfff)) : hex4(randInt(0x1000, 0xffff)));
  }
  // Garantiza al menos un bloque de 2+ ceros.
  if (longestZeroRun(groups).start < 0) { const s = randInt(2, 5); groups[s] = "0000"; groups[s + 1] = "0000"; }
  if (strip(groups[7]) === "0" && Math.random() < 0.5) groups[7] = hex4(randInt(1, 0xff));
  return groups;
}

function ExpandQ() {
  const g = makeAddress();
  const short = compress(g);
  const full = g.join(":");
  const r = longestZeroRun(g);
  const fewer = [...g.slice(0, r.start), ...g.slice(r.start + 1)].join(":");         // un grupo de menos
  const rightPad = g.map((x) => { const s = strip(x); return s === "0" ? "0000" : s.padEnd(4, "0"); }).join(":"); // ceros del lado equivocado
  const extra = [...g.slice(0, r.start), "0000", ...g.slice(r.start)].join(":");     // un grupo de más
  return { short, full, options: shuffle([...new Set([full, fewer, rightPad, extra])]) };
}

const ADDRS = 4;

export default function CompresorIpv6({ onFinish }: GameProps) {
  const addrs = useMemo(() => Array.from({ length: ADDRS }, makeAddress), []);
  const expands = useMemo(() => [ExpandQ(), ExpandQ()], []);
  const MAX = ADDRS * 2 + expands.length;

  const [ai, setAi] = useState(0);
  const [stripped, setStripped] = useState<Set<number>>(new Set());
  const [stepB, setStepB] = useState(false);
  const [done, setDone] = useState(false);
  const [errA, setErrA] = useState(false);
  const [errB, setErrB] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [ei, setEi] = useState(-1);
  const [pickE, setPickE] = useState<string | null>(null);

  const g = addrs[ai];
  const needs = g.map((x, i) => (x[0] === "0" ? i : -1)).filter((i) => i >= 0);
  const run = longestZeroRun(g);

  const tapGroup = (i: number) => {
    if (done) return;
    if (!stepB) {
      if (stripped.has(i)) return;
      if (g[i][0] !== "0") { setErrA(true); setMsg(`"${g[i]}" no tiene ceros a la izquierda: se queda igual.`); void haptic("error"); return; }
      const s = new Set(stripped); s.add(i); setStripped(s); setMsg(null); void haptic("tap");
      if (needs.every((k) => s.has(k))) { if (!errA) setScore((x) => x + 1); setStepB(true); }
      return;
    }
    if (strip(g[i]) !== "0") { setMsg("Toca un grupo que sea 0 (el inicio del bloque de ceros)."); return; }
    if (i !== run.start) {
      setErrB(true); void haptic("error");
      setMsg(`"::" se usa solo UNA vez y en el bloque de ceros más largo (aquí, desde el grupo ${run.start + 1}, son ${run.len} grupos). Si empatan, el de la izquierda.`);
      return;
    }
    if (!errB) setScore((x) => x + 1);
    setDone(true); setMsg(null); void haptic("success");
  };

  const nextAddr = () => {
    if (ai + 1 < ADDRS) { setAi(ai + 1); setStripped(new Set()); setStepB(false); setDone(false); setErrA(false); setErrB(false); setMsg(null); }
    else setEi(0);
  };
  const answerE = (o: string) => {
    if (pickE) return;
    setPickE(o);
    if (o === expands[ei].full) { setScore((s) => s + 1); void haptic("success"); } else void haptic("error");
  };

  if (ei >= 0) {
    const q = expands[ei];
    return (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1"><ProgressBar value={0.8 + (ei / expands.length) * 0.2} tint="bg-indigo" /></div>
          <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
        </div>
        <h2 className="mb-1 text-[20px] font-bold">Ahora al revés: expande</h2>
        <p className="mb-3 text-[15px] text-muted">¿Cuál es la dirección completa (8 grupos de 4 dígitos)?</p>
        <p className="mb-4 break-all rounded-2xl bg-surface p-5 text-center font-mono text-[22px] font-bold shadow-sm">{q.short}</p>
        <div className="grid gap-2">
          {q.options.map((o) => (
            <button key={o} onClick={() => answerE(o)} disabled={!!pickE}
              className={clsx("pressable min-h-12 break-all rounded-xl bg-surface px-3 py-2 text-left font-mono text-[13px] ring-1 ring-border/60 sm:text-[15px]",
                pickE && o === q.full && "!bg-ok text-white", pickE === o && o !== q.full && "!bg-danger text-white")}>{o}</button>
          ))}
        </div>
        {pickE && (
          <Feedback ok={pickE === q.full} onNext={() => { if (ei + 1 >= expands.length) onFinish({ score, max: MAX, summary: "Direcciones IPv6 dominadas" }); else { setEi(ei + 1); setPickE(null); } }} nextLabel={ei + 1 >= expands.length ? "Ver resultados" : "Siguiente"}>
            Cuenta los grupos que se ven: los que faltan para llegar a 8 son los que &quot;::&quot; escondía (todos 0000). Y cada grupo se rellena con ceros a la <b>izquierda</b> hasta tener 4 dígitos.
          </Feedback>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={(ai + (done ? 1 : stepB ? 0.5 : 0)) / ADDRS * 0.8} tint="bg-indigo" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
      </div>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-indigo">Dirección {ai + 1} de {ADDRS}</p>
      <h2 className="mb-1 text-[20px] font-bold">{!stepB ? "Regla 1: quita los ceros a la izquierda" : !done ? "Regla 2: cambia el bloque de ceros más largo por ::" : "¡Comprimida!"}</h2>
      <p className="mb-4 text-[15px] text-muted">{!stepB ? `Toca los grupos que empiezan con 0 (faltan ${needs.filter((k) => !stripped.has(k)).length}).` : !done ? "Toca el PRIMER grupo del bloque de ceros más largo." : "Así se escribe abreviada:"}</p>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="group" aria-label="Grupos de la dirección IPv6">
        {g.map((x, i) => {
          const inRun = done && i >= run.start && i < run.start + run.len;
          return (
            <button key={i} onClick={() => tapGroup(i)}
              className={clsx("pressable flex min-h-14 flex-col items-center justify-center rounded-xl font-mono text-[17px] font-bold ring-1 ring-border/60",
                inRun ? "bg-indigo text-white" : stripped.has(i) || stepB ? "bg-surface" : "bg-fill",
                stepB && !done && strip(x) === "0" && "ring-2 ring-indigo")}>
              <span>{stepB || stripped.has(i) ? strip(x) : x}</span>
              <span className="text-[10px] font-medium text-muted">{inRun ? "::" : `grupo ${i + 1}`}</span>
            </button>
          );
        })}
      </div>

      {msg && <p className="mt-3 rounded-xl bg-danger/10 p-3 text-[15px]" role="alert">{msg}</p>}
      {done && (
        <Feedback ok={!errA && !errB} title={!errA && !errB ? "¡Perfecta!" : "Comprimida (con ayuda)"} onNext={nextAddr} nextLabel={ai + 1 < ADDRS ? "Siguiente dirección" : "Ronda final"}>
          <span className="block break-all font-mono text-[17px] font-bold">{compress(g)}</span>
          <span className="mt-1 block text-muted">Antes: <span className="break-all font-mono">{g.join(":")}</span></span>
        </Feedback>
      )}
    </div>
  );
}
