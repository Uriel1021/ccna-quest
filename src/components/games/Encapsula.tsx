"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { haptic, shuffle } from "@/lib/feedback";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";

type Wrap = { id: string; label: string; layer: number; color: string; why: string };
const WRAPS: Wrap[] = [
  { id: "tcp", label: "Encabezado TCP (puertos)", layer: 4, color: "#34c759", why: "Primero actúa la capa de transporte: agrega los puertos de origen y destino y lo convierte en segmento." },
  { id: "ip", label: "Encabezado IP (direcciones IP)", layer: 3, color: "#30b0c7", why: "Luego la capa de red agrega las IP de origen y destino: ahora es un paquete." },
  { id: "eth", label: "Encabezado Ethernet + tráiler FCS (MAC)", layer: 2, color: "#007aff", why: "La capa de enlace agrega las MAC y un tráiler (FCS) para detectar errores: ahora es una trama." },
  { id: "bits", label: "Convertir en bits (señales)", layer: 1, color: "#af52de", why: "Al final, la capa física convierte la trama en bits: pulsos eléctricos, luz u ondas." },
];
const QUIZ = [
  { q: "¿Cómo se llaman los datos en la capa de transporte?", a: "Segmento", o: ["Segmento", "Paquete", "Trama", "Bits"] },
  { q: "¿Cómo se llaman los datos en la capa de red?", a: "Paquete", o: ["Segmento", "Paquete", "Trama", "Bits"] },
  { q: "¿Cómo se llaman los datos en la capa de enlace de datos?", a: "Trama", o: ["Segmento", "Paquete", "Trama", "Bits"] },
  { q: "¿Qué encabezado lleva el número de puerto?", a: "TCP/UDP", o: ["TCP/UDP", "IP", "Ethernet", "Ninguno"] },
  { q: "¿Qué encabezado lleva la dirección MAC?", a: "Ethernet", o: ["TCP/UDP", "IP", "Ethernet", "Ninguno"] },
  { q: "¿Qué encabezado lleva la dirección IP de destino?", a: "IP", o: ["TCP/UDP", "IP", "Ethernet", "Ninguno"] },
];
const MAX = 4 + 3 + QUIZ.length;

/** Cajas anidadas: la envoltura de afuera es la última agregada. */
function Nest({ layers, highlight }: { layers: Wrap[]; highlight?: string }) {
  let inner: React.ReactNode = <div className="rounded-lg bg-warn px-4 py-3 text-center font-semibold text-white shadow-sm">✉️ Datos: &quot;Hola&quot;</div>;
  for (const w of layers) {
    inner = w.id === "bits" ? (
      <div className="rounded-xl p-2 font-mono text-[11px] text-white" style={{ background: w.color }}>
        <div className="mb-1 truncate opacity-80">0110100101001110101…</div>{inner}
      </div>
    ) : (
      <div className={clsx("animate-fade rounded-xl p-2 transition-all", highlight === w.id && "ring-4 ring-danger")} style={{ background: `color-mix(in srgb, ${w.color} 22%, transparent)`, border: `2px solid ${w.color}` }}>
        <div className="mb-1.5 text-[12px] font-bold" style={{ color: w.color }}>{w.label.split(" (")[0]}</div>
        {inner}
        {w.id === "eth" && <div className="mt-1.5 text-right text-[12px] font-bold" style={{ color: w.color }}>FCS</div>}
      </div>
    );
  }
  return <div className="mx-auto max-w-sm">{inner}</div>;
}

export default function Encapsula({ onFinish }: GameProps) {
  const [stage, setStage] = useState<"enc" | "dec" | "quiz">("enc");
  const [score, setScore] = useState(0);
  const [wrapped, setWrapped] = useState<Wrap[]>([]);
  const [missed, setMissed] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const opts = useMemo(() => shuffle(WRAPS), []);
  const quiz = useMemo(() => shuffle(QUIZ), []);
  const decOrder = useMemo(() => shuffle(["eth", "ip", "tcp"]), []);
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<string | null>(null);

  const wrap = (w: Wrap) => {
    const expected = WRAPS[wrapped.length];
    if (w.id !== expected.id) {
      setMissed(true); setErr(`Todavía no. ${expected.why.split(":")[0]}.`); void haptic("error"); return;
    }
    if (!missed) setScore((s) => s + 1);
    setMissed(false); setErr(null); setOk(w.why);
    setWrapped((x) => [...x, w]); void haptic("tap");
  };
  // Al desencapsular se ignora la capa física (los bits ya se reconstruyeron como trama).
  const toUnwrap = wrapped.filter((w) => w.id !== "bits");
  const unwrap = (id: string) => {
    const outer = toUnwrap[toUnwrap.length - 1];
    if (id !== outer.id) { setMissed(true); setErr("Primero se quita la envoltura de afuera (la última que se puso)."); void haptic("error"); return; }
    if (!missed) setScore((s) => s + 1);
    setMissed(false); setErr(null);
    setWrapped((x) => x.filter((w) => w.id !== id)); void haptic("tap");
  };
  const answer = (o: string) => {
    if (pick) return;
    setPick(o);
    if (o === quiz[qi].a) { setScore((s) => s + 1); void haptic("success"); } else void haptic("error");
  };
  const progress = stage === "enc" ? wrapped.length / 4 * 0.35 : stage === "dec" ? 0.35 + (3 - toUnwrap.length) / 3 * 0.25 : 0.6 + qi / quiz.length * 0.4;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={progress} tint="bg-accent" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
      </div>

      {stage === "enc" && (
        <>
          <h2 className="mb-1 text-[20px] font-bold">Encapsula: vas a enviar &quot;Hola&quot;</h2>
          <p className="mb-4 text-[15px] text-muted">Toca las envolturas en el orden en que se agregan, de la capa 4 a la 1.</p>
          <Nest layers={wrapped} />
          {wrapped.length < 4 ? (
            <div className="mt-5 grid gap-2">
              {opts.filter((o) => !wrapped.includes(o)).map((o) => (
                <button key={o.id} onClick={() => wrap(o)} className="pressable flex min-h-12 items-center gap-3 rounded-xl bg-surface px-4 text-left ring-1 ring-border/60">
                  <span className="size-4 shrink-0 rounded" style={{ background: o.color }} aria-hidden /> {o.label}
                </button>
              ))}
            </div>
          ) : (
            <Feedback ok title="¡Enviado por el cable!" onNext={() => { setStage("dec"); setOk(null); }} nextLabel="Ahora, recíbelo">{ok}</Feedback>
          )}
          {ok && wrapped.length < 4 && !err && <p className="mt-3 text-[15px] text-ok" role="status">✓ {ok}</p>}
        </>
      )}

      {stage === "dec" && (
        <>
          <h2 className="mb-1 text-[20px] font-bold">Desencapsula: llegó un mensaje</h2>
          <p className="mb-4 text-[15px] text-muted">La tarjeta de red ya convirtió los bits en una trama. Toca la envoltura que se quita primero.</p>
          <Nest layers={toUnwrap} />
          {toUnwrap.length > 0 ? (
            <div className="mt-5 grid gap-2">
              {decOrder.map((id) => toUnwrap.find((w) => w.id === id)).filter((w): w is Wrap => !!w).map((o) => (
                <button key={o.id} onClick={() => unwrap(o.id)} className="pressable flex min-h-12 items-center gap-3 rounded-xl bg-surface px-4 text-left ring-1 ring-border/60">
                  <span className="size-4 shrink-0 rounded" style={{ background: o.color }} aria-hidden /> Quitar {o.label.split(" (")[0].replace(" + tráiler FCS", " y FCS")}
                </button>
              ))}
            </div>
          ) : (
            <Feedback ok title="¡Mensaje entregado a la aplicación!" onNext={() => setStage("quiz")} nextLabel="Ronda final">
              Al recibir se va de abajo hacia arriba: enlace → red → transporte → aplicación. Es el camino inverso del envío.
            </Feedback>
          )}
        </>
      )}

      {stage === "quiz" && (
        <>
          <h2 className="mb-1 text-[20px] font-bold">Ronda final</h2>
          <p className="mb-4 text-[15px] text-muted">Pregunta {qi + 1} de {quiz.length}</p>
          <div className="mb-4 rounded-2xl bg-surface p-5 text-[19px] font-semibold shadow-sm">{quiz[qi].q}</div>
          <div className="grid grid-cols-2 gap-2">
            {quiz[qi].o.map((o) => (
              <button key={o} onClick={() => answer(o)} disabled={!!pick}
                className={clsx("pressable min-h-14 rounded-xl bg-surface font-semibold ring-1 ring-border/60",
                  pick && o === quiz[qi].a && "!bg-ok text-white", pick === o && o !== quiz[qi].a && "!bg-danger text-white")}>{o}</button>
            ))}
          </div>
          {pick && (
            <Feedback ok={pick === quiz[qi].a} title={pick === quiz[qi].a ? "¡Correcto!" : `Es: ${quiz[qi].a}`} nextLabel={qi + 1 >= quiz.length ? "Ver resultados" : "Siguiente"}
              onNext={() => { if (qi + 1 >= quiz.length) onFinish({ score, max: MAX, summary: "Mensaje encapsulado y entregado" }); else { setQi(qi + 1); setPick(null); } }}>
              Recuerda: Segmento (4) → Paquete (3) → Trama (2) → Bits (1).
            </Feedback>
          )}
        </>
      )}

      {err && <p className="mt-3 rounded-xl bg-danger/10 p-3 text-[15px]" role="alert">{err}</p>}
    </div>
  );
}
