"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Lightbulb, CornerDownLeft } from "lucide-react";
import { haptic } from "@/lib/feedback";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";
import { exec, initialCli, isSaved, nextWords, prompt, type CliState } from "./ios-cli";

type Mission = { title: string; detail: string; hint: string; done: (s: CliState) => boolean; learn: string };
const MISSIONS: Mission[] = [
  { title: "Entra al modo privilegiado", detail: "Ahora estás en modo usuario (>), solo puedes mirar. Sube al modo EXEC privilegiado (#).", hint: "enable", done: (s) => s.mode !== "user", learn: "El símbolo # indica modo privilegiado: desde aquí se puede ver todo y entrar a configurar." },
  { title: "Entra a configuración global", detail: "Para cambiar algo necesitas el modo de configuración global.", hint: "configure terminal   (o: conf t)", done: (s) => s.mode === "config" || s.mode === "config-if", learn: "(config)# es el modo de configuración global: lo que escribas cambia el equipo." },
  { title: "Ponle nombre: SW-Aula", detail: "Cambia el nombre del switch a SW-Aula para identificarlo en la red.", hint: "hostname SW-Aula", done: (s) => s.hostname.toLowerCase() === "sw-aula", learn: "El prompt cambió al instante: el hostname aparece en todos los modos." },
  { title: "Protege el modo privilegiado", detail: "Configura la contraseña cifrada \"class\" para entrar al modo privilegiado.", hint: "enable secret class", done: (s) => s.secret === "class", learn: "enable secret guarda la contraseña cifrada (más segura que enable password)." },
  { title: "Dale una IP para administrarlo", detail: "Entra a la interfaz VLAN 1, asígnale 192.168.1.2 con máscara 255.255.255.0 y enciéndela.", hint: "interface vlan 1  →  ip address 192.168.1.2 255.255.255.0  →  no shutdown", done: (s) => s.vlanIp === "192.168.1.2" && s.vlanMask === "255.255.255.0" && s.vlanUp, learn: "La SVI (interfaz VLAN 1) permite administrar el switch a distancia, por ejemplo con SSH." },
  { title: "Guarda tu trabajo", detail: "Si se va la luz, todo se perdería. Regresa al modo privilegiado y copia la configuración en uso a la de arranque.", hint: "end  →  copy running-config startup-config   (o: copy run start)", done: (s) => s.mode === "priv" && isSaved(s), learn: "running-config vive en la RAM (se borra al apagar); startup-config está en la NVRAM y se carga al encender." },
];
const MAX = MISSIONS.length * 2;

export default function TerminalIos({ onFinish }: GameProps) {
  const [s, setS] = useState<CliState>(initialCli);
  const [lines, setLines] = useState<string[]>(["", "Switch con IOS (simulado) — escribe ? para ver los comandos", ""]);
  const [input, setInput] = useState("");
  const [mi, setMi] = useState(0);
  const [hinted, setHinted] = useState(false);
  const [score, setScore] = useState(0);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight }); }, [lines]);

  const submit = (line: string) => {
    if (celebrate) return;
    const r = exec(line, s);
    setLines((l) => [...l, ...r.out].slice(-200));
    setS(r.s);
    setInput("");
    if (line.trim()) setHistory((h) => [...h, line]);
    setHIdx(-1);
    void haptic(r.ok ? "tap" : "error");
    const m = MISSIONS[mi];
    if (m.done(r.s)) {
      setScore((x) => x + (hinted ? 1 : 2));
      setCelebrate(m.learn);
      void haptic("success");
    }
  };
  const nextMission = () => {
    setCelebrate(null); setHinted(false);
    if (mi + 1 >= MISSIONS.length) return onFinish({ score, max: MAX, summary: "Switch configurado y guardado" });
    setMi(mi + 1);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const sugg = nextWords(input, s).filter((o) => !o.word.startsWith("<"));
  const placeholder = nextWords(input, s).find((o) => o.word.startsWith("<"));
  const m = MISSIONS[mi];

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={(mi + (celebrate ? 1 : 0)) / MISSIONS.length} tint="bg-muted" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score} pts</span>
      </div>

      <div className="mb-3 rounded-2xl bg-surface p-4 shadow-sm">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Misión {mi + 1} de {MISSIONS.length}</p>
        <p className="text-[19px] font-bold">{m.title}</p>
        <p className="mt-1 text-[15px] text-muted">{m.detail}</p>
        {hinted ? (
          <p className="mt-2 rounded-lg bg-warn/12 px-3 py-2 font-mono text-[14px]">💡 {m.hint}</p>
        ) : (
          <button onClick={() => setHinted(true)} className="mt-2 inline-flex items-center gap-1 text-[15px] font-semibold text-brand"><Lightbulb size={16} aria-hidden /> Pista (la misión vale 1 punto en vez de 2)</button>
        )}
      </div>

      {/* Terminal */}
      <div className="overflow-hidden rounded-2xl bg-[#1c1c1e] shadow-lg ring-1 ring-black/40" onClick={() => inputRef.current?.focus()}>
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" /><span className="size-3 rounded-full bg-[#febc2e]" /><span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[12px] text-white/50">Consola — {s.hostname}</span>
        </div>
        <div ref={screenRef} className="h-64 overflow-y-auto px-3 py-2 font-mono text-[12.5px] leading-relaxed text-[#e5e5ea] sm:h-72" role="log" aria-live="polite">
          {lines.map((l, i) => (
            <pre key={i} className={clsx("whitespace-pre-wrap [overflow-wrap:anywhere]", l.startsWith("%") && (l.includes("Invalid") || l.includes("Incomplete") || l.includes("Ambiguous")) ? "text-[#ff6961]" : l.startsWith("%") ? "text-[#ffd60a]" : "")}>{l || " "}</pre>
          ))}
          <form onSubmit={(e) => { e.preventDefault(); submit(input); }} className="flex items-center">
            <label htmlFor="cli" className="shrink-0 text-[#30d158]">{prompt(s)}</label>
            <input
              id="cli" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} autoFocus
              autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} enterKeyHint="send"
              aria-label="Comando" className="ml-1 min-w-0 flex-1 bg-transparent text-[#e5e5ea] caret-[#30d158] outline-none"
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" && history.length) { e.preventDefault(); const i = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1); setHIdx(i); setInput(history[i]); }
                if (e.key === "Tab" && sugg.length === 1) { e.preventDefault(); setInput(input.replace(/\S*$/, sugg[0].word + " ")); }
              }}
            />
          </form>
        </div>
      </div>

      {/* Teclado de sugerencias (para el celular) */}
      <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Sugerencias">
        {sugg.slice(0, 8).map((o) => (
          <button key={o.word} type="button" title={o.help} onClick={() => { setInput(input.replace(/\S*$/, o.word === "<cr>" ? "" : o.word + " ")); if (o.word === "<cr>") submit(input); inputRef.current?.focus(); }}
            className="pressable rounded-full bg-fill px-3 py-1.5 font-mono text-[14px] font-semibold">{o.word === "<cr>" ? "⏎ ejecutar" : o.word}</button>
        ))}
        {placeholder && <span className="font-mono text-[13px] text-muted">{placeholder.word}: {placeholder.help}</span>}
        <button type="button" onClick={() => submit(input + "?")} className="pressable rounded-full bg-fill px-3 py-1.5 font-mono text-[14px] font-semibold">?</button>
        <button type="button" onClick={() => submit(input)} className="pressable ml-auto inline-flex items-center gap-1 rounded-full bg-brand px-4 py-1.5 font-semibold text-white"><CornerDownLeft size={16} aria-hidden /> Enter</button>
      </div>

      {celebrate && <Feedback ok title="¡Misión cumplida!" onNext={nextMission} nextLabel={mi + 1 >= MISSIONS.length ? "Ver resultados" : "Siguiente misión"}>{celebrate}</Feedback>}
    </div>
  );
}
