/** Figuras con dibujo propio (no salen de un generador). */
import { Arrow, Box, C, Device, Svg, T, tint, type Hue } from "./kit";

/* Modos de IOS: escalera de permisos */
export function IosModes() {
  const steps: [string, string, Hue, string?][] = [
    ["Switch>", "EXEC usuario · solo consultar", "muted", "enable"],
    ["Switch#", "EXEC privilegiado · ver todo, reiniciar", "brand", "configure terminal"],
    ["Switch(config)#", "Configuración global · cambiar el equipo", "warn", "interface g0/1"],
    ["Switch(config-if)#", "Submodo de interfaz · configurar un puerto", "pink"],
  ];
  return (
    <Svg h={212}>
      {steps.map(([p, d, c, cmd], i) => {
        const x = 4 + i * 14, y = 6 + i * 50;
        return (
          <g key={i}>
            <rect x={x} y={y} width={228} height={38} rx={8} fill={tint(c, 22)} stroke={C[c]} />
            <T x={x + 10} y={y + 13} s={11} w={800} a="start" mono>{p}</T>
            <T x={x + 10} y={y + 28} s={9.5} c="muted" a="start">{d}</T>
            {cmd && <><Arrow x1={x + 238} y1={y + 24} x2={x + 238} y2={y + 52} c="ok" /><T x={x + 246} y={y + 38} s={10} c="ok" w={700} a="start" mono>{cmd}</T></>}
          </g>
        );
      })}
      <T x={394} y={206} s={10} c="muted" a="end">exit: sube un nivel · end: vuelve a #</T>
    </Svg>
  );
}

/* Anatomía de un comando */
export function CommandAnatomy() {
  return (
    <Svg h={120}>
      <rect x={20} y={30} width={360} height={36} rx={8} fill="#1c1c1e" />
      <T x={30} y={48} s={13} c="ok" a="start" mono>SW1(config)#</T>
      <T x={142} y={48} s={13} a="start" mono w={700}><tspan fill={C.warn}>hostname</tspan><tspan fill="white"> </tspan><tspan fill={C.teal}>SW-Aula</tspan></T>
      <path d="M146 72 v8 h68 v-8" stroke={C.warn} fill="none" strokeWidth={2} />
      <T x={180} y={94} s={11} c="warn" w={700}>palabra clave</T>
      <path d="M222 72 v8 h56 v-8" stroke={C.teal} fill="none" strokeWidth={2} />
      <T x={250} y={108} s={11} c="teal" w={700}>argumento (lo eliges tú)</T>
      <T x={30} y={14} s={10.5} c="muted" a="start">Prompt (modo actual)</T>
    </Svg>
  );
}

/* running-config (RAM) vs startup-config (NVRAM) */
export function RamNvram() {
  return (
    <Svg h={150}>
      <Box x={10} y={30} w={150} h={80} fill="warn" stroke="warn" label="RAM" sub="running-config · en uso" />
      <Box x={240} y={30} w={150} h={80} fill="ok" stroke="ok" label="NVRAM" sub="startup-config · guardada" />
      <Arrow x1={162} y1={58} x2={238} y2={58} c="brand" label="copy run start" />
      <Arrow x1={238} y1={86} x2={162} y2={86} c="muted" label="al encender" ly={12} />
      <T x={85} y={128} s={10} c="danger" w={600}>Se borra al apagar</T>
      <T x={315} y={128} s={10} c="ok" w={600}>Sobrevive al apagado</T>
    </Svg>
  );
}

/* Configuración IP de una PC */
export function IpSettings({ ip = "192.168.10.20", mask = "255.255.255.0", gw = "192.168.10.1", dns = "8.8.8.8" }) {
  const rows: [string, string, string][] = [["Dirección IP", ip, "Identifica a la PC"], ["Máscara de subred", mask, "Indica su red"], ["Gateway predeterminado", gw, "Salida a otras redes"], ["Servidor DNS", dns, "Traduce nombres a IP"]];
  return (
    <Svg h={170}>
      <rect x={10} y={6} width={380} height={158} rx={12} fill={C.s2} stroke={C.border} />
      <T x={24} y={24} s={11.5} w={800} a="start">⚙︎ Configuración IPv4 (manual)</T>
      {rows.map(([k, v, d], i) => (
        <g key={k}>
          <T x={24} y={52 + i * 30} s={10.5} a="start" w={600}>{k}</T>
          <rect x={170} y={41 + i * 30} width={118} height={22} rx={5} fill={C.surface} stroke={C.border} />
          <T x={229} y={52 + i * 30} s={10.5} mono>{v}</T>
          <T x={296} y={52 + i * 30} s={9} c="muted" a="start">{d}</T>
        </g>
      ))}
    </Svg>
  );
}

/* Unicast / multicast / broadcast */
export function CastTypes() {
  const panel = (x: number, title: string, targets: number[], c: Hue) => (
    <g key={title}>
      <T x={x + 60} y={12} s={11} w={800} c={c}>{title}</T>
      <Device k="pc" x={x + 60} y={44} scale={0.8} hl />
      {[0, 1, 2, 3].map((i) => {
        const hx = x + 12 + i * 32, hy = 128;
        const on = targets.includes(i);
        return (
          <g key={i}>
            {on && <line x1={x + 60} y1={58} x2={hx} y2={hy - 14} stroke={C[c]} strokeWidth={2} />}
            <Device k="pc" x={hx} y={hy} scale={0.6} />
            {on && <circle cx={hx} cy={hy - 20} r={3} fill={C[c]} />}
          </g>
        );
      })}
    </g>
  );
  return (
    <Svg h={150}>
      {panel(0, "Unicast (a uno)", [1], "brand")}
      {panel(140, "Multicast (a un grupo)", [0, 2], "accent")}
      {panel(280, "Broadcast (a todos)", [0, 1, 2, 3], "warn")}
    </Svg>
  );
}

/* Bits convertidos en señales */
export function Signals() {
  const bits = [1, 0, 1, 1, 0, 1, 0, 0];
  const x0 = 70, bw = 38;
  const sq = bits.map((b, i) => `${i === 0 ? "M" : "L"}${x0 + i * bw},${b ? 34 : 58} L${x0 + (i + 1) * bw},${b ? 34 : 58}`).join(" ");
  return (
    <Svg h={190}>
      {bits.map((b, i) => <T key={i} x={x0 + i * bw + bw / 2} y={14} s={12} w={800} mono c="brand">{b}</T>)}
      <T x={4} y={46} s={10} a="start" w={700}>Cobre</T>
      <path d={sq} fill="none" stroke={C.warn} strokeWidth={2.5} />
      <T x={4} y={98} s={10} a="start" w={700}>Fibra</T>
      {bits.map((b, i) => b ? <rect key={i} x={x0 + i * bw + 6} y={86} width={bw - 12} height={22} rx={4} fill={tint("warn", 70)} /> : <rect key={i} x={x0 + i * bw + 6} y={86} width={bw - 12} height={22} rx={4} fill={C.s2} />)}
      <T x={4} y={150} s={10} a="start" w={700}>Radio</T>
      <path d={Array.from({ length: 120 }, (_, k) => { const x = x0 + (k * bw * 8) / 120; const i = Math.floor((x - x0) / bw); const amp = bits[Math.min(7, i)] ? 16 : 6; return `${k ? "L" : "M"}${x},${150 + amp * Math.sin(k / 1.6)}`; }).join(" ")} fill="none" stroke={C.indigo} strokeWidth={2} />
      <T x={200} y={182} s={9.5} c="muted">Los mismos bits viajan como voltaje, luz o señal de radio</T>
    </Svg>
  );
}

/* Ancho de banda vs rendimiento */
export function BandwidthPipe() {
  return (
    <Svg h={130}>
      <rect x={20} y={30} width={360} height={56} rx={28} fill={C.s2} stroke={C.border} strokeWidth={2} />
      <rect x={24} y={46} width={250} height={24} rx={12} fill={tint("brand", 60)} />
      <T x={150} y={58} s={10.5} w={800} c="surface">Rendimiento real: 650 Mb/s</T>
      <T x={200} y={16} s={11} w={700}>Ancho de banda (capacidad): 1 Gb/s</T>
      <T x={200} y={104} s={10} c="muted">La latencia, el tráfico y el tipo de datos reducen lo que realmente pasa</T>
    </Svg>
  );
}

/* Tipos de cable de cobre (corte transversal) */
export function CopperTypes() {
  const pairs = (cx: number, cy: number) => [[-9, -9, "#ff8a00"], [9, -9, "#22a447"], [-9, 9, "#1f6fe5"], [9, 9, "#8b5a2b"]].map(([dx, dy, col], i) => (
    <g key={i}><circle cx={cx + (dx as number)} cy={cy + (dy as number)} r={6} fill={col as string} /><circle cx={cx + (dx as number) + 3} cy={cy + (dy as number) + 2} r={3} fill="white" opacity={0.8} /></g>
  ));
  return (
    <Svg h={140}>
      <circle cx={70} cy={60} r={30} fill={C.s2} stroke={C.muted} strokeWidth={3} />{pairs(70, 60)}
      <T x={70} y={110} s={11} w={800}>UTP</T><T x={70} y={124} s={9.5} c="muted">4 pares trenzados</T>
      <circle cx={200} cy={60} r={32} fill={C.s2} stroke={C.muted} strokeWidth={3} /><circle cx={200} cy={60} r={26} fill="none" stroke={C.muted} strokeDasharray="2 2" strokeWidth={2} />{pairs(200, 60)}
      <T x={200} y={110} s={11} w={800}>STP</T><T x={200} y={124} s={9.5} c="muted">con blindaje de malla</T>
      <circle cx={330} cy={60} r={32} fill={C.s2} stroke={C.muted} strokeWidth={3} /><circle cx={330} cy={60} r={24} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="2 2" /><circle cx={330} cy={60} r={16} fill={tint("muted", 25)} /><circle cx={330} cy={60} r={4} fill={C.warn} />
      <T x={330} y={110} s={11} w={800}>Coaxial</T><T x={330} y={124} s={9.5} c="muted">un conductor central</T>
    </Svg>
  );
}

/* Orden de hilos T568A y T568B */
const W: Record<string, [string, boolean]> = { bn: ["#ff8a00", true], n: ["#ff8a00", false], bv: ["#22a447", true], v: ["#22a447", false], ba: ["#1f6fe5", true], a: ["#1f6fe5", false], bm: ["#8b5a2b", true], m: ["#8b5a2b", false] };
export function Pinout() {
  const row = (y: number, label: string, ids: string[]) => (
    <g key={label}>
      <T x={4} y={y + 24} s={11} w={800} a="start">{label}</T>
      {ids.map((id, i) => {
        const [col, striped] = W[id], x = 70 + i * 40;
        return (
          <g key={i}>
            <rect x={x} y={y} width={30} height={48} rx={4} fill={striped ? "white" : col} stroke={C.border} />
            {striped && [0, 1, 2, 3, 4].map((k) => <rect key={k} x={x} y={y + 2 + k * 10} width={30} height={5} fill={col} />)}
            <T x={x + 15} y={y + 58} s={10} w={700}>{i + 1}</T>
          </g>
        );
      })}
    </g>
  );
  return (
    <Svg h={170}>
      {row(4, "T568A", ["bv", "v", "bn", "a", "ba", "n", "bm", "m"])}
      {row(94, "T568B", ["bn", "n", "bv", "a", "ba", "v", "bm", "m"])}
    </Svg>
  );
}

/* Fibra monomodo vs multimodo */
export function FiberModes() {
  const fiber = (y: number, core: number, title: string, sub: string, multi: boolean) => (
    <g>
      <T x={4} y={y - 16} s={11} w={800} a="start">{title}</T><T x={396} y={y - 16} s={9.5} c="muted" a="end">{sub}</T>
      <rect x={10} y={y - 20 + 8} width={380} height={40} rx={20} fill={C.s2} stroke={C.border} />
      <rect x={10} y={y - core / 2 + 8} width={380} height={core} fill={tint("warn", 20)} />
      {multi
        ? <polyline points={Array.from({ length: 11 }, (_, i) => `${20 + i * 36},${y + 8 + (i % 2 ? core / 2 - 2 : -core / 2 + 2)}`).join(" ")} fill="none" stroke={C.warn} strokeWidth={2} />
        : <line x1={20} y1={y + 8} x2={380} y2={y + 8} stroke={C.danger} strokeWidth={2.5} />}
    </g>
  );
  return (
    <Svg h={150}>
      {fiber(36, 6, "Monomodo", "núcleo muy delgado · láser · decenas de km", false)}
      {fiber(110, 26, "Multimodo", "núcleo grueso · LED · cientos de metros", true)}
    </Svg>
  );
}

/* Valores de un octeto y ejemplos */
export function BitRow({ examples }: { examples: number[] }) {
  const vals = [128, 64, 32, 16, 8, 4, 2, 1];
  return (
    <Svg h={40 + examples.length * 34}>
      {vals.map((v, i) => <g key={v}><rect x={70 + i * 40} y={4} width={36} height={24} rx={6} fill={C.s2} /><T x={88 + i * 40} y={16} s={11} w={800}>{v}</T></g>)}
      {examples.map((n, r) => (
        <g key={n}>
          <T x={60} y={50 + r * 34} s={13} w={800} a="end" mono>{n} =</T>
          {vals.map((v, i) => {
            const on = (n & v) !== 0;
            return <g key={v}><rect x={70 + i * 40} y={38 + r * 34} width={36} height={24} rx={6} fill={on ? C.ok : C.surface} stroke={C.border} /><T x={88 + i * 40} y={50 + r * 34} s={13} w={800} mono c={on ? "surface" : "muted"}>{on ? 1 : 0}</T></g>;
          })}
        </g>
      ))}
    </Svg>
  );
}

/* Topologías WAN */
export function Topologies() {
  const dot = (x: number, y: number, k = "router" as const) => <Device k={k} x={x} y={y} scale={0.6} />;
  const ln = (a: number[], b: number[]) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.muted} strokeWidth={2} />;
  const mesh = [[300, 50], [370, 50], [300, 110], [370, 110]];
  return (
    <Svg h={150}>
      <T x={65} y={12} s={11} w={800}>Punto a punto</T>{ln([30, 80], [100, 80])}{dot(30, 80)}{dot(100, 80)}
      <T x={200} y={12} s={11} w={800}>Hub and spoke</T>
      {[[150, 45], [250, 45], [150, 115], [250, 115]].map((p, i) => <g key={i}>{ln([200, 80], p)}{dot(p[0], p[1])}</g>)}{dot(200, 80)}
      <T x={335} y={12} s={11} w={800}>Malla</T>
      {mesh.flatMap((a, i) => mesh.slice(i + 1).map((b, j) => <g key={`${i}-${j}`}>{ln(a, b)}</g>))}{mesh.map((p, i) => <g key={i}>{dot(p[0], p[1])}</g>)}
      <T x={200} y={142} s={9.5} c="muted">Más enlaces = más redundancia (y más costo)</T>
    </Svg>
  );
}

/* Half-duplex vs full-duplex */
export function Duplex() {
  return (
    <Svg h={110}>
      <T x={100} y={12} s={11} w={800}>Half-duplex</T>
      <Device k="pc" x={30} y={50} scale={0.8} /><Device k="pc" x={170} y={50} scale={0.8} />
      <Arrow x1={50} y1={44} x2={150} y2={44} c="brand" /><line x1={150} y1={58} x2={50} y2={58} stroke={C.border} strokeWidth={2} strokeDasharray="4 4" />
      <T x={100} y={90} s={9.5} c="muted">Un sentido a la vez (walkie-talkie)</T>
      <T x={300} y={12} s={11} w={800}>Full-duplex</T>
      <Device k="pc" x={230} y={50} scale={0.8} /><Device k="pc" x={370} y={50} scale={0.8} />
      <Arrow x1={250} y1={44} x2={350} y2={44} c="brand" /><Arrow x1={350} y1={58} x2={250} y2={58} c="ok" />
      <T x={300} y={90} s={9.5} c="muted">Ambos sentidos a la vez (teléfono)</T>
    </Svg>
  );
}

/* Métodos de reenvío del switch sobre una trama */
export function SwitchMethods() {
  const segs: [string, number, Hue][] = [["Preámb.", 8, "muted"], ["Destino", 7, "brand"], ["Origen", 7, "teal"], ["T", 2, "accent"], ["Datos (46–1500)", 28, "ok"], ["FCS", 4, "warn"]];
  const total = segs.reduce((s, x) => s + x[1], 0); let x = 10;
  const at = (bytes: number) => 10 + (380 * bytes) / total;
  return (
    <Svg h={176}>
      {segs.map(([t, b, c]) => { const w = (380 * b) / total; const el = <Box key={t} x={x} y={20} w={w - 2} h={30} fill={c} stroke={c} label={t} s={w < 50 ? 8.5 : 10} />; x += w; return el; })}
      {([["Store-and-forward: al final (revisa FCS)", total, "ok"], ["Fragment-free: tras 64 bytes", 30, "warn"], ["Fast-forward: tras leer la MAC destino", 15, "danger"]] as [string, number, Hue][]).map(([t, b, c], i) => (
        <g key={t}>
          <line x1={at(b)} y1={52} x2={at(b)} y2={78 + i * 28} stroke={C[c]} strokeWidth={2} />
          <T x={at(b) + (b === total ? -4 : 4)} y={80 + i * 28} s={10.5} c={c} w={700} a={b === total ? "end" : "start"}>{t}</T>
        </g>
      ))}
      <T x={200} y={168} s={9.5} c="muted">Reenviar antes = menos latencia · reenviar al final = descarta tramas dañadas</T>
    </Svg>
  );
}

/* IP AND máscara = red */
export function IpMask({ ip = [192, 168, 10, 77], prefix = 26 }: { ip?: number[]; prefix?: number }) {
  const bits = ip.map((o) => o.toString(2).padStart(8, "0")).join("");
  const mask = "1".repeat(prefix).padEnd(32, "0");
  const net = bits.split("").map((b, i) => (mask[i] === "1" ? b : "0")).join("");
  const row = (y: number, label: string, s: string, colorize: boolean) => (
    <g>
      <T x={4} y={y + 8} s={10} w={700} a="start">{label}</T>
      {s.split("").map((b, i) => {
        const x = 70 + i * 10 + Math.floor(i / 8) * 4;
        const isNet = i < prefix;
        return <g key={i}><rect x={x} y={y} width={9} height={16} rx={2} fill={colorize ? (isNet ? tint("brand", 35) : tint("ok", 35)) : C.s2} /><T x={x + 4.5} y={y + 8.5} s={8.5} mono w={700}>{b}</T></g>;
      })}
    </g>
  );
  const toDec = (s: string) => [0, 8, 16, 24].map((k) => parseInt(s.slice(k, k + 8), 2)).join(".");
  return (
    <Svg w={480} h={150}>
      {row(8, "IP", bits, true)}<T x={476} y={16} s={10} a="end" mono>{ip.join(".")}</T>
      {row(34, "Máscara", mask, false)}<T x={476} y={42} s={10} a="end" mono>/{prefix}</T>
      <line x1={70} y1={58} x2={476} y2={58} stroke={C.fg} strokeWidth={1.2} /><T x={60} y={58} s={9} c="muted" a="end">AND</T>
      {row(64, "Red", net, true)}<T x={476} y={72} s={10} a="end" mono w={800}>{toDec(net)}</T>
      <rect x={70} y={100} width={12} height={10} rx={2} fill={tint("brand", 35)} /><T x={86} y={105} s={10} a="start">Porción de red ({prefix} bits)</T>
      <rect x={240} y={100} width={12} height={10} rx={2} fill={tint("ok", 35)} /><T x={256} y={105} s={10} a="start">Porción de host ({32 - prefix} bits)</T>
      <T x={240} y={134} s={9.5} c="muted">Donde la máscara tiene 1 se copia el bit de la IP; donde tiene 0 queda 0</T>
    </Svg>
  );
}

/* Compresión IPv6 paso a paso */
export function Ipv6Compress() {
  const rows: [string, string, Hue][] = [
    ["Completa", "2001:0db8:0000:0000:0000:ff00:0042:8329", "muted"],
    ["Regla 1", "2001:db8:0:0:0:ff00:42:8329", "brand"],
    ["Regla 2", "2001:db8::ff00:42:8329", "ok"],
  ];
  return (
    <Svg h={140}>
      {rows.map(([l, a, c], i) => (
        <g key={l}>
          <rect x={4} y={8 + i * 42} width={70} height={28} rx={8} fill={tint(c, 22)} />
          <T x={39} y={22 + i * 42} s={10.5} w={800} c={c}>{l}</T>
          <T x={84} y={22 + i * 42} s={12} mono w={700} a="start">{a}</T>
        </g>
      ))}
      <T x={84} y={134} s={9.5} c="muted" a="start">Regla 1: sin ceros a la izquierda · Regla 2: ceros seguidos → :: (una vez)</T>
    </Svg>
  );
}

/* EUI-64 */
export function Eui64() {
  return (
    <Svg h={190}>
      <T x={4} y={12} s={10.5} w={700} a="start">1. MAC de 48 bits</T>
      <Box x={60} y={22} w={130} h={26} fill="brand" stroke="brand" label="FC:99:47" s={11} /><Box x={200} y={22} w={130} h={26} fill="teal" stroke="teal" label="75:CE:E0" s={11} />
      <T x={4} y={66} s={10.5} w={700} a="start">2. Se parte e inserta FFFE en medio</T>
      <Box x={20} y={76} w={110} h={26} fill="brand" stroke="brand" label="FC:99:47" s={11} /><Box x={140} y={76} w={110} h={26} fill="warn" stroke="warn" label="FF:FE" s={11} /><Box x={260} y={76} w={110} h={26} fill="teal" stroke="teal" label="75:CE:E0" s={11} />
      <T x={4} y={120} s={10.5} w={700} a="start">3. Se invierte el 7.º bit (FC → FE)</T>
      <T x={200} y={146} s={13} mono w={800}>ID de interfaz: FE99:47FF:FE75:CEE0</T>
      <T x={200} y={176} s={9.5} c="muted">FC = 1111 1100 → 1111 1110 = FE</T>
    </Svg>
  );
}

/* Triángulo CIA */
export function CiaTriangle() {
  return (
    <Svg h={210}>
      <polygon points="200,44 320,166 80,166" fill={tint("brand", 12)} stroke={C.brand} strokeWidth={2} />
      {[[200, 44], [320, 166], [80, 166]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={6} fill={C.brand} />)}
      <T x={200} y={12} s={11.5} w={800}>Confidencialidad</T><T x={200} y={27} s={9.5} c="muted">solo quien debe la ve</T>
      <T x={80} y={186} s={11.5} w={800}>Integridad</T><T x={80} y={200} s={9.5} c="muted">no se altera</T>
      <T x={320} y={186} s={11.5} w={800}>Disponibilidad</T><T x={320} y={200} s={9.5} c="muted">está cuando se necesita</T>
      <T x={200} y={124} s={13} w={800} c="brand">Seguridad</T>
    </Svg>
  );
}

/* Defensa en profundidad */
export function DefenseLayers() {
  const rings: [string, Hue][] = [["Políticas y capacitación", "accent"], ["Firewall y ACL", "danger"], ["IPS y VPN", "warn"], ["Antivirus y parches", "teal"], ["Datos (respaldos)", "ok"]];
  return (
    <Svg h={262}>
      {rings.map(([l, c], i) => {
        const r = 122 - i * 22;
        return <g key={l}><circle cx={200} cy={126} r={r} fill={tint(c, 14)} stroke={C[c]} strokeWidth={1.5} /><T x={200} y={126 - r + 11} s={10} w={800} c={c}>{l}</T></g>;
      })}
      <Device k="server" x={200} y={142} scale={0.7} />
      <T x={200} y={257} s={9.5} c="muted">Si una capa falla, las demás siguen protegiendo</T>
    </Svg>
  );
}

/* Jerarquía DNS */
export function DnsTree() {
  const node = (x: number, y: number, t: string, c: Hue) => <Box x={x - 40} y={y - 13} w={80} h={26} fill={c} stroke={c} label={t} s={10.5} r={13} />;
  const ln = (a: number[], b: number[]) => <line x1={a[0]} y1={a[1] + 13} x2={b[0]} y2={b[1] - 13} stroke={C.border} strokeWidth={2} />;
  return (
    <Svg h={170}>
      {ln([200, 22], [100, 80])}{ln([200, 22], [200, 80])}{ln([200, 22], [300, 80])}{ln([100, 80], [60, 140])}{ln([100, 80], [150, 140])}{ln([200, 80], [250, 140])}
      {node(200, 22, ". (raíz)", "muted")}
      {node(100, 80, ".com", "brand")}{node(200, 80, ".mx", "brand")}{node(300, 80, ".org", "brand")}
      {node(60, 140, "google", "ok")}{node(150, 140, "ejemplo", "ok")}{node(250, 140, "unam", "ok")}
      <T x={392} y={140} s={9.5} c="muted" a="end">www.unam.mx</T>
    </Svg>
  );
}

/* Rangos de puertos */
export function PortRanges() {
  return (
    <Svg h={120}>
      <Box x={10} y={30} w={96} h={36} fill="brand" stroke="brand" label="0–1023" sub="bien conocidos" s={10.5} />
      <Box x={110} y={30} w={170} h={36} fill="teal" stroke="teal" label="1024–49151" sub="registrados" s={10.5} />
      <Box x={284} y={30} w={106} h={36} fill="accent" stroke="accent" label="49152–65535" sub="dinámicos" s={10.5} />
      <T x={10} y={14} s={10} c="muted" a="start">HTTP 80 · HTTPS 443 · SSH 22 · DNS 53 · SMTP 25</T>
      <T x={200} y={92} s={11} mono w={800}>Socket = 192.168.1.5 : 50123</T>
      <T x={200} y={108} s={9.5} c="muted">dirección IP + número de puerto</T>
    </Svg>
  );
}

/* Varias aplicaciones comparten la red gracias a los puertos */
export function Multiplex() {
  const apps: [string, string, Hue][] = [["Navegador", "TCP 443", "brand"], ["Correo", "TCP 25", "teal"], ["Videollamada", "UDP 3478", "accent"]];
  return (
    <Svg h={150}>
      {apps.map(([a, p, c], i) => (
        <g key={a}>
          <Box x={10} y={10 + i * 44} w={110} h={34} fill={c} stroke={c} label={a} sub={p} s={10.5} />
          <Arrow x1={122} y1={27 + i * 44} x2={196} y2={72} c={c} />
        </g>
      ))}
      <Box x={200} y={52} w={90} h={40} fill="warn" stroke="warn" label="Transporte" sub="segmentos" />
      <Arrow x1={292} y1={72} x2={340} y2={72} c="muted" />
      <Device k="pc" x={368} y={70} />
      <T x={200} y={140} s={9.5} c="muted">El número de puerto indica a qué aplicación pertenece cada segmento</T>
    </Svg>
  );
}

/* Cola con prioridad (QoS) */
export function QosQueue() {
  const pk = (x: number, c: Hue, t: string) => <Box key={x} x={x} y={36} w={40} h={26} fill={c} stroke={c} label={t} s={9.5} r={5} />;
  return (
    <Svg h={120}>
      <T x={10} y={14} s={10.5} w={700} a="start">Salida del router</T>
      {pk(20, "muted", "Archivo")}{pk(64, "muted", "Web")}{pk(108, "ok", "Voz")}{pk(152, "muted", "Web")}{pk(196, "ok", "Voz")}
      <Arrow x1={244} y1={49} x2={290} y2={49} c="muted" />
      {pk(300, "ok", "Voz")}{pk(344, "ok", "Voz")}
      <T x={320} y={84} s={10} c="ok" w={700}>QoS: la voz sale primero</T>
      <T x={200} y={108} s={9.5} c="muted">Sin prioridad, la voz esperaría detrás de una descarga y la llamada se cortaría</T>
    </Svg>
  );
}
