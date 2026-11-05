"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { ShieldAlert } from "lucide-react";
import { haptic, shuffle } from "@/lib/feedback";
import { ProgressBar, type GameProps } from "./GameFrame";
import { Lives } from "./TimerBar";

const D = {
  training: "🎓 Capacitar a los usuarios",
  strongpw: "🔑 Contraseñas fuertes y bloqueo tras intentos fallidos",
  ssh: "🔒 Usar SSH en lugar de Telnet",
  antivirus: "🦠 Antivirus y parches al día",
  firewall: "🧱 Firewall que filtre el tráfico",
  backup: "💾 Copias de seguridad",
  physical: "🚪 Cuarto de equipos con llave",
  encrypt: "🔐 service password-encryption",
  vpn: "🛡️ VPN (túnel cifrado)",
  disable: "⛔ Apagar servicios y puertos sin usar",
} as const;
type DKey = keyof typeof D;

const ATTACKS: { name: string; desc: string; fix: DKey; why: string }[] = [
  { name: "Phishing", desc: "Un correo falso del \"banco\" pide tu contraseña.", fix: "training", why: "El phishing engaña a personas: la mejor defensa es enseñar a reconocer correos falsos." },
  { name: "Fuerza bruta", desc: "Un bot prueba miles de contraseñas en el router.", fix: "strongpw", why: "Contraseñas largas y bloquear tras varios intentos (login block-for) frenan la fuerza bruta." },
  { name: "Espionaje de Telnet", desc: "Alguien captura tu contraseña de administración viajando en texto plano.", fix: "ssh", why: "Telnet envía todo sin cifrar; SSH cifra la sesión." },
  { name: "Gusano", desc: "Un programa se copia solo de equipo en equipo aprovechando una falla.", fix: "antivirus", why: "Los parches cierran la falla y el antivirus detecta el gusano." },
  { name: "Denegación de servicio (DoS)", desc: "Una avalancha de tráfico tumba tu servidor web.", fix: "firewall", why: "Un firewall puede filtrar y limitar el tráfico malicioso antes de que llegue." },
  { name: "Ransomware", desc: "Tus archivos aparecen cifrados y piden rescate.", fix: "backup", why: "Con copias de seguridad recuperas tus archivos sin pagar." },
  { name: "Intruso físico", desc: "Alguien entra al cuarto y conecta su laptop al puerto de consola.", fix: "physical", why: "La seguridad empieza en lo físico: los equipos deben estar bajo llave." },
  { name: "Contraseñas a la vista", desc: "Un vistazo a la configuración muestra las contraseñas en texto plano.", fix: "encrypt", why: "service password-encryption cifra las contraseñas que se ven en la configuración." },
  { name: "Wi-Fi público", desc: "En la cafetería alguien intercepta tu conexión.", fix: "vpn", why: "Una VPN cifra todo tu tráfico, aunque la red sea insegura." },
  { name: "Reconocimiento", desc: "Un atacante escanea tu red buscando puertos abiertos.", fix: "disable", why: "Menos servicios encendidos = menos puertas para atacar." },
  { name: "Troyano", desc: "Un \"juego gratis\" descargado esconde un programa espía.", fix: "antivirus", why: "El antivirus detecta programas maliciosos disfrazados." },
  { name: "Ingeniería social", desc: "Alguien llama fingiendo ser de soporte y pide tu usuario.", fix: "training", why: "Las personas capacitadas no comparten datos por teléfono." },
  { name: "Acceso no autorizado", desc: "Un exalumno entra al switch con la contraseña de fábrica.", fix: "strongpw", why: "Cambia las contraseñas por defecto y usa contraseñas fuertes." },
  { name: "Puerto abierto olvidado", desc: "El servidor HTTP de un router quedó encendido sin usarse.", fix: "disable", why: "Apaga los servicios que no usas (no ip http server)." },
];
const GOAL = 12;

export default function DefiendeRed({ onFinish }: GameProps) {
  const queue = useMemo(() => shuffle(ATTACKS), []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [left, setLeft] = useState(1);
  const a = queue[i % queue.length];
  const options = useMemo(() => shuffle([a.fix, ...shuffle((Object.keys(D) as DKey[]).filter((k) => k !== a.fix)).slice(0, 3)]), [a]);
  const missRef = useRef<() => void>(() => {});

  // El ataque avanza: entre más ataques detienes, menos tiempo tienes (12 s → 6 s).
  const seconds = Math.max(6, 12 - i * 0.5);
  useEffect(() => {
    if (flash) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const l = 1 - (now - start) / (seconds * 1000);
      setLeft(Math.max(0, l));
      if (l <= 0) missRef.current(); else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, flash, seconds]);

  const advance = (sc: number, lv: number) => {
    setFlash(null);
    if (lv <= 0 || sc >= GOAL) return onFinish({ score: sc, max: GOAL, summary: lv <= 0 ? "La red cayó… ¡inténtalo otra vez!" : "¡Red protegida!" });
    setI((x) => x + 1);
  };
  const fail = (text: string) => {
    const lv = lives - 1;
    setLives(lv); void haptic("error");
    setFlash({ ok: false, text });
    setTimeout(() => advance(score, lv), 2200);
  };
  missRef.current = () => fail(`¡El ataque llegó! La defensa era: ${D[a.fix]}. ${a.why}`);

  const defend = (k: DKey) => {
    if (flash) return;
    if (k === a.fix) {
      const sc = score + 1;
      setScore(sc); void haptic("success");
      setFlash({ ok: true, text: a.why });
      setTimeout(() => advance(sc, lives), 1400);
    } else fail(`Esa no lo detiene. La defensa era: ${D[a.fix]}. ${a.why}`);
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={score / GOAL} tint="bg-danger" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{score}/{GOAL}</span>
        <Lives n={lives} />
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-surface p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-danger/15 text-danger"><ShieldAlert size={26} aria-hidden /></span>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-danger">Ataque entrante</p>
            <p className="text-[22px] font-bold leading-tight">{a.name}</p>
          </div>
        </div>
        <p className="text-[17px]">{a.desc}</p>
        {/* Distancia del ataque a tu red */}
        <div className="mt-4 flex items-center gap-2 text-[20px]" aria-hidden>
          <span>💀</span>
          <div className="relative h-2 flex-1 rounded-full bg-fill">
            <div className={clsx("absolute inset-y-0 left-0 rounded-full", left < 0.3 ? "bg-danger" : "bg-warn")} style={{ width: `${(1 - left) * 100}%` }} />
          </div>
          <span>🖥️</span>
        </div>
      </div>

      {flash ? (
        <div className={clsx("animate-fade mt-4 rounded-2xl p-4 text-[15px]", flash.ok ? "bg-ok/12" : "bg-danger/10")} role="status">
          <p className={clsx("font-semibold", flash.ok ? "text-ok" : "text-danger")}>{flash.ok ? "🛡️ ¡Bloqueado!" : "💥 ¡Te dieron!"}</p>
          <p className="mt-1">{flash.text}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {options.map((k) => (
            <button key={k} onClick={() => defend(k)} className="pressable min-h-14 rounded-xl bg-surface px-4 text-left text-[16px] font-semibold ring-1 ring-border/60">{D[k]}</button>
          ))}
        </div>
      )}
    </div>
  );
}
