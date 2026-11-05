"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Monitor, Server, Mail } from "lucide-react";
import { Group, Row } from "@/components/ui/apple";
import { haptic } from "@/lib/feedback";
import { parseCidr } from "@/lib/net/ip";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";
import { LEVELS, correctHop, interfacesOf, totalHops, type Level, type RNode } from "./route-levels";

const MAX = LEVELS.reduce((s, l) => s + totalHops(l), 0);

type Msg = { ok: boolean; text: React.ReactNode } | null;

function Topology({ level, at, highlight }: { level: Level; at: string; highlight?: string }) {
  const node = (id: string) => level.nodes.find((n) => n.id === id)!;
  const pos = node(at);
  return (
    <svg viewBox="0 0 410 300" className="w-full" role="img" aria-label={`Mapa de la red. El paquete está en ${pos.label}.`}>
      {level.links.map((l, i) => {
        const a = node(l.a), b = node(l.b);
        // Etiqueta de interfaz a 44 px del centro del router, sobre el cable.
        const lab = (from: RNode, to: RNode, name?: string) => {
          if (!name) return null;
          const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
          return <text x={from.x + (dx / len) * 44} y={from.y + (dy / len) * 44 - 6} textAnchor="middle" className="fill-muted text-[10px] font-semibold">{name}</text>;
        };
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeWidth={3} strokeLinecap="round" />
            {lab(a, b, l.ifA)}{lab(b, a, l.ifB)}
          </g>
        );
      })}
      {level.nodes.map((n) => {
        const current = n.id === at;
        const target = n.id === highlight;
        return (
          <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
            {n.kind === "router" ? (
              <>
                <circle r={22} fill={current ? "var(--brand)" : "var(--surface)"} stroke={current ? "var(--brand)" : "var(--border)"} strokeWidth={2} />
                <text textAnchor="middle" dy="0.35em" className={clsx("text-[13px] font-bold", current ? "fill-white" : "fill-[var(--fg)]")}>{n.label}</text>
                {current && <circle r={28} fill="none" stroke="var(--brand)" strokeOpacity={0.35} strokeWidth={4}><animate attributeName="r" values="24;31;24" dur="1.6s" repeatCount="indefinite" /></circle>}
              </>
            ) : (
              <>
                <rect x={-26} y={-18} width={52} height={36} rx={9} fill={target ? "color-mix(in srgb, var(--ok) 18%, var(--surface))" : "var(--surface)"} stroke={target ? "var(--ok)" : "var(--border)"} strokeWidth={2} />
                <foreignObject x={-10} y={-11} width={20} height={20}>
                  {n.kind === "pc" ? <Monitor size={20} color="var(--muted)" /> : <Server size={20} color="var(--muted)" />}
                </foreignObject>
                <text y={32} textAnchor="middle" className="fill-[var(--fg)] text-[11px] font-semibold">{n.label}</text>
                <text y={44} textAnchor="middle" className="fill-muted font-mono text-[9px]">{n.ip}</text>
              </>
            )}
          </g>
        );
      })}
      {/* El paquete (sobre en movimiento) */}
      <g style={{ transform: `translate(${pos.x}px, ${pos.y - 34}px)`, transition: "transform 600ms cubic-bezier(0.32,0.72,0,1)" }}>
        <circle r={12} fill="var(--warn)" />
        <foreignObject x={-7} y={-7} width={14} height={14}><Mail size={14} color="white" /></foreignObject>
      </g>
    </svg>
  );
}

export default function RutaDelPaquete({ onFinish }: GameProps) {
  const [lv, setLv] = useState(0);
  const [pi, setPi] = useState(0);
  const level = LEVELS[lv];
  const packet = level.packets[pi];
  const [at, setAt] = useState(packet.start);
  const [score, setScore] = useState(0);
  const [missedHere, setMissedHere] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [delivered, setDelivered] = useState(false);
  const [hopsDone, setHopsDone] = useState(0);

  const dstNode = level.nodes.find((n) => n.id === packet.to)!;
  const atNode = level.nodes.find((n) => n.id === at)!;
  const ifaces = useMemo(() => (atNode.kind === "router" ? interfacesOf(level, at) : []), [level, at, atNode.kind]);
  const table = level.tables[at] ?? [];

  const choose = (iface: string) => {
    if (delivered || msg?.ok === false) return;
    const hop = correctHop(level, at, packet.dst)!;
    const nb = (id: string) => level.nodes.find((n) => n.id === id)!.label;
    if (iface !== hop.iface) {
      setMissedHere(true);
      void haptic("error");
      const p = parseCidr(hop.route.net).prefix;
      setMsg({
        ok: false,
        text: hop.route.kind === "por defecto"
          ? <>Ninguna red de la tabla contiene a <b className="font-mono">{packet.dst}</b>, así que se usa la <b>ruta por defecto</b> (0.0.0.0/0) → <b>{hop.iface}</b> hacia {nb(hop.neighbor)}.</>
          : <><b className="font-mono">{packet.dst}</b> está dentro de <b className="font-mono">{hop.route.net}</b>{p > 8 && table.some((r) => r.net !== hop.route.net && r.kind !== "por defecto" && parseCidr(r.net).prefix < p) ? <> (es más específica que otras rutas que también coinciden)</> : null}, que sale por <b>{hop.iface}</b> hacia {nb(hop.neighbor)}.</>,
      });
      return;
    }
    if (!missedHere) setScore((s) => s + 1);
    setMissedHere(false);
    setMsg(null);
    setHopsDone((h) => h + 1);
    void haptic("tap");
    setAt(hop.neighbor);
    if (hop.neighbor === packet.to) {
      setDelivered(true);
      void haptic("success");
    }
  };

  const nextPacket = () => {
    setDelivered(false);
    setMissedHere(false);
    if (pi + 1 < level.packets.length) {
      setPi(pi + 1);
      setAt(level.packets[pi + 1].start);
    } else if (lv + 1 < LEVELS.length) {
      setLv(lv + 1);
      setPi(0);
      setAt(LEVELS[lv + 1].packets[0].start);
    } else {
      onFinish({ score, max: MAX, level: LEVELS.length, summary: "Todos los paquetes entregados" });
    }
  };

  const isLast = lv === LEVELS.length - 1 && pi === level.packets.length - 1;

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={hopsDone / MAX} tint="bg-pink" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
      </div>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-pink">{level.name} · Paquete {pi + 1} de {level.packets.length}</p>
      {pi === 0 && at === packet.start && !msg && <p className="mt-1 text-[15px] text-muted">{level.intro}</p>}

      <div className="mt-3 rounded-2xl bg-surface p-2 shadow-sm">
        <Topology level={level} at={at} highlight={packet.to} />
      </div>

      <div className="my-4 flex items-center gap-3 rounded-2xl bg-warn/12 px-4 py-3">
        <Mail className="shrink-0 text-warn" aria-hidden />
        <p className="text-[15px]">Paquete para <b className="font-mono">{packet.dst}</b> ({dstNode.label})</p>
      </div>

      {delivered ? (
        <Feedback ok title={`¡Entregado a ${dstNode.label}!`} onNext={nextPacket} nextLabel={isLast ? "Ver resultados" : pi + 1 < level.packets.length ? "Siguiente paquete" : "Siguiente nivel"}>
          El paquete llegó porque cada router eligió la ruta más específica de su tabla.
        </Feedback>
      ) : (
        <>
          <Group header={`Tabla de routing de ${atNode.label}`} footer="La IP de destino se compara con cada red; gana la coincidencia con el prefijo más grande.">
            {table.map((r) => (
              <Row
                key={r.net}
                leading={<span className={clsx("grid w-9 shrink-0 place-items-center rounded-md py-0.5 text-[11px] font-bold", r.kind === "conectada" ? "bg-ok/15 text-ok" : r.kind === "por defecto" ? "bg-fill text-muted" : "bg-brand/12 text-brand")}>{r.kind === "conectada" ? "C" : r.kind === "por defecto" ? "S*" : "S"}</span>}
                title={<span className="font-mono">{r.net}</span>}
                subtitle={r.kind}
                trailing={<span className="font-mono font-semibold text-fg">{r.iface}</span>}
              />
            ))}
          </Group>

          <p className="mb-2 text-[15px] font-semibold">¿Por qué interfaz sale?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ifaces.map(({ iface, neighbor }) => (
              <button key={iface} onClick={() => choose(iface)} disabled={msg?.ok === false} className="pressable min-h-14 rounded-xl bg-surface px-3 text-left ring-1 ring-border/60 disabled:opacity-50">
                <span className="block font-mono text-[17px] font-bold">{iface}</span>
                <span className="block text-[13px] text-muted">hacia {level.nodes.find((n) => n.id === neighbor)!.label}</span>
              </button>
            ))}
          </div>
          {msg && !msg.ok && <Feedback ok={false} title="Esa no es" onNext={() => setMsg(null)} nextLabel="Intentar de nuevo">{msg.text}</Feedback>}
        </>
      )}
    </div>
  );
}
