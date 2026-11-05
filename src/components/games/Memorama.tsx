"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { haptic, shuffle } from "@/lib/feedback";
import type { GameProps } from "./GameFrame";

const PAIRS: [string, string][] = [
  ["DNS", "Traduce nombres (google.com) a direcciones IP"],
  ["DHCP", "Reparte direcciones IP automáticamente"],
  ["HTTP", "Transporta páginas web"],
  ["SMTP", "Envía correos"],
  ["POP3", "Descarga el correo y lo borra del servidor"],
  ["IMAP", "Lee el correo dejándolo en el servidor"],
  ["FTP", "Transfiere archivos (puertos 20 y 21)"],
  ["SMB", "Comparte archivos e impresoras en Windows"],
  ["Telnet", "Acceso remoto SIN cifrar"],
  ["SSH", "Acceso remoto cifrado"],
];
const N = 6;
type Card = { id: number; pair: number; text: string; kind: "proto" | "desc" };

export default function Memorama({ onFinish }: GameProps) {
  const cards = useMemo<Card[]>(() => {
    const chosen = shuffle(PAIRS).slice(0, N);
    return shuffle(chosen.flatMap(([p, d], i) => [
      { id: i * 2, pair: i, text: p, kind: "proto" as const },
      { id: i * 2 + 1, pair: i, text: d, kind: "desc" as const },
    ]));
  }, []);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [tries, setTries] = useState(0);
  const [lastMatch, setLastMatch] = useState<string | null>(null);

  const flip = (c: Card) => {
    if (open.length === 2 || open.includes(c.id) || matched.has(c.pair)) return;
    void haptic("tap");
    const now = [...open, c.id];
    setOpen(now);
    if (now.length < 2) return;
    const t = tries + 1;
    setTries(t);
    const [a, b] = now.map((id) => cards.find((x) => x.id === id)!);
    if (a.pair === b.pair) {
      const m = new Set(matched); m.add(a.pair);
      setTimeout(() => {
        setMatched(m); setOpen([]); void haptic("success");
        const proto = a.kind === "proto" ? a : b, desc = a.kind === "proto" ? b : a;
        setLastMatch(`${proto.text}: ${desc.text}`);
        if (m.size === N) {
          // 12 puntos con el mínimo de intentos (6); se resta 1 por cada intento extra.
          const score = Math.max(0, 12 - (t - N));
          setTimeout(() => onFinish({ score, max: 12, summary: `${N} parejas en ${t} intentos` }), 700);
        }
      }, 450);
    } else {
      setTimeout(() => { setOpen([]); void haptic("error"); }, 1000);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[15px]">
        <span className="font-semibold">Parejas: {matched.size}/{N}</span>
        <span className="text-muted">Intentos: <b className="text-fg tabular-nums">{tries}</b></span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" style={{ perspective: "900px" }}>
        {cards.map((c) => {
          const up = open.includes(c.id) || matched.has(c.pair);
          return (
            <button key={c.id} onClick={() => flip(c)} aria-label={up ? c.text : "Carta boca abajo"} aria-pressed={up}
              className="relative aspect-[5/6] w-full" style={{ transformStyle: "preserve-3d", transition: "transform 450ms cubic-bezier(0.32,0.72,0,1)", transform: up ? "rotateY(180deg)" : "none" }}>
              <span className="absolute inset-0 grid place-items-center rounded-2xl bg-gradient-to-br from-accent to-indigo text-[28px] text-white shadow-sm" style={{ backfaceVisibility: "hidden" }} aria-hidden>?</span>
              <span className={clsx("absolute inset-0 grid place-items-center rounded-2xl p-2 text-center shadow-sm ring-1",
                matched.has(c.pair) ? "bg-ok/15 ring-ok" : "bg-surface ring-border/60",
                c.kind === "proto" ? "font-mono text-[20px] font-bold" : "text-[12px] font-medium leading-snug sm:text-[13px]")}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                {c.text}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 min-h-12 rounded-xl bg-fill p-3 text-[15px]" role="status" aria-live="polite">
        {lastMatch ? <>✓ <b>{lastMatch}</b></> : "Busca un protocolo y la tarjeta que dice qué hace."}
      </p>
    </div>
  );
}
