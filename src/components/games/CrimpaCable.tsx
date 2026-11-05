"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/apple";
import { haptic, shuffle } from "@/lib/feedback";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";

type Wire = { id: string; name: string; color: string; striped: boolean };
const C = { naranja: "#ff8a00", verde: "#22a447", azul: "#1f6fe5", marron: "#8b5a2b" };
const W: Record<string, Wire> = {
  bn: { id: "bn", name: "Blanco-naranja", color: C.naranja, striped: true },
  n: { id: "n", name: "Naranja", color: C.naranja, striped: false },
  bv: { id: "bv", name: "Blanco-verde", color: C.verde, striped: true },
  v: { id: "v", name: "Verde", color: C.verde, striped: false },
  ba: { id: "ba", name: "Blanco-azul", color: C.azul, striped: true },
  a: { id: "a", name: "Azul", color: C.azul, striped: false },
  bm: { id: "bm", name: "Blanco-marrón", color: C.marron, striped: true },
  m: { id: "m", name: "Marrón", color: C.marron, striped: false },
};
const T568B = ["bn", "n", "bv", "a", "ba", "v", "bm", "m"];
const T568A = ["bv", "v", "bn", "a", "ba", "n", "bm", "m"];

const wireBg = (w: Wire) => (w.striped ? `repeating-linear-gradient(135deg, #fff 0 6px, ${w.color} 6px 12px)` : w.color);

const CASES = [
  { q: "Conectar una PC a un switch", a: "Directo", why: "Equipos de distinto tipo (PC ↔ switch) usan cable directo: el mismo estándar en ambas puntas." },
  { q: "Conectar dos switches antiguos (sin auto-MDIX)", a: "Cruzado", why: "Equipos del mismo tipo necesitan cable cruzado: T568A en una punta y T568B en la otra." },
  { q: "Entrar a configurar un router por su puerto de consola", a: "Consola", why: "El puerto de consola usa un cable de consola (rollover), no un cable Ethernet normal." },
  { q: "Conectar un router a un switch", a: "Directo", why: "Router ↔ switch son equipos de distinto tipo: cable directo." },
  { q: "Conectar dos PCs directamente (sin auto-MDIX)", a: "Cruzado", why: "PC ↔ PC son del mismo tipo: cable cruzado." },
];
const MAX = 8 + 8 + 4;

function Connector({ slots, onRemove, state }: { slots: (string | null)[]; onRemove: (i: number) => void; state: (null | boolean)[] }) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-t-2xl border-4 border-b-0 border-sky-200/70 bg-sky-100/40 px-3 pt-3 dark:border-sky-300/30 dark:bg-sky-300/10">
        <div className="grid grid-cols-8 gap-1.5">
          {slots.map((id, i) => {
            const w = id ? W[id] : null;
            return (
              <button
                key={i}
                onClick={() => onRemove(i)}
                disabled={!w}
                aria-label={w ? `Pin ${i + 1}: ${w.name}. Toca para quitar.` : `Pin ${i + 1} vacío`}
                className={clsx("flex h-28 flex-col items-center justify-end rounded-t-md pb-1 transition-all",
                  !w && "border-2 border-dashed border-border",
                  state[i] === false && "ring-4 ring-danger", state[i] === true && "ring-2 ring-ok")}
                style={w ? { background: wireBg(w) } : undefined}
              >
                <span className="rounded bg-black/55 px-1 text-[11px] font-bold text-white">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-8 rounded-b-xl bg-sky-200/70 dark:bg-sky-300/30" aria-hidden />
    </div>
  );
}

function BuildRound({ target, label, onDone }: { target: string[]; label: string; onDone: (pts: number) => void }) {
  const [slots, setSlots] = useState<(string | null)[]>(Array(8).fill(null));
  const [pool, setPool] = useState(() => shuffle(Object.keys(W)));
  const [state, setState] = useState<(null | boolean)[]>(Array(8).fill(null));
  const [first, setFirst] = useState(true);
  const [pts, setPts] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const add = (id: string) => {
    const i = slots.indexOf(null);
    if (i < 0) return;
    void haptic("tap");
    setSlots((s) => s.map((v, k) => (k === i ? id : v)));
    setPool((p) => p.filter((x) => x !== id));
    setState(Array(8).fill(null));
  };
  const remove = (i: number) => {
    const id = slots[i];
    if (!id || solved) return;
    setSlots((s) => s.map((v, k) => (k === i ? null : v)));
    setPool((p) => [...p, id]);
    setState(Array(8).fill(null));
  };
  const crimp = () => {
    const res = slots.map((id, i) => id === target[i]);
    const good = res.filter(Boolean).length;
    if (first) { setPts(good); setFirst(false); }
    setState(res);
    if (good === 8) { setSolved(true); void haptic("success"); } else void haptic("error");
  };

  return (
    <>
      <h2 className="mb-1 text-[20px] font-bold">Arma un cable {label}</h2>
      <p className="mb-4 text-[15px] text-muted">Pin 1 a la izquierda (con la pestaña del conector hacia abajo).</p>
      <Connector slots={slots} onRemove={remove} state={state} />
      {!solved && (
        <div className="mt-5 grid grid-cols-2 gap-2" aria-label="Hilos disponibles">
          {pool.map((id) => (
            <button key={id} onClick={() => add(id)} className="pressable flex min-h-12 items-center gap-3 rounded-xl bg-surface px-3 ring-1 ring-border/60">
              <span className="h-6 w-10 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: wireBg(W[id]) }} aria-hidden />
              <span className="text-[15px] font-medium">{W[id].name}</span>
            </button>
          ))}
        </div>
      )}
      {solved ? (
        <Feedback ok title={`¡Cable ${label} perfecto!`} onNext={() => onDone(pts ?? 0)} nextLabel="Continuar">
          {label === "T568B"
            ? "Truco T568B: blanco-naranja, naranja, blanco-verde, azul, blanco-azul, verde, blanco-marrón, marrón. Fíjate que el azul va \"al centro\" invertido (4 azul, 5 blanco-azul)."
            : "T568A es igual a T568B pero intercambiando el par naranja con el verde."}
        </Feedback>
      ) : (
        <>
          {state.some((s) => s === false) && (
            <p className="mt-4 rounded-xl bg-danger/10 p-3 text-[15px]" role="status">
              Los pines marcados en rojo están mal. Tócalos para sacarlos y vuelve a intentar.
            </p>
          )}
          <Button onClick={crimp} disabled={slots.includes(null)} className="mt-5 w-full">Crimpar</Button>
        </>
      )}
    </>
  );
}

export default function CrimpaCable({ onFinish }: GameProps) {
  const [stage, setStage] = useState(0);
  const [score, setScore] = useState(0);
  const cases = useMemo(() => shuffle(CASES).slice(0, 4), []);
  const [ci, setCi] = useState(0);
  const [pick, setPick] = useState<string | null>(null);

  const progress = stage === 0 ? 0 : stage === 1 ? 0.4 : 0.8 + (ci / cases.length) * 0.2;
  const choose = (a: string) => {
    if (pick) return;
    setPick(a);
    const ok = a === cases[ci].a;
    if (ok) setScore((s) => s + 1);
    void haptic(ok ? "success" : "error");
  };
  const next = () => {
    if (ci + 1 >= cases.length) return onFinish({ score, max: MAX, summary: "Cables armados como un técnico" });
    setCi(ci + 1);
    setPick(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={progress} tint="bg-teal" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
      </div>
      {stage === 0 && <BuildRound key="b" target={T568B} label="T568B" onDone={(p) => { setScore((s) => s + p); setStage(1); }} />}
      {stage === 1 && <BuildRound key="a" target={T568A} label="T568A" onDone={(p) => { setScore((s) => s + p); setStage(2); }} />}
      {stage === 2 && (
        <>
          <h2 className="mb-1 text-[20px] font-bold">¿Qué cable usas?</h2>
          <p className="mb-4 text-[15px] text-muted">Caso {ci + 1} de {cases.length}</p>
          <div className="mb-4 rounded-2xl bg-surface p-5 text-center text-[19px] font-semibold shadow-sm">{cases[ci].q}</div>
          <div className="grid grid-cols-3 gap-2">
            {["Directo", "Cruzado", "Consola"].map((o) => (
              <button key={o} onClick={() => choose(o)} disabled={!!pick}
                className={clsx("pressable min-h-14 rounded-xl bg-surface font-semibold ring-1 ring-border/60",
                  pick && o === cases[ci].a && "!bg-ok text-white", pick === o && o !== cases[ci].a && "!bg-danger text-white")}>
                {o}
              </button>
            ))}
          </div>
          {pick && <Feedback ok={pick === cases[ci].a} onNext={next} nextLabel={ci + 1 >= cases.length ? "Ver resultados" : "Siguiente"}>{cases[ci].why}</Feedback>}
        </>
      )}
    </div>
  );
}
