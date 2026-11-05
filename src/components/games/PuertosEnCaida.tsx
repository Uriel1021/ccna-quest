"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { haptic, pick, shuffle } from "@/lib/feedback";
import { ProgressBar, type GameProps } from "./GameFrame";
import { Lives } from "./TimerBar";

type Svc = { name: string; what: string; port: number };
const SERVICES: Svc[] = [
  { name: "HTTP", what: "páginas web", port: 80 },
  { name: "HTTPS", what: "web segura", port: 443 },
  { name: "DNS", what: "nombres → IP", port: 53 },
  { name: "SSH", what: "acceso remoto seguro", port: 22 },
  { name: "Telnet", what: "acceso remoto sin cifrar", port: 23 },
  { name: "SMTP", what: "enviar correo", port: 25 },
  { name: "POP3", what: "descargar correo", port: 110 },
  { name: "IMAP", what: "leer correo en el servidor", port: 143 },
  { name: "FTP", what: "archivos (control)", port: 21 },
  { name: "DHCP", what: "servidor que reparte IPs", port: 67 },
  { name: "TFTP", what: "archivos simples", port: 69 },
  { name: "SNMP", what: "monitoreo de red", port: 161 },
];
const ALL_PORTS = [...new Set(SERVICES.map((s) => s.port))];
const GOAL = 20;

type Drop = { id: number; svc: Svc; options: number[]; duration: number };

function makeDrop(id: number, caught: number, prev?: Svc): Drop {
  let svc = pick(SERVICES);
  while (prev && svc.name === prev.name) svc = pick(SERVICES);
  const others = shuffle(ALL_PORTS.filter((p) => p !== svc.port)).slice(0, 3);
  // Empieza en 6 s y acelera hasta 2.6 s.
  const duration = Math.max(2.6, 6 - caught * 0.18);
  return { id, svc, options: shuffle([svc.port, ...others]), duration };
}

export default function PuertosEnCaida({ onFinish }: GameProps) {
  const [drop, setDrop] = useState(() => makeDrop(0, 0));
  const [caught, setCaught] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [over, setOver] = useState(false);
  const fallRef = useRef<HTMLDivElement>(null);
  const missRef = useRef<(t: string) => void>(() => {});

  const end = (c: number) => { setOver(true); onFinish({ score: c, max: GOAL, summary: `${c} servicios atrapados` }); };

  const next = (c: number, l: number) => {
    if (l <= 0 || c >= GOAL) return end(c);
    setDrop((d) => makeDrop(d.id + 1, c, d.svc));
  };

  const hit = (port: number) => {
    if (over || flash) return;
    if (port === drop.svc.port) {
      const c = caught + 1;
      setCaught(c); setCombo((x) => x + 1);
      setFlash({ ok: true, text: `${drop.svc.name} → ${drop.svc.port}` });
      void haptic("success");
      setTimeout(() => { setFlash(null); next(c, lives); }, 380);
    } else miss(`${drop.svc.name} usa el puerto ${drop.svc.port}`);
  };

  const miss = (text: string) => {
    const l = lives - 1;
    setLives(l); setCombo(0);
    setFlash({ ok: false, text });
    void haptic("error");
    setTimeout(() => { setFlash(null); next(caught, l); }, 1100);
  };

  useEffect(() => { missRef.current = miss; });

  /* Caída con requestAnimationFrame (no depende de las animaciones CSS, que se
     desactivan con "reducir movimiento" y harían el juego imposible). */
  useEffect(() => {
    if (flash || over) return;
    const el = fallRef.current;
    if (!el) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (drop.duration * 1000));
      el.style.top = `calc(${p} * (100% - 92px))`;
      if (p >= 1) missRef.current(`¡Se cayó! ${drop.svc.name} usa el puerto ${drop.svc.port}`);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drop, flash, over]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={caught / GOAL} tint="bg-warn" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{caught}/{GOAL}</span>
        <Lives n={lives} />
      </div>

      <div className="relative h-[46vh] min-h-72 overflow-hidden rounded-2xl bg-gradient-to-b from-indigo/15 to-surface shadow-inner">
        {combo >= 3 && <span className="absolute right-3 top-3 z-10 rounded-full bg-warn px-3 py-1 text-[13px] font-bold text-white">🔥 x{combo}</span>}
        {!flash && !over && (
          <div
            key={drop.id}
            ref={fallRef}
            className="absolute left-1/2 top-0 w-48 -translate-x-1/2 rounded-2xl bg-surface p-3 text-center shadow-lg ring-2 ring-warn"
          >
            <div className="font-display text-[26px] font-bold leading-tight">{drop.svc.name}</div>
            <div className="text-[13px] text-muted">{drop.svc.what}</div>
          </div>
        )}
        {flash && (
          <div className={clsx("animate-fade absolute inset-x-4 top-1/3 rounded-2xl p-4 text-center text-[19px] font-bold text-white shadow-lg", flash.ok ? "bg-ok" : "bg-danger")} role="status">
            {flash.ok ? "✓ " : "✗ "}{flash.text}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-2 bg-danger/60" aria-hidden />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2" aria-label="Puertos">
        {drop.options.map((p) => (
          <button key={`${drop.id}-${p}`} onClick={() => hit(p)} disabled={!!flash || over}
            className="pressable min-h-16 rounded-2xl bg-surface font-mono text-[24px] font-bold shadow-sm ring-1 ring-border/60 disabled:opacity-50">{p}</button>
        ))}
      </div>
    </div>
  );
}
