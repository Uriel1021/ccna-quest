/**
 * Kit de figuras educativas en SVG.
 * - Colores con variables CSS del tema → funcionan en modo claro y oscuro.
 * - Sin dependencias ni imágenes externas → ligeras y disponibles sin conexión.
 * - Accesibles: cada figura lleva role="img", descripción y pie de figura.
 */
export const C = {
  fg: "var(--fg)", muted: "var(--muted)", surface: "var(--surface)", s2: "var(--surface-2)", border: "var(--border)",
  brand: "var(--brand)", ok: "var(--ok)", warn: "var(--warn)", danger: "var(--danger)", accent: "var(--accent)",
  indigo: "var(--indigo)", teal: "var(--teal)", pink: "var(--pink)",
} as const;
export type Hue = keyof typeof C;
export const tint = (h: Hue, pct = 18) => `color-mix(in srgb, ${C[h]} ${pct}%, transparent)`;

/** Contenedor de figura con pie numerado. */
export function Figure({ n, caption, alt, children }: { n: string; caption: string; alt: string; children: React.ReactNode }) {
  return (
    <figure className="my-6 overflow-hidden rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/50 sm:p-4" role="group" aria-label={`Figura ${n}: ${caption}`}>
      <div role="img" aria-label={alt} className="mx-auto max-w-xl">{children}</div>
      <figcaption className="mt-2 border-t border-border/60 pt-2 text-[13px] leading-snug text-muted">
        <b className="text-fg">Figura {n}.</b> {caption}
      </figcaption>
    </figure>
  );
}

/** Lienzo SVG responsivo. */
export function Svg({ w = 400, h, children }: { w?: number; h: number; children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block", fontFamily: "var(--font-sans)" }} aria-hidden>
      {children}
    </svg>
  );
}

export function T({ x, y, children, s = 12, c = "fg", w = 500, a = "middle", mono = false, italic = false }: {
  x: number; y: number; children: React.ReactNode; s?: number; c?: Hue; w?: number; a?: "start" | "middle" | "end"; mono?: boolean; italic?: boolean;
}) {
  return (
    <text x={x} y={y} fontSize={s} fill={C[c]} fontWeight={w} textAnchor={a} dominantBaseline="middle"
      fontFamily={mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined} fontStyle={italic ? "italic" : undefined}>
      {children}
    </text>
  );
}

/** Punta de flecha al final del segmento (x1,y1)→(x2,y2). */
export function Head({ x1, y1, x2, y2, c = "brand", size = 7 }: { x1: number; y1: number; x2: number; y2: number; c?: Hue; size?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (d: number) => `${x2 - size * Math.cos(a - d)},${y2 - size * Math.sin(a - d)}`;
  return <polygon points={`${x2},${y2} ${p(0.45)} ${p(-0.45)}`} fill={C[c]} />;
}

export function Arrow({ x1, y1, x2, y2, c = "brand", dash, w = 2, both = false, label, lc, ly = -8 }: {
  x1: number; y1: number; x2: number; y2: number; c?: Hue; dash?: boolean; w?: number; both?: boolean; label?: string; lc?: Hue; ly?: number;
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C[c]} strokeWidth={w} strokeDasharray={dash ? "5 4" : undefined} />
      <Head x1={x1} y1={y1} x2={x2} y2={y2} c={c} />
      {both && <Head x1={x2} y1={y2} x2={x1} y2={y1} c={c} />}
      {label && <T x={(x1 + x2) / 2} y={(y1 + y2) / 2 + ly} s={11} c={lc ?? c} w={600}>{label}</T>}
    </g>
  );
}

export function Box({ x, y, w, h, fill = "s2", stroke, r = 8, label, sub, lc = "fg", s = 12, dash }: {
  x: number; y: number; w: number; h: number; fill?: Hue | "none"; stroke?: Hue; r?: number; label?: React.ReactNode; sub?: React.ReactNode; lc?: Hue; s?: number; dash?: boolean;
}) {
  const f = fill === "none" ? "none" : fill === "s2" || fill === "surface" ? C[fill] : tint(fill, 22);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={f} stroke={stroke ? C[stroke] : "none"} strokeWidth={1.5} strokeDasharray={dash ? "5 4" : undefined} />
      {label !== undefined && <T x={x + w / 2} y={y + h / 2 - (sub ? 7 : 0)} s={s} c={lc} w={600}>{label}</T>}
      {sub !== undefined && <T x={x + w / 2} y={y + h / 2 + 9} s={10} c="muted">{sub}</T>}
    </g>
  );
}

export type Kind = "pc" | "laptop" | "phone" | "server" | "router" | "switch" | "ap" | "firewall" | "cloud" | "printer" | "hub";

/** Íconos de equipos (centrados en 0,0, ~36 px). */
export function Device({ k, x, y, hl = false, scale = 1 }: { k: Kind; x: number; y: number; hl?: boolean; scale?: number }) {
  const stroke = hl ? C.warn : C.border;
  const g = (children: React.ReactNode) => <g transform={`translate(${x} ${y}) scale(${scale})`}>{children}</g>;
  switch (k) {
    case "pc":
      return g(<>
        <rect x={-16} y={-15} width={32} height={22} rx={3} fill={C.s2} stroke={hl ? C.warn : C.muted} strokeWidth={2} />
        <rect x={-12} y={-11} width={24} height={14} rx={1.5} fill={tint("brand", 30)} />
        <path d="M-5 7 L5 7 L7 13 L-7 13 Z" fill={C.muted} />
      </>);
    case "laptop":
      return g(<>
        <rect x={-14} y={-14} width={28} height={19} rx={2.5} fill={C.s2} stroke={hl ? C.warn : C.muted} strokeWidth={2} />
        <rect x={-10} y={-10} width={20} height={11} rx={1} fill={tint("brand", 30)} />
        <path d="M-19 7 L19 7 L16 12 L-16 12 Z" fill={C.muted} />
      </>);
    case "phone":
      return g(<>
        <rect x={-9} y={-15} width={18} height={30} rx={4} fill={C.s2} stroke={hl ? C.warn : C.muted} strokeWidth={2} />
        <rect x={-6} y={-11} width={12} height={19} rx={1} fill={tint("brand", 30)} />
      </>);
    case "server":
      return g(<>
        {[-15, -5, 5].map((yy) => <rect key={yy} x={-14} y={yy} width={28} height={9} rx={2} fill={C.s2} stroke={hl ? C.warn : C.muted} strokeWidth={1.6} />)}
        {[-10.5, -0.5, 9.5].map((yy) => <circle key={yy} cx={9} cy={yy} r={1.6} fill={C.ok} />)}
      </>);
    case "printer":
      return g(<>
        <rect x={-15} y={-6} width={30} height={14} rx={3} fill={C.s2} stroke={hl ? C.warn : C.muted} strokeWidth={2} />
        <rect x={-9} y={-14} width={18} height={8} fill={C.surface} stroke={C.muted} strokeWidth={1.5} />
        <rect x={-9} y={8} width={18} height={6} fill={C.surface} stroke={C.muted} strokeWidth={1.5} />
      </>);
    case "router":
      return g(<>
        <ellipse cx={0} cy={4} rx={19} ry={9} fill={C.brand} opacity={0.75} />
        <rect x={-19} y={-6} width={38} height={10} fill={C.brand} />
        <ellipse cx={0} cy={-6} rx={19} ry={9} fill={C.brand} stroke={stroke} strokeWidth={hl ? 2.5 : 0} />
        <path d="M-9 -9 L-3 -6 M-9 -3 L-3 -6 M9 -9 L3 -6 M9 -3 L3 -6" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
      </>);
    case "switch":
      return g(<>
        <rect x={-20} y={-11} width={40} height={22} rx={4} fill={C.teal} stroke={stroke} strokeWidth={hl ? 2.5 : 0} />
        <path d="M-12 -4 H10 M6 -7 L10 -4 L6 -1 M12 4 H-10 M-6 1 L-10 4 L-6 7" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      </>);
    case "hub":
      return g(<>
        <rect x={-20} y={-10} width={40} height={20} rx={4} fill={C.muted} />
        <T x={0} y={0} s={10} c="surface" w={700}>HUB</T>
      </>);
    case "ap":
      return g(<>
        <rect x={-14} y={0} width={28} height={10} rx={3} fill={C.indigo} />
        {[8, 13, 18].map((r) => <path key={r} d={`M${-r * 0.7} ${-r * 0.55 + 1} A ${r} ${r} 0 0 1 ${r * 0.7} ${-r * 0.55 + 1}`} stroke={C.indigo} strokeWidth={2} fill="none" />)}
      </>);
    case "firewall":
      return g(<>
        <rect x={-17} y={-13} width={34} height={26} rx={3} fill={C.danger} />
        <path d="M-17 -4 H17 M-17 5 H17 M-6 -13 V-4 M6 -4 V5 M-6 5 V13 M10 -13 V-4" stroke="white" strokeWidth={1.4} opacity={0.85} />
      </>);
    case "cloud":
      return g(<path d="M-26 10 C-36 10 -36 -6 -24 -6 C-24 -18 -6 -20 -2 -11 C2 -20 22 -18 20 -5 C32 -5 32 10 22 10 Z" fill={C.s2} stroke={C.muted} strokeWidth={1.6} />);
  }
}
