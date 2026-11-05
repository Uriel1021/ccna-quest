/**
 * Mini intérprete de Cisco IOS para enseñar los modos y comandos básicos.
 * Admite abreviaturas (conf t, int vlan 1, no shut, copy run start), "?" y errores al estilo IOS.
 */
export type Mode = "user" | "priv" | "config" | "config-if";
export type CliState = {
  mode: Mode; hostname: string; secret: string | null; iface: string | null;
  vlanIp: string | null; vlanMask: string | null; vlanUp: boolean; savedSnapshot: string | null;
};
export const initialCli = (): CliState => ({ mode: "user", hostname: "Switch", secret: null, iface: null, vlanIp: null, vlanMask: null, vlanUp: false, savedSnapshot: null });

type Kw = { kw: string; min: number; optional?: boolean; help: string };
type Param = { param: "word" | "ip" | "num"; help: string };
type Tok = Kw | Param;
type Cmd = { modes: Mode[]; toks: Tok[]; run: (args: string[], s: CliState) => { s: CliState; out?: string[] } };

const K = (kw: string, min: number, help: string, optional = false): Kw => ({ kw, min, help, optional });
const P = (param: Param["param"], help: string): Param => ({ param, help });

export const prompt = (s: CliState) =>
  `${s.hostname}${s.mode === "user" ? ">" : s.mode === "priv" ? "#" : s.mode === "config" ? "(config)#" : "(config-if)#"}`;

export function runningConfig(s: CliState) {
  return [
    "Building configuration...", "", "Current configuration : 1024 bytes", "!",
    `hostname ${s.hostname}`, "!",
    ...(s.secret ? ["enable secret 5 $1$mERr$9cTjUIEqNGurQiFU.ZeCi1", "!"] : []),
    "interface Vlan1",
    ...(s.vlanIp ? [` ip address ${s.vlanIp} ${s.vlanMask}`] : [" no ip address"]),
    ...(s.vlanUp ? [] : [" shutdown"]),
    "!", "end",
  ];
}
const snapshot = (s: CliState) => JSON.stringify([s.hostname, s.secret, s.vlanIp, s.vlanMask, s.vlanUp]);
export const isSaved = (s: CliState) => s.savedSnapshot === snapshot(s);

const isIp = (x: string) => /^(\d{1,3})(\.\d{1,3}){3}$/.test(x) && x.split(".").every((o) => Number(o) <= 255);

const CMDS: Cmd[] = [
  { modes: ["user"], toks: [K("enable", 2, "Entrar al modo EXEC privilegiado")], run: (_, s) => ({ s: { ...s, mode: "priv" } }) },
  { modes: ["priv"], toks: [K("disable", 4, "Volver al modo EXEC usuario")], run: (_, s) => ({ s: { ...s, mode: "user" } }) },
  { modes: ["priv"], toks: [K("configure", 4, "Entrar al modo de configuración"), K("terminal", 1, "Configurar desde la terminal", true)],
    run: (_, s) => ({ s: { ...s, mode: "config" }, out: ["Enter configuration commands, one per line.  End with CNTL/Z."] }) },
  { modes: ["priv"], toks: [K("show", 2, "Mostrar información"), K("running-config", 3, "Configuración en uso (RAM)")], run: (_, s) => ({ s, out: runningConfig(s) }) },
  { modes: ["priv"], toks: [K("copy", 3, "Copiar archivos"), K("running-config", 3, "Origen: configuración en uso"), K("startup-config", 3, "Destino: configuración de arranque (NVRAM)")],
    run: (_, s) => ({ s: { ...s, savedSnapshot: snapshot(s) }, out: ["Destination filename [startup-config]? ", "Building configuration...", "[OK]"] }) },
  { modes: ["priv"], toks: [K("write", 2, "Guardar la configuración"), K("memory", 3, "En la NVRAM", true)],
    run: (_, s) => ({ s: { ...s, savedSnapshot: snapshot(s) }, out: ["Building configuration...", "[OK]"] }) },
  { modes: ["config"], toks: [K("hostname", 4, "Cambiar el nombre del equipo"), P("word", "Nuevo nombre")],
    run: ([n], s) => ({ s: { ...s, hostname: n } }) },
  { modes: ["config"], toks: [K("enable", 2, "Opciones del modo privilegiado"), K("secret", 3, "Contraseña cifrada del modo privilegiado"), P("word", "La contraseña")],
    run: ([pw], s) => ({ s: { ...s, secret: pw } }) },
  { modes: ["config"], toks: [K("interface", 3, "Configurar una interfaz"), K("vlan", 2, "Interfaz virtual de VLAN"), P("num", "Número de VLAN")],
    run: ([n], s) => ({ s: { ...s, mode: "config-if", iface: `Vlan${n}` } }) },
  { modes: ["config-if"], toks: [K("ip", 2, "Opciones de IP"), K("address", 3, "Asignar dirección IP"), P("ip", "Dirección IP"), P("ip", "Máscara de subred")],
    run: ([ip, mask], s) => ({ s: s.iface === "Vlan1" ? { ...s, vlanIp: ip, vlanMask: mask } : s }) },
  { modes: ["config-if"], toks: [K("no", 2, "Negar un comando"), K("shutdown", 4, "Encender la interfaz")],
    run: (_, s) => ({ s: { ...s, vlanUp: s.iface === "Vlan1" ? true : s.vlanUp }, out: s.iface === "Vlan1" && !s.vlanUp ? ["%LINK-5-CHANGED: Interface Vlan1, changed state to up", "%LINEPROTO-5-UPDOWN: Line protocol on Interface Vlan1, changed state to up"] : [] }) },
  { modes: ["config-if"], toks: [K("shutdown", 4, "Apagar la interfaz")],
    run: (_, s) => ({ s: { ...s, vlanUp: s.iface === "Vlan1" ? false : s.vlanUp }, out: ["%LINK-5-CHANGED: Interface Vlan1, changed state to administratively down"] }) },
  { modes: ["config", "config-if"], toks: [K("exit", 3, "Salir al modo anterior")],
    run: (_, s) => ({ s: { ...s, mode: s.mode === "config-if" ? "config" : "priv", iface: null } }) },
  { modes: ["config", "config-if"], toks: [K("end", 3, "Volver al modo privilegiado")], run: (_, s) => ({ s: { ...s, mode: "priv", iface: null } }) },
  { modes: ["user", "priv"], toks: [K("exit", 3, "Cerrar la sesión")], run: (_, s) => ({ s, out: ["(Cerrar la sesión no está disponible en este simulador)"] }) },
];

const kwMatch = (t: Kw, w: string) => w.length >= Math.min(t.min, t.kw.length) && t.kw.startsWith(w.toLowerCase());

/** Normaliza "vlan1" → "vlan 1" e "int vlan1" igual que IOS. */
const tokenize = (line: string) => line.trim().replace(/\b(vlan)(\d+)\b/i, "$1 $2").split(/\s+/).filter(Boolean);

export type ExecResult = { s: CliState; out: string[]; ok: boolean };

export function exec(line: string, s: CliState): ExecResult {
  const raw = line.trim();
  const echo = `${prompt(s)}${line}`;
  if (!raw) return { s, out: [prompt(s)], ok: true };
  if (raw.endsWith("?")) return { s, out: [echo, ...help(raw.slice(0, -1), s)], ok: true };

  const words = tokenize(raw);
  const avail = CMDS.filter((c) => c.modes.includes(s.mode));
  // Encuentra el comando que mejor encaja.
  let bestFail = { pos: 0, kind: "invalid" as "invalid" | "incomplete" | "ambiguous" };
  for (const c of avail) {
    const args: string[] = [];
    let wi = 0, ok = true;
    for (const t of c.toks) {
      const w = words[wi];
      if ("kw" in t) {
        if (w === undefined) { if (t.optional) continue; ok = false; if (wi > bestFail.pos || bestFail.kind === "invalid") bestFail = { pos: wi, kind: "incomplete" }; break; }
        if (!kwMatch(t, w)) { if (t.optional) continue; ok = false; if (wi >= bestFail.pos && bestFail.kind !== "incomplete") bestFail = { pos: wi, kind: "invalid" }; break; }
        wi++;
      } else {
        if (w === undefined) { ok = false; bestFail = { pos: wi, kind: "incomplete" }; break; }
        const valid = t.param === "ip" ? isIp(w) : t.param === "num" ? /^\d+$/.test(w) : true;
        if (!valid) { ok = false; bestFail = { pos: wi, kind: "invalid" }; break; }
        args.push(w); wi++;
      }
    }
    if (ok && wi === words.length) {
      const r = c.run(args, s);
      return { s: r.s, out: [echo, ...(r.out ?? [])], ok: true };
    }
    if (ok && wi < words.length && wi >= bestFail.pos) bestFail = { pos: wi, kind: "invalid" };
  }
  // Primera palabra ambigua (p. ej. "e" en modo privilegiado)
  const firsts = avail.map((c) => c.toks[0] as Kw).filter((t) => t.kw.startsWith(words[0].toLowerCase()));
  if (words.length === 1 && new Set(firsts.map((f) => f.kw)).size > 1 && firsts.every((f) => words[0].length < f.min)) {
    return { s, out: [echo, `% Ambiguous command:  "${raw}"`], ok: false };
  }
  if (bestFail.kind === "incomplete") return { s, out: [echo, "% Incomplete command."], ok: false };
  const col = prompt(s).length + raw.split(/\s+/).slice(0, bestFail.pos).join(" ").length + (bestFail.pos > 0 ? 1 : 0);
  return { s, out: [echo, " ".repeat(col) + "^", "% Invalid input detected at '^' marker."], ok: false };
}

/** Opciones posibles para la siguiente palabra (como "?" en IOS). */
export function nextWords(partial: string, s: CliState): { word: string; help: string }[] {
  const words = tokenize(partial);
  const endsWithSpace = /\s$/.test(partial) || partial === "";
  const done = endsWithSpace ? words : words.slice(0, -1);
  const cur = endsWithSpace ? "" : (words[words.length - 1] ?? "");
  const out = new Map<string, string>();
  for (const c of CMDS.filter((x) => x.modes.includes(s.mode))) {
    let ti = 0, ok = true;
    for (const w of done) {
      let t = c.toks[ti];
      while (t && "kw" in t && t.optional && !kwMatch(t, w)) t = c.toks[++ti];
      if (!t) { ok = false; break; }
      if ("kw" in t ? !kwMatch(t, w) : false) { ok = false; break; }
      ti++;
    }
    if (!ok) continue;
    const t = c.toks[ti];
    if (!t) { if (!cur) out.set("<cr>", "Ejecutar"); continue; }
    if ("kw" in t) { if (t.kw.startsWith(cur.toLowerCase())) out.set(t.kw, t.help); }
    else if (!cur) out.set(`<${t.param === "ip" ? "A.B.C.D" : t.param === "num" ? "1-4094" : "WORD"}>`, t.help);
  }
  return [...out].map(([word, help]) => ({ word, help }));
}

function help(partial: string, s: CliState) {
  const opts = nextWords(partial, s);
  if (opts.length === 0) return ["% Unrecognized command"];
  const w = Math.max(...opts.map((o) => o.word.length)) + 2;
  return opts.map((o) => `  ${o.word.padEnd(w)}${o.help}`);
}
