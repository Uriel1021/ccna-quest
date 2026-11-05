"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Monitor } from "lucide-react";
import { Group, Row } from "@/components/ui/apple";
import { haptic, shuffle } from "@/lib/feedback";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";

type Host = { id: string; mac: string; port: number };
const HOSTS: Host[] = [
  { id: "A", mac: "AA:AA:AA:00:00:0A", port: 1 },
  { id: "B", mac: "BB:BB:BB:00:00:0B", port: 2 },
  { id: "C", mac: "CC:CC:CC:00:00:0C", port: 3 },
  { id: "D", mac: "DD:DD:DD:00:00:0D", port: 4 },
];
const BCAST = "FF:FF:FF:FF:FF:FF";
type Frame = { src: string; dst: string | "broadcast" };

function makeFrames(): Frame[] {
  const [a, b, c, d] = shuffle(HOSTS.map((h) => h.id));
  // Mezcla de destinos desconocidos, broadcast y conocidos para que la tabla "importe".
  return [
    { src: a, dst: b },          // b desconocido → inundar
    { src: b, dst: a },          // a conocido → reenviar
    { src: c, dst: "broadcast" },// broadcast → inundar
    { src: a, dst: c },          // c conocido → reenviar
    { src: d, dst: b },          // b conocido → reenviar
    { src: b, dst: d },          // d conocido → reenviar
  ];
}
const host = (id: string) => HOSTS.find((h) => h.id === id)!;
const MAX = 12;

export default function SwitchAprendiz({ onFinish }: GameProps) {
  const frames = useMemo(makeFrames, []);
  const [fi, setFi] = useState(0);
  const [table, setTable] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"learn" | "forward" | "done">("learn");
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [lit, setLit] = useState<number[]>([]);

  const f = frames[fi];
  const src = host(f.src);
  const dstHost = f.dst === "broadcast" ? null : host(f.dst);
  const knowsDst = dstHost ? table[dstHost.mac] != null : false;
  // La tabla correcta DESPUÉS de aprender (se usa para decidir).
  const correctFwd = f.dst === "broadcast" || !knowsDst ? "flood" : `p${table[dstHost!.mac]}`;

  const learnOpts = useMemo(() => {
    const fr = frames[fi], s = host(fr.src), d = fr.dst === "broadcast" ? null : host(fr.dst);
    return shuffle([
      { k: "src", t: `${s.mac.slice(0, 8)}… está en Fa0/${s.port}` },
      ...(d ? [{ k: "dst", t: `${d.mac.slice(0, 8)}… está en Fa0/${d.port}` }] : []),
      { k: "none", t: "Nada, solo reenvía" },
    ]);
  }, [frames, fi]);

  const learn = (choice: string) => {
    if (step !== "learn") return;
    if (choice !== "src") {
      setMissed(true); void haptic("error");
      setMsg({ ok: false, text: choice === "dst" ? "El switch NO aprende la MAC de destino (aún no sabe dónde está). Aprende la MAC de ORIGEN y el puerto por donde entró." : "Sí aprende algo: siempre anota la MAC de origen con el puerto de entrada." });
      return;
    }
    if (!missed) setScore((s) => s + 1);
    setMissed(false); setMsg(null);
    setTable((t) => ({ ...t, [src.mac]: src.port }));
    setStep("forward"); void haptic("tap");
  };

  const forward = (choice: string) => {
    if (step !== "forward") return;
    if (choice !== correctFwd) {
      setMissed(true); void haptic("error");
      setMsg({ ok: false, text: f.dst === "broadcast"
        ? "Las tramas de broadcast se envían por TODOS los puertos excepto por el que entraron."
        : knowsDst ? `La MAC ${dstHost!.mac} ya está en la tabla en el puerto ${table[dstHost!.mac]}: se envía solo por ahí.`
        : `La MAC ${dstHost!.mac} NO está en la tabla: el switch inunda la trama por todos los puertos menos el de entrada (puerto ${src.port}).` });
      return;
    }
    if (!missed) setScore((s) => s + 1);
    setMissed(false);
    setLit(correctFwd === "flood" ? [1, 2, 3, 4].filter((p) => p !== src.port) : [Number(correctFwd.slice(1))]);
    setMsg({ ok: true, text: correctFwd === "flood" ? "Inundada por todos los puertos excepto el de entrada." : "Reenviada solo al puerto correcto: ¡filtrado eficiente!" });
    setStep("done"); void haptic("success");
  };

  const next = () => {
    if (fi + 1 >= frames.length) return onFinish({ score, max: MAX, summary: "Tabla MAC completa" });
    setFi(fi + 1); setStep("learn"); setMsg(null); setLit([]); setMissed(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={(fi + (step === "done" ? 1 : 0)) / frames.length} tint="bg-brand" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
      </div>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-brand">Trama {fi + 1} de {frames.length}</p>

      {/* Switch con 4 puertos y sus PCs */}
      <div className="my-3 rounded-2xl bg-surface p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {HOSTS.map((h) => (
            <div key={h.id} className="flex flex-col items-center gap-1">
              <span className={clsx("grid size-11 place-items-center rounded-xl", h.id === f.src ? "bg-warn text-white" : dstHost?.id === h.id ? "bg-ok/20 text-ok" : "bg-fill text-muted")}><Monitor size={22} aria-hidden /></span>
              <span className="text-[13px] font-semibold">PC-{h.id}</span>
              <span className="font-mono text-[9px] text-muted">{h.mac.slice(0, 8)}…</span>
              <span className={clsx("h-5 w-1 rounded-full transition-colors", lit.includes(h.port) ? "bg-ok" : h.id === f.src ? "bg-warn" : "bg-border")} aria-hidden />
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-4 gap-2 rounded-xl bg-[#2c2c2e] p-2">
          {[1, 2, 3, 4].map((p) => (
            <div key={p} className={clsx("rounded-md py-1 text-center font-mono text-[12px] font-bold", lit.includes(p) ? "bg-ok text-white" : p === src.port ? "bg-warn text-white" : "bg-black/40 text-white/70")}>Fa0/{p}</div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-warn/12 p-4 font-mono text-[14px]">
        <div><span className="text-muted">Origen: </span><b>{src.mac}</b> (PC-{src.id}, entra por Fa0/{src.port})</div>
        <div><span className="text-muted">Destino: </span><b>{f.dst === "broadcast" ? `${BCAST} (broadcast)` : `${dstHost!.mac} (PC-${dstHost!.id})`}</b></div>
      </div>

      {step === "learn" && (
        <>
          <p className="mb-2 font-semibold">1. ¿Qué anota el switch en su tabla?</p>
          <div className="grid gap-2">
            {learnOpts.map((o) => (
              <button key={o.k} onClick={() => learn(o.k)} className="pressable min-h-12 rounded-xl bg-surface px-4 text-left font-mono text-[15px] ring-1 ring-border/60">{o.t}</button>
            ))}
          </div>
        </>
      )}
      {step === "forward" && (
        <>
          <p className="mb-2 font-semibold">2. ¿Por dónde envía la trama?</p>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].filter((p) => p !== src.port).map((p) => (
              <button key={p} onClick={() => forward(`p${p}`)} className="pressable min-h-12 rounded-xl bg-surface font-semibold ring-1 ring-border/60">Solo por Fa0/{p}</button>
            ))}
            <button onClick={() => forward("flood")} className="pressable min-h-12 rounded-xl bg-surface font-semibold ring-1 ring-border/60">Inundar (todos menos Fa0/{src.port})</button>
          </div>
        </>
      )}
      {msg && (step === "done"
        ? <Feedback ok onNext={next} nextLabel={fi + 1 >= frames.length ? "Ver resultados" : "Siguiente trama"}>{msg.text}</Feedback>
        : <p className="mt-3 rounded-xl bg-danger/10 p-3 text-[15px]" role="alert">{msg.text}</p>)}

      <div className="mt-6">
        <Group header="Tabla de direcciones MAC" footer={Object.keys(table).length === 0 ? "Vacía: el switch acaba de encender." : undefined}>
          {Object.entries(table).map(([mac, port]) => (
            <Row key={mac} title={<span className="font-mono text-[15px]">{mac}</span>} trailing={<span className="font-mono">Fa0/{port}</span>} />
          ))}
        </Group>
      </div>
    </div>
  );
}
