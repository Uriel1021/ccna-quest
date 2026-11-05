"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/apple";
import { haptic, shuffle } from "@/lib/feedback";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";

type Layer = { n: number; name: string; desc: string; color: string };

/* Colores de sistema de Apple, uno por piso. */
const LAYERS: Layer[] = [
  { n: 7, name: "Aplicación", desc: "Lo que tú usas: web, correo, apps", color: "#ff3b30" },
  { n: 6, name: "Presentación", desc: "Traduce, cifra y comprime los datos", color: "#ff9500" },
  { n: 5, name: "Sesión", desc: "Inicia, mantiene y cierra la conversación", color: "#ffcc00" },
  { n: 4, name: "Transporte", desc: "Divide en segmentos; puertos, TCP y UDP", color: "#34c759" },
  { n: 3, name: "Red", desc: "Direcciones IP y elegir la ruta", color: "#30b0c7" },
  { n: 2, name: "Enlace de datos", desc: "Tramas y direcciones MAC en la red local", color: "#007aff" },
  { n: 1, name: "Física", desc: "Bits viajando por cable, luz u ondas", color: "#af52de" },
];
const byN = (n: number) => LAYERS.find((l) => l.n === n)!;

type Item = { text: string; layer: number; why: string };
const ITEMS: Item[] = [
  { text: "HTTP (páginas web)", layer: 7, why: "HTTP es el protocolo que usa tu navegador para pedir páginas: trabaja junto a la aplicación." },
  { text: "DNS (traduce nombres a IP)", layer: 7, why: "DNS es un servicio que usan las aplicaciones para convertir \"google.com\" en una dirección IP." },
  { text: "Correo con SMTP", layer: 7, why: "SMTP es el protocolo de las aplicaciones de correo para enviar mensajes." },
  { text: "Cifrar y comprimir datos", layer: 6, why: "La capa de presentación se encarga del formato: cifrado, compresión y codificación." },
  { text: "Formato de imagen JPEG", layer: 6, why: "Decidir cómo se representan los datos (JPEG, ASCII) es trabajo de presentación." },
  { text: "Abrir y cerrar un diálogo entre dos apps", layer: 5, why: "La capa de sesión inicia, mantiene y termina las conversaciones." },
  { text: "TCP (entrega confiable)", layer: 4, why: "TCP garantiza que los datos lleguen completos y en orden: es transporte." },
  { text: "UDP (entrega rápida)", layer: 4, why: "UDP también es de transporte, pero no confirma la entrega: prioriza la velocidad." },
  { text: "Número de puerto (ej. 443)", layer: 4, why: "Los puertos identifican a qué aplicación va cada segmento: capa de transporte." },
  { text: "Segmento", layer: 4, why: "\"Segmento\" es el nombre de los datos en la capa de transporte." },
  { text: "Dirección IP", layer: 3, why: "La IP identifica a un equipo entre redes distintas: es la capa de red." },
  { text: "Router", layer: 3, why: "El router lee la IP de destino para decidir la ruta: trabaja en la capa de red." },
  { text: "Paquete", layer: 3, why: "\"Paquete\" es el nombre de los datos en la capa de red." },
  { text: "Ping (ICMP)", layer: 3, why: "ICMP viaja dentro de IP para diagnosticar la red: capa de red." },
  { text: "Dirección MAC", layer: 2, why: "La MAC identifica a la tarjeta de red dentro de la red local: enlace de datos." },
  { text: "Switch", layer: 2, why: "El switch reenvía tramas según la dirección MAC: capa de enlace de datos." },
  { text: "Trama", layer: 2, why: "\"Trama\" es el nombre de los datos en la capa de enlace." },
  { text: "Cable UTP", layer: 1, why: "El cable es el medio físico por donde viajan los bits." },
  { text: "Fibra óptica", layer: 1, why: "La fibra transporta bits como pulsos de luz: capa física." },
  { text: "Ondas de Wi-Fi", layer: 1, why: "Las ondas de radio son el medio físico de las redes inalámbricas." },
];
const ROUND2 = 8;
const MAX = 7 + ROUND2;

export default function TorreOsi({ onFinish }: GameProps) {
  const [round, setRound] = useState<1 | 2>(1);
  const [score, setScore] = useState(0);

  /* Ronda 1: armar la torre (índice 0 = piso de arriba = capa 7) */
  const [pool, setPool] = useState<number[]>(() => shuffle(LAYERS.map((l) => l.n)));
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(7).fill(null));
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [firstCheck, setFirstCheck] = useState(true);
  const [solved, setSolved] = useState(false);

  /* Ronda 2: clasificar */
  const items = useMemo(() => shuffle(ITEMS).slice(0, ROUND2), []);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);

  const place = (n: number) => {
    const i = slots.indexOf(null);
    if (i < 0) return;
    void haptic("tap");
    setSlots((s) => s.map((v, k) => (k === i ? n : v)));
    setPool((p) => p.filter((x) => x !== n));
    setWrong(new Set());
  };
  const unplace = (i: number) => {
    const n = slots[i];
    if (n == null || solved || wrong.size > 0) return; // espera a que regresen las piezas incorrectas
    setSlots((s) => s.map((v, k) => (k === i ? null : v)));
    setPool((p) => [...p, n]);
    setWrong(new Set());
  };
  const check = () => {
    const bad = new Set(slots.map((n, i) => (n === 7 - i ? -1 : i)).filter((i) => i >= 0));
    if (firstCheck) { setScore((s) => s + (7 - bad.size)); setFirstCheck(false); }
    if (bad.size === 0) { setSolved(true); void haptic("success"); return; }
    void haptic("error");
    setWrong(bad);
    // Las capas mal colocadas regresan solas para reintentar.
    setTimeout(() => {
      setSlots((s) => s.map((v, i) => (bad.has(i) ? null : v)));
      setPool((p) => [...p, ...[...bad].map((i) => slots[i]!)]);
      setWrong(new Set());
    }, 1100);
  };

  const choose = (layer: number) => {
    if (answer != null) return;
    setAnswer(layer);
    const ok = layer === items[idx].layer;
    if (ok) setScore((s) => s + 1);
    void haptic(ok ? "success" : "error");
  };
  const next = () => {
    if (idx + 1 >= items.length) {
      onFinish({ score, max: MAX, summary: "Torre OSI completada" });
      return;
    }
    setIdx((i) => i + 1);
    setAnswer(null);
  };

  const progress = round === 1 ? slots.filter((s) => s != null).length / 14 : 0.5 + (idx + (answer != null ? 1 : 0)) / (ROUND2 * 2);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={progress} tint="bg-warn" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
      </div>

      {round === 1 ? (
        <>
          <h2 className="mb-1 text-[20px] font-bold">Ronda 1 · Arma la torre</h2>
          <p className="mb-4 text-[15px] text-muted">Toca las capas en orden: la 7 va arriba y la 1 hasta abajo, pegada al cable.</p>

          <ol className="mb-5 space-y-1.5" aria-label="Torre OSI, de la capa 7 a la 1">
            {slots.map((n, i) => {
              const layerNo = 7 - i;
              const l = n != null ? byN(n) : null;
              return (
                <li key={i}>
                  <button
                    onClick={() => unplace(i)}
                    disabled={n == null || solved}
                    aria-label={l ? `Piso ${layerNo}: ${l.name}. Toca para quitar.` : `Piso ${layerNo} vacío`}
                    className={clsx(
                      "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-all",
                      l ? "text-white shadow-sm" : "border-2 border-dashed border-border bg-surface/60 text-muted",
                      wrong.has(i) && "animate-pulse ring-4 ring-danger",
                      solved && "ring-2 ring-ok",
                    )}
                    style={l ? { background: l.color } : undefined}
                  >
                    <span className={clsx("grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold", l ? "bg-white/25" : "bg-fill")}>{layerNo}</span>
                    {l ? (
                      <span className="min-w-0"><span className="block font-semibold">{l.name}</span><span className="block truncate text-[13px] opacity-90">{l.desc}</span></span>
                    ) : <span className="text-[15px]">Piso {layerNo}</span>}
                  </button>
                </li>
              );
            })}
          </ol>

          {!solved && pool.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2" aria-label="Capas disponibles">
              {pool.map((n) => {
                const l = byN(n);
                return (
                  <button key={n} onClick={() => place(n)} className="pressable rounded-full bg-surface px-4 py-2.5 text-left shadow-sm ring-1 ring-border/60">
                    <span className="mr-2 inline-block size-2.5 rounded-full align-middle" style={{ background: l.color }} aria-hidden />
                    <span className="font-medium">{l.name}</span>
                    <span className="block text-[12px] text-muted">{l.desc}</span>
                  </button>
                );
              })}
            </div>
          )}

          {solved ? (
            <Feedback ok title="¡Torre completa!" onNext={() => setRound(2)} nextLabel="Ir a la ronda 2">
              Truco para recordarla de abajo hacia arriba: <b>F</b>ísica, <b>E</b>nlace, <b>R</b>ed, <b>T</b>ransporte, <b>S</b>esión, <b>P</b>resentación, <b>A</b>plicación.
            </Feedback>
          ) : (
            <Button onClick={check} disabled={pool.length > 0 || wrong.size > 0} className="w-full">Comprobar</Button>
          )}
        </>
      ) : (
        <>
          <h2 className="mb-1 text-[20px] font-bold">Ronda 2 · ¿En qué piso trabaja?</h2>
          <p className="mb-4 text-[15px] text-muted">Pieza {idx + 1} de {ROUND2}</p>
          <div className="mb-5 rounded-2xl bg-surface p-6 text-center shadow-sm">
            <p className="font-display text-[26px] font-bold tracking-tight">{items[idx].text}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LAYERS.map((l) => {
              const isCorrect = answer != null && l.n === items[idx].layer;
              const isWrongPick = answer === l.n && !isCorrect;
              return (
                <button
                  key={l.n}
                  onClick={() => choose(l.n)}
                  disabled={answer != null}
                  className={clsx(
                    "pressable flex min-h-12 items-center gap-3 rounded-xl bg-surface px-3 text-left ring-1 ring-border/60",
                    isCorrect && "!bg-ok text-white ring-0",
                    isWrongPick && "!bg-danger text-white ring-0",
                    answer != null && !isCorrect && !isWrongPick && "opacity-50",
                  )}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: l.color }}>{l.n}</span>
                  <span className="font-medium">{l.name}</span>
                </button>
              );
            })}
          </div>
          {answer != null && (
            <Feedback ok={answer === items[idx].layer} onNext={next} nextLabel={idx + 1 >= ROUND2 ? "Ver resultados" : "Siguiente"}>
              {answer !== items[idx].layer && <>Va en la capa <b>{items[idx].layer} · {byN(items[idx].layer).name}</b>. </>}
              {items[idx].why}
            </Feedback>
          )}
        </>
      )}
    </div>
  );
}
