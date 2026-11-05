/** Generadores de figuras a partir de datos (topologías, secuencias, encabezados, capas, tablas…). */
import { Arrow, Box, C, Device, Head, Svg, T, tint, type Hue, type Kind } from "./kit";

/* ───────────── Topología de red ───────────── */
export type NetNode = { id: string; k: Kind; x: number; y: number; l?: string; s?: string; hl?: boolean };
export type NetEdge = { a: string; b: string; t?: "wire" | "wifi" | "serial" | "fiber" | "broken"; l?: string; hl?: Hue; la?: string; lb?: string };
export type NetArea = { x: number; y: number; w: number; h: number; l: string; c?: Hue };
export type NetFlow = { path: string[]; c?: Hue; l?: string; dy?: number };
export type NetNote = { x: number; y: number; t: string; c?: Hue; s?: number; w?: number; a?: "start" | "middle" | "end"; mono?: boolean };

export function Net({ w = 400, h, nodes, edges = [], areas = [], flows = [], notes = [] }: {
  w?: number; h: number; nodes: NetNode[]; edges?: NetEdge[]; areas?: NetArea[]; flows?: NetFlow[]; notes?: NetNote[];
}) {
  const N = (id: string) => nodes.find((n) => n.id === id)!;
  return (
    <Svg w={w} h={h}>
      {areas.map((a, i) => (
        <g key={i}>
          <rect x={a.x} y={a.y} width={a.w} height={a.h} rx={14} fill={tint(a.c ?? "brand", 8)} stroke={tint(a.c ?? "brand", 45)} strokeDasharray="5 4" />
          <T x={a.x + 10} y={a.y + 12} s={10.5} c={a.c ?? "brand"} w={700} a="start">{a.l}</T>
        </g>
      ))}
      {edges.map((e, i) => {
        const a = N(e.a), b = N(e.b);
        const col = e.hl ? C[e.hl] : e.t === "fiber" ? C.warn : C.muted;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const lab = (n: typeof a, o: typeof b, s?: string) => s && (
          <T x={n.x + (o.x - n.x) * 0.28} y={n.y + (o.y - n.y) * 0.28 - 9} s={9.5} c="muted" w={600}>{s}</T>
        );
        return (
          <g key={i}>
            {e.t === "serial" ? (
              <polyline points={`${a.x},${a.y} ${mx - 6},${my - 8} ${mx + 6},${my + 8} ${b.x},${b.y}`} fill="none" stroke={col} strokeWidth={2.2} />
            ) : (
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={e.hl ? 3 : 2.2}
                strokeDasharray={e.t === "wifi" ? "2 5" : e.t === "broken" ? "6 5" : undefined} strokeLinecap="round" />
            )}
            {e.t === "broken" && <T x={mx} y={my} s={18} c="danger" w={800}>✕</T>}
            {e.l && <T x={mx} y={my - 10} s={10} c={e.hl ?? "muted"} w={600}>{e.l}</T>}
            {lab(a, b, e.la)}{lab(b, a, e.lb)}
          </g>
        );
      })}
      {flows.map((f, i) => {
        const pts = f.path.map(N);
        const dy = f.dy ?? -16;
        return (
          <g key={i}>
            {pts.slice(1).map((p, k) => {
              const q = pts[k];
              return <Arrow key={k} x1={q.x} y1={q.y + dy} x2={p.x} y2={p.y + dy} c={f.c ?? "warn"} w={2.4} dash />;
            })}
            {f.l && <T x={(pts[0].x + pts[pts.length - 1].x) / 2} y={Math.min(...pts.map((p) => p.y)) + dy - 12} s={10.5} c={f.c ?? "warn"} w={700}>{f.l}</T>}
          </g>
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          {n.hl && <circle cx={n.x} cy={n.y} r={26} fill={tint("warn", 25)} />}
          <Device k={n.k} x={n.x} y={n.y} />
          {n.k === "cloud" && n.l && <T x={n.x - 2} y={n.y + 1} s={10} w={700}>{n.l}</T>}
          {n.k !== "cloud" && n.l && <T x={n.x} y={n.y + 25} s={10.5} w={700}>{n.l}</T>}
          {n.s && <T x={n.x} y={n.y + (n.k === "cloud" ? 22 : 37)} s={9} c="muted" mono>{n.s}</T>}
        </g>
      ))}
      {notes.map((n, i) => <T key={i} x={n.x} y={n.y} s={n.s ?? 10.5} c={n.c ?? "fg"} w={n.w ?? 600} a={n.a ?? "middle"} mono={n.mono}>{n.t}</T>)}
    </Svg>
  );
}

/* ───────────── Diagrama de secuencia (escalera) ───────────── */
export type SeqMsg = { from: number; to: number | number[]; l: string; s?: string; c?: Hue; gap?: number; note?: string };
export function Seq({ lanes, msgs, w = 400, kinds }: { lanes: string[]; msgs: SeqMsg[]; w?: number; kinds?: Kind[] }) {
  const pad = 46, step = (w - pad * 2) / Math.max(1, lanes.length - 1);
  const X = (i: number) => pad + i * step;
  let y = 70;
  const rows = msgs.map((m) => { y += m.gap ?? 34; return { ...m, y }; });
  const h = y + 26;
  return (
    <Svg w={w} h={h}>
      {lanes.map((l, i) => (
        <g key={i}>
          <line x1={X(i)} y1={46} x2={X(i)} y2={h - 8} stroke={C.border} strokeWidth={2} strokeDasharray="3 4" />
          {kinds?.[i] ? <Device k={kinds[i]} x={X(i)} y={20} scale={0.8} /> : null}
          <rect x={X(i) - 40} y={kinds ? 34 : 14} width={80} height={20} rx={10} fill={C.s2} />
          <T x={X(i)} y={kinds ? 44 : 24} s={10.5} w={700}>{l}</T>
        </g>
      ))}
      {rows.map((m, k) => {
        const targets = Array.isArray(m.to) ? m.to : [m.to];
        const c = m.c ?? "brand";
        return (
          <g key={k}>
            {targets.map((t) => <Arrow key={t} x1={X(m.from)} y1={m.y} x2={X(t) + (t > m.from ? -3 : 3)} y2={m.y} c={c} w={2} />)}
            <T x={(X(m.from) + X(targets[targets.length - 1])) / 2} y={m.y - 9} s={10.5} c={c} w={700}>{m.l}</T>
            {m.s && <T x={(X(m.from) + X(targets[targets.length - 1])) / 2} y={m.y + 10} s={9} c="muted">{m.s}</T>}
            {m.note && <T x={w - 4} y={m.y} s={9} c="muted" a="end" italic>{m.note}</T>}
          </g>
        );
      })}
    </Svg>
  );
}

/* ───────────── Formato de encabezados / tramas ───────────── */
export type Field = { t: string; w: number; c?: Hue; s?: string };
export function Fields({ rows, w = 400, title, ruler, rowH = 34, side }: {
  rows: Field[][]; w?: number; title?: string; ruler?: string[]; rowH?: number; side?: (string | undefined)[];
}) {
  const sideW = side ? 74 : 0;
  const top = (title ? 22 : 4) + (ruler ? 16 : 0);
  const h = top + rows.length * (rowH + 4) + 4;
  const inner = w - sideW - 4;
  return (
    <Svg w={w} h={h}>
      {title && <T x={2} y={11} s={11} c="muted" w={700} a="start">{title}</T>}
      {ruler && ruler.map((r, i) => <T key={i} x={2 + (inner * i) / (ruler.length - 1)} y={top - 9} s={9} c="muted" a={i === 0 ? "start" : i === ruler.length - 1 ? "end" : "middle"}>{r}</T>)}
      {rows.map((row, ri) => {
        const total = row.reduce((s, f) => s + f.w, 0);
        let x = 2;
        const y = top + ri * (rowH + 4);
        return (
          <g key={ri}>
            {row.map((f, fi) => {
              const fw = (inner * f.w) / total;
              if (!f.t && !f.c) { x += fw; return null; } // espacio invisible para alinear
              const el = (
                <g key={fi}>
                  <rect x={x + 1} y={y} width={fw - 2} height={rowH} rx={6} fill={f.c ? tint(f.c, 24) : C.s2} stroke={f.c ? C[f.c] : C.border} strokeWidth={1.2} />
                  <T x={x + fw / 2} y={y + rowH / 2 - (f.s ? 6 : 0)} s={fw < 46 ? 8.5 : 10.5} w={700}>{f.t}</T>
                  {f.s && <T x={x + fw / 2} y={y + rowH / 2 + 8} s={8.5} c="muted">{f.s}</T>}
                </g>
              );
              x += fw;
              return el;
            })}
            {side?.[ri] && <T x={w - 2} y={y + rowH / 2} s={10.5} c="brand" w={700} a="end">{side[ri]}</T>}
          </g>
        );
      })}
    </Svg>
  );
}

/* ───────────── Pila de capas (columnas comparadas) ───────────── */
export type Layer = { t: string; span?: number; c?: Hue; s?: string };
export function Stack({ cols, w = 400, rowH = 30, peers = false }: { cols: { title: string; items: Layer[] }[]; w?: number; rowH?: number; peers?: boolean }) {
  const gap = peers ? 60 : 12;
  const cw = (w - gap * (cols.length - 1)) / cols.length;
  const rows = Math.max(...cols.map((c) => c.items.reduce((s, i) => s + (i.span ?? 1), 0)));
  const h = 26 + rows * (rowH + 4);
  return (
    <Svg w={w} h={h}>
      {cols.map((col, ci) => {
        const x = ci * (cw + gap);
        let r = 0;
        return (
          <g key={ci}>
            <T x={x + cw / 2} y={10} s={11.5} w={800}>{col.title}</T>
            {col.items.map((it, ii) => {
              const span = it.span ?? 1, y = 24 + r * (rowH + 4), hh = span * rowH + (span - 1) * 4;
              r += span;
              return <Box key={ii} x={x} y={y} w={cw} h={hh} fill={it.c ?? "s2"} stroke={it.c} label={it.t} sub={it.s} s={11} />;
            })}
          </g>
        );
      })}
      {peers && cols.length === 2 && Array.from({ length: rows }, (_, i) => {
        const y = 24 + i * (rowH + 4) + rowH / 2;
        return <Arrow key={i} x1={cw + 4} y1={y} x2={cw + gap - 4} y2={y} c="muted" dash both w={1.4} />;
      })}
    </Svg>
  );
}

/* ───────────── Tabla con estilo de figura ───────────── */
export function FigTable({ head, rows, hl = [], mono = [] }: { head: string[]; rows: (string | number)[][]; hl?: number[]; mono?: number[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr>{head.map((h) => <th key={h} className="border-b-2 border-border px-2 py-1.5 font-semibold text-muted">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={hl.includes(i) ? "bg-warn/15 font-semibold" : i % 2 ? "bg-fill/50" : ""}>
              {r.map((c, j) => <td key={j} className={`border-b border-border/50 px-2 py-1.5 align-top ${mono.includes(j) ? "font-mono text-[12px]" : ""}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────── Terminal (salida de comandos) ───────────── */
export function Terminal({ lines, title = "Consola" }: { lines: string[]; title?: string }) {
  return (
    <div className="overflow-hidden rounded-xl bg-[#1c1c1e] ring-1 ring-black/40">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-1.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[11px] text-white/50">{title}</span>
      </div>
      <pre className="overflow-x-auto px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[#e5e5ea]">
        {lines.map((l, i) => {
          const m = /^([\w-]+(?:\([\w-]+\))?[#>]|C:\\>|\$)(.*)$/.exec(l);
          const comment = l.startsWith("!");
          return (
            <div key={i} className={comment ? "text-[#8e8e93]" : l.startsWith("%") ? "text-[#ffd60a]" : ""}>
              {m ? <><span className="text-[#30d158]">{m[1]}</span><span className="text-white">{m[2]}</span></> : l || " "}
            </div>
          );
        })}
      </pre>
    </div>
  );
}

/* ───────────── Diagrama de flujo ───────────── */
export type FNode = { id: string; x: number; y: number; t: string; w?: number; k?: "box" | "diamond" | "end"; c?: Hue };
export function Flowchart({ nodes, edges, h, w = 400 }: { nodes: FNode[]; edges: { a: string; b: string; l?: string; via?: [number, number] }[]; h: number; w?: number }) {
  const N = (id: string) => nodes.find((n) => n.id === id)!;
  return (
    <Svg w={w} h={h}>
      {edges.map((e, i) => {
        const a = N(e.a), b = N(e.b);
        const pts = e.via ? [[a.x, a.y], e.via, [b.x, b.y]] : [[a.x, a.y], [b.x, b.y]];
        const last = pts[pts.length - 2], end = pts[pts.length - 1];
        // recorta el final para no tapar la caja destino
        const dx = end[0] - last[0], dy = end[1] - last[1], len = Math.hypot(dx, dy) || 1;
        const cut = Math.abs(dy) > Math.abs(dx) ? 19 : (b.w ?? 110) / 2 + 2;
        const ex = end[0] - (dx / len) * cut, ey = end[1] - (dy / len) * cut;
        return (
          <g key={i}>
            <polyline points={[...pts.slice(0, -1), [ex, ey]].map((p) => p.join(",")).join(" ")} fill="none" stroke={C.muted} strokeWidth={1.8} />
            <Head x1={last[0]} y1={last[1]} x2={ex} y2={ey} c="muted" />
            {e.l && (() => {
              const p0 = pts[0], p1 = pts[1];
              const horiz = Math.abs(p1[0] - p0[0]) > Math.abs(p1[1] - p0[1]);
              const start = horiz ? p0[0] + Math.sign(p1[0] - p0[0]) * ((a.w ?? 110) / 2 + 10) : p0[0] + 8;
              const y = horiz ? p0[1] - 9 : p0[1] + 30;
              return <T x={start} y={y} s={10.5} c="brand" w={800} a={horiz ? (p1[0] > p0[0] ? "start" : "end") : "start"}>{e.l}</T>;
            })()}
          </g>
        );
      })}
      {nodes.map((n) => {
        const nw = n.w ?? 110;
        if (n.k === "diamond") return (
          <g key={n.id}>
            <polygon points={`${n.x},${n.y - 22} ${n.x + nw / 2},${n.y} ${n.x},${n.y + 22} ${n.x - nw / 2},${n.y}`} fill={tint(n.c ?? "warn", 22)} stroke={C[n.c ?? "warn"]} strokeWidth={1.5} />
            <T x={n.x} y={n.y} s={10} w={700}>{n.t}</T>
          </g>
        );
        return <Box key={n.id} x={n.x - nw / 2} y={n.y - 16} w={nw} h={32} fill={n.c ?? (n.k === "end" ? "ok" : "brand")} stroke={n.c ?? (n.k === "end" ? "ok" : "brand")} label={n.t} s={10.5} r={n.k === "end" ? 16 : 8} />;
      })}
    </Svg>
  );
}

/* ───────────── Recta numérica de subredes ───────────── */
export function NumberLine({ max = 256, blocks, marker, unit = "", title }: {
  max?: number; blocks: { from: number; size: number; l?: string; c?: Hue }[]; marker?: { v: number; l: string }; unit?: string; title?: string;
}) {
  const w = 400, x0 = 10, x1 = 390, X = (v: number) => x0 + ((x1 - x0) * v) / max;
  return (
    <Svg w={w} h={marker ? 110 : 84}>
      {title && <T x={x0} y={10} s={11} c="muted" w={700} a="start">{title}</T>}
      {blocks.map((b, i) => (
        <g key={i}>
          <rect x={X(b.from) + 1} y={26} width={X(b.from + b.size) - X(b.from) - 2} height={30} rx={6} fill={tint(b.c ?? (i % 2 ? "teal" : "brand"), 26)} stroke={C[b.c ?? (i % 2 ? "teal" : "brand")]} />
          {X(b.from + b.size) - X(b.from) > 30 && <T x={(X(b.from) + X(b.from + b.size)) / 2} y={41} s={10} w={700}>{b.l ?? `${unit}${b.from}`}</T>}
          {X(b.from + b.size) - X(b.from) > 14 && <T x={X(b.from)} y={68} s={9} c="muted">{b.from}</T>}
        </g>
      ))}
      <T x={X(max)} y={68} s={9} c="muted" a="end">{max - 1}</T>
      {marker && (
        <g>
          <line x1={X(marker.v)} y1={20} x2={X(marker.v)} y2={86} stroke={C.danger} strokeWidth={2} />
          <circle cx={X(marker.v)} cy={20} r={4} fill={C.danger} />
          <T x={Math.min(Math.max(X(marker.v), 130), 270)} y={98} s={10.5} c="danger" w={700}>{marker.l}</T>
        </g>
      )}
    </Svg>
  );
}

export { Arrow, Box, C, Device, Head, Svg, T, tint };
