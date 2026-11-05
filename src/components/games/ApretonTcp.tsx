"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Laptop, Server } from "lucide-react";
import { haptic, randInt, shuffle } from "@/lib/feedback";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";

type Side = "cliente" | "servidor";
type Step =
  | { kind: "flag"; who: Side; answer: string; phase: string; why: string }
  | { kind: "ack"; who: Side; prompt: string; answer: number; options: number[]; why: string }
  | { kind: "proto"; app: string; answer: "TCP" | "UDP"; why: string };

const FLAGS = ["SYN", "SYN, ACK", "ACK", "FIN", "RST", "Datos"];

function makeSteps(): Step[] {
  const isn = randInt(1, 40) * 100;          // número de secuencia inicial del cliente
  const bytes1 = randInt(2, 9) * 100;
  const bytes2 = randInt(2, 9) * 50;
  const seq1 = isn + 1, ack1 = seq1 + bytes1, seq2 = ack1, ack2 = seq2 + bytes2;
  const ackOpts = (a: number, seq: number, b: number) => shuffle([a, seq, a + 1, b]);
  const protos: Step[] = shuffle([
    { kind: "proto", app: "Descargar un archivo PDF", answer: "TCP", why: "Un archivo debe llegar completo y sin errores: TCP confirma cada parte." },
    { kind: "proto", app: "Videollamada en vivo", answer: "UDP", why: "En tiempo real importa la velocidad; reenviar un trozo viejo de video no sirve. UDP." },
    { kind: "proto", app: "Consulta DNS (traducir un nombre)", answer: "UDP", why: "Las consultas DNS son pequeñas y rápidas: normalmente viajan en UDP." },
    { kind: "proto", app: "Abrir una página web (HTTP)", answer: "TCP", why: "La página debe llegar completa y en orden: HTTP usa TCP." },
    { kind: "proto", app: "Enviar un correo (SMTP)", answer: "TCP", why: "El correo no puede llegar incompleto: SMTP usa TCP." },
    { kind: "proto", app: "Juego en línea (posición de jugadores)", answer: "UDP", why: "Se manda la posición muchas veces por segundo; si se pierde una, llega la siguiente. UDP." },
  ] as Step[]).slice(0, 4);

  return [
    { kind: "flag", who: "cliente", answer: "SYN", phase: "Saludo (3 pasos)", why: "El cliente pide abrir la conexión con SYN (sincronizar) y su número de secuencia inicial." },
    { kind: "flag", who: "servidor", answer: "SYN, ACK", phase: "Saludo (3 pasos)", why: "El servidor acepta (ACK) y a la vez envía su propio SYN." },
    { kind: "flag", who: "cliente", answer: "ACK", phase: "Saludo (3 pasos)", why: "El cliente confirma: ¡conexión establecida!" },
    { kind: "ack", who: "servidor", prompt: `El cliente envía ${bytes1} bytes con SEQ = ${seq1}. ¿Qué número de ACK responde el servidor?`, answer: ack1, options: ackOpts(ack1, seq1, bytes1), why: `ACK = SEQ + bytes recibidos = ${seq1} + ${bytes1} = ${ack1}. Es el siguiente byte que el servidor espera.` },
    { kind: "ack", who: "cliente", prompt: `Ahora el cliente envía ${bytes2} bytes más con SEQ = ${seq2}. ¿Qué ACK responde el servidor?`, answer: ack2, options: ackOpts(ack2, seq2, bytes2), why: `${seq2} + ${bytes2} = ${ack2}.` },
    { kind: "flag", who: "cliente", answer: "FIN", phase: "Despedida (4 pasos)", why: "El cliente terminó de enviar: manda FIN (finalizar)." },
    { kind: "flag", who: "servidor", answer: "ACK", phase: "Despedida (4 pasos)", why: "El servidor confirma que recibió el FIN." },
    { kind: "flag", who: "servidor", answer: "FIN", phase: "Despedida (4 pasos)", why: "Cuando el servidor también termina, envía su propio FIN." },
    { kind: "flag", who: "cliente", answer: "ACK", phase: "Despedida (4 pasos)", why: "El cliente confirma el FIN del servidor: conexión cerrada." },
    ...protos,
  ];
}

export default function ApretonTcp({ onFinish }: GameProps) {
  const steps = useMemo(makeSteps, []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [log, setLog] = useState<{ who: Side; text: string }[]>([]);
  const [flying, setFlying] = useState<{ who: Side; text: string; k: number } | null>(null);
  const st = steps[i];
  const MAX = steps.length;

  const answer = (val: string) => {
    if (pick) return;
    setPick(val);
    const correctVal = st.kind === "flag" ? st.answer : st.kind === "ack" ? String(st.answer) : st.answer;
    const ok = val === correctVal;
    if (ok) setScore((s) => s + 1);
    void haptic(ok ? "success" : "error");
    if (st.kind !== "proto") {
      const text = st.kind === "flag" ? st.answer : `ACK ${st.answer}`;
      const who = st.kind === "ack" ? "servidor" : st.who;
      setFlying({ who, text, k: i });
      setTimeout(() => { setLog((l) => [...l, { who, text }]); setFlying(null); }, 700);
    }
  };
  const next = () => {
    if (i + 1 >= steps.length) return onFinish({ score, max: MAX, summary: "Conexión TCP abierta y cerrada" });
    setI(i + 1); setPick(null);
  };
  const correct = st.kind === "flag" ? st.answer : st.kind === "ack" ? String(st.answer) : st.answer;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={(i + (pick ? 1 : 0)) / MAX} tint="bg-ok" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
      </div>

      {st.kind !== "proto" ? (
        <>
          <p className="text-[13px] font-semibold uppercase tracking-wide text-ok">{st.kind === "flag" ? st.phase : "Transferencia de datos"}</p>
          {/* Diagrama de secuencia */}
          <div className="relative mt-2 rounded-2xl bg-surface p-4 shadow-sm">
            <div className="flex justify-between">
              {(["cliente", "servidor"] as Side[]).map((s) => (
                <div key={s} className={clsx("flex flex-col items-center gap-1 rounded-xl px-3 py-2", (st.kind === "flag" ? st.who : "servidor") === s && !pick && "bg-ok/15")}>
                  {s === "cliente" ? <Laptop aria-hidden /> : <Server aria-hidden />}
                  <span className="text-[13px] font-semibold capitalize">{s}</span>
                </div>
              ))}
            </div>
            <ol className="mt-2 max-h-44 space-y-1 overflow-y-auto text-[13px]">
              {log.map((l, k) => (
                <li key={k} className={clsx("flex items-center gap-2 font-mono", l.who === "servidor" && "flex-row-reverse")}>
                  <span className="rounded-md bg-fill px-2 py-0.5 font-semibold">{l.text}</span>
                  <span className="h-px flex-1 bg-border" aria-hidden /><span aria-hidden>{l.who === "cliente" ? "→" : "←"}</span>
                </li>
              ))}
            </ol>
            {flying && (
              <span className="absolute top-1/2 rounded-full bg-ok px-3 py-1 font-mono text-[13px] font-bold text-white shadow"
                style={{ left: flying.who === "cliente" ? "15%" : "60%", animation: `${flying.who === "cliente" ? "fly-r" : "fly-l"} 650ms ease-in-out forwards` }}>
                {flying.text}
              </span>
            )}
          </div>
          <p className="my-4 text-[19px] font-semibold">
            {st.kind === "flag" ? <>Turno del <b className="capitalize text-ok">{st.who}</b>: ¿qué segmento envía?</> : st.prompt}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(st.kind === "flag" ? FLAGS : st.options.map(String)).map((o) => (
              <button key={o} onClick={() => answer(o)} disabled={!!pick}
                className={clsx("pressable min-h-14 rounded-xl bg-surface font-mono text-[17px] font-bold ring-1 ring-border/60",
                  pick && o === correct && "!bg-ok text-white", pick === o && o !== correct && "!bg-danger text-white")}>{o}</button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-[13px] font-semibold uppercase tracking-wide text-ok">Ronda final · ¿TCP o UDP?</p>
          <div className="my-4 rounded-2xl bg-surface p-6 text-center text-[22px] font-bold shadow-sm">{st.app}</div>
          <div className="grid grid-cols-2 gap-2">
            {["TCP", "UDP"].map((o) => (
              <button key={o} onClick={() => answer(o)} disabled={!!pick}
                className={clsx("pressable min-h-16 rounded-xl bg-surface text-[22px] font-bold ring-1 ring-border/60",
                  pick && o === correct && "!bg-ok text-white", pick === o && o !== correct && "!bg-danger text-white")}>{o}</button>
            ))}
          </div>
        </>
      )}

      {pick && <Feedback ok={pick === correct} title={pick === correct ? "¡Correcto!" : `Era: ${correct}`} onNext={next} nextLabel={i + 1 >= steps.length ? "Ver resultados" : "Siguiente"}>{st.why}</Feedback>}
      <style>{`@keyframes fly-r { from { left: 12%; } to { left: 62%; } } @keyframes fly-l { from { left: 62%; } to { left: 12%; } }`}</style>
    </div>
  );
}
