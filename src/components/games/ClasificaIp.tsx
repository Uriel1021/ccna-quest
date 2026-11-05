"use client";
import { useState } from "react";
import clsx from "clsx";
import { Flame } from "lucide-react";
import { haptic, pick, randInt } from "@/lib/feedback";
import type { GameProps } from "./GameFrame";
import { TimerBar } from "./TimerBar";
import { useCountdown } from "./useCountdown";

type Cat = "Privada" | "Pública" | "Loopback" | "APIPA" | "Multicast";
const CATS: { c: Cat; hint: string; color: string }[] = [
  { c: "Privada", hint: "10 · 172.16–31 · 192.168", color: "bg-brand" },
  { c: "Pública", hint: "Enrutables en Internet", color: "bg-ok" },
  { c: "Loopback", hint: "127.x.x.x", color: "bg-warn" },
  { c: "APIPA", hint: "169.254.x.x", color: "bg-pink" },
  { c: "Multicast", hint: "224 – 239", color: "bg-accent" },
];
const WHY: Record<Cat, string> = {
  Privada: "Es privada: 10.0.0.0/8, 172.16.0.0/12 (172.16 a 172.31) o 192.168.0.0/16.",
  Pública: "Es pública: no cae en ningún rango especial, así que se usa en Internet.",
  Loopback: "Empieza con 127: es loopback, el equipo hablándose a sí mismo.",
  APIPA: "169.254.x.x es APIPA (enlace local): el equipo no consiguió IP por DHCP.",
  Multicast: "Primer octeto entre 224 y 239: es multicast (un mensaje a un grupo).",
};
const DURATION = 60;
const TARGET = 20;

const o = () => randInt(0, 255);
const h = () => randInt(1, 254);
function makeIp(): { ip: string; cat: Cat } {
  const cat = pick<Cat>(["Privada", "Privada", "Pública", "Pública", "Loopback", "APIPA", "Multicast"]);
  switch (cat) {
    case "Privada": return { cat, ip: pick([`10.${o()}.${o()}.${h()}`, `172.${randInt(16, 31)}.${o()}.${h()}`, `192.168.${o()}.${h()}`]) };
    case "Loopback": return { cat, ip: `127.${pick([0, 0, o()])}.${pick([0, o()])}.${pick([1, h()])}` };
    case "APIPA": return { cat, ip: `169.254.${randInt(1, 254)}.${h()}` };
    case "Multicast": return { cat, ip: `${randInt(224, 239)}.${o()}.${o()}.${h()}` };
    default: {
      // Públicas "tramposas" que se parecen a las privadas.
      const tricky = [`172.${pick([15, 32, 33, 40])}.${o()}.${h()}`, `192.169.${o()}.${h()}`, `11.${o()}.${o()}.${h()}`, `169.253.${o()}.${h()}`];
      const normal = `${pick([8, 23, 45, 52, 64, 91, 104, 142, 151, 186, 200, 201])}.${o()}.${o()}.${h()}`;
      return { cat, ip: Math.random() < 0.4 ? pick(tricky) : normal };
    }
  }
}

export default function ClasificaIp({ onFinish }: GameProps) {
  const [q, setQ] = useState(makeIp);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const { left, penalize } = useCountdown(DURATION, () => onFinish({ score, max: TARGET, summary: `${score} direcciones clasificadas en 60 s` }));

  const choose = (c: Cat) => {
    if (flash) return;
    if (c === q.cat) {
      setScore((s) => s + 1); setStreak((s) => s + 1);
      setFlash({ ok: true, text: "¡Bien!" }); void haptic("success");
      setTimeout(() => { setFlash(null); setQ(makeIp()); }, 260);
    } else {
      setStreak(0); penalize(3);
      setFlash({ ok: false, text: WHY[q.cat] }); void haptic("error");
      setTimeout(() => { setFlash(null); setQ(makeIp()); }, 1500);
    }
  };

  return (
    <div>
      <TimerBar left={left} total={DURATION} />
      <div className="my-3 flex items-center justify-between text-[15px]">
        <span className="font-semibold">{score} correctas</span>
        {streak >= 3 && <span className="flex items-center gap-1 font-semibold text-warn"><Flame size={16} aria-hidden /> Racha de {streak}</span>}
      </div>
      <div className={clsx("rounded-2xl p-6 text-center shadow-sm transition-colors", flash ? (flash.ok ? "bg-ok/15" : "bg-danger/12") : "bg-surface")}>
        <p className="text-[15px] text-muted">¿Qué tipo de dirección es?</p>
        <p className="mt-1 font-mono text-[34px] font-bold tracking-tight sm:text-[42px]">{q.ip}</p>
        <p className="mt-2 min-h-10 text-[15px]" role="status" aria-live="polite">{flash && !flash.ok ? flash.text : ""}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CATS.map(({ c, hint, color }) => (
          <button key={c} onClick={() => choose(c)} disabled={!!flash}
            className="pressable flex min-h-16 flex-col items-start justify-center rounded-2xl bg-surface px-4 text-left ring-1 ring-border/60 disabled:opacity-60">
            <span className="flex items-center gap-2 text-[17px] font-bold"><span className={clsx("size-2.5 rounded-full", color)} aria-hidden />{c}</span>
            <span className="text-[12px] text-muted">{hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
