/**
 * Generador de preguntas de subnetting. Cada pregunta trae su explicación paso a paso
 * usando el método del "tamaño de bloque", que es el que se enseña en CCNA.
 */
import { broadcastOf, intToIp, ipToInt, maskStr, networkOf, prefixForHosts, usableHosts } from "@/lib/net/ip";
import { pick, randInt, shuffle } from "@/lib/feedback";

export type SubnetQ = { prompt: string; subject?: string; options: string[]; answer: string; explain: string };

const block = (p: number) => 2 ** (32 - p);                // para /24../30, tamaño de bloque del 4.º octeto
const lastOctetMask = (p: number) => 256 - block(p);

function opts(answer: string, candidates: string[]): string[] {
  const set = new Set([answer]);
  for (const c of shuffle(candidates)) { if (c !== answer) set.add(c); if (set.size === 4) break; }
  return shuffle([...set]);
}

function randomHost(p: number) {
  const base = `192.168.${randInt(0, 99)}`;
  const ip = ipToInt(`${base}.${randInt(1, 254)}`);
  const net = networkOf(ip, p), bc = broadcastOf(ip, p);
  // Evita caer justo en la red o el broadcast: queremos un host normal.
  if (ip === net || ip === bc) return randomHost(p);
  return ip;
}

function blockSteps(p: number) {
  const b = block(p);
  const starts = Array.from({ length: Math.min(256 / b, 6) }, (_, i) => i * b);
  return `Con /${p} la máscara termina en ${lastOctetMask(p)}, así que el bloque es 256 − ${lastOctetMask(p)} = ${b}. Las redes empiezan en ${starts.join(", ")}${256 / b > 6 ? "…" : ""}.`;
}

const generators: (() => SubnetQ)[] = [
  // 1. Hosts utilizables
  () => {
    const p = randInt(24, 30);
    const h = usableHosts(p);
    return {
      prompt: `¿Cuántos hosts utilizables tiene una red /${p}?`,
      options: opts(String(h), [String(2 ** (32 - p)), String(usableHosts(p - 1)), String(usableHosts(Math.min(30, p + 1))), String(h - 2), String(h + 1)]),
      answer: String(h),
      explain: `Quedan 32 − ${p} = ${32 - p} bits para hosts → 2^${32 - p} = ${2 ** (32 - p)} direcciones. Se restan 2 (la de red y la de broadcast): ${h}.`,
    };
  },
  // 2. Máscara a partir del prefijo
  () => {
    const p = pick([16, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
    return {
      prompt: `¿Qué máscara de subred corresponde a /${p}?`,
      options: opts(maskStr(p), [maskStr(p - 1), maskStr(Math.min(30, p + 1)), maskStr(p === 24 ? 16 : 24), maskStr(Math.max(8, p - 2))]),
      answer: maskStr(p),
      explain: `/${p} significa ${p} bits en 1 de izquierda a derecha. Cada octeto completo vale 255; ${p % 8 === 0 ? "aquí todos los octetos son completos o cero" : `el octeto incompleto tiene ${p % 8} bits encendidos (${[128, 64, 32, 16, 8, 4, 2].slice(0, p % 8).join("+")} = ${256 - 2 ** (8 - (p % 8))})`}. Resultado: ${maskStr(p)}.`,
    };
  },
  // 3. Dirección de red
  () => {
    const p = randInt(25, 29);
    const ip = randomHost(p), net = networkOf(ip, p), b = block(p);
    return {
      prompt: "¿A qué red pertenece este host?",
      subject: `${intToIp(ip)}/${p}`,
      options: opts(intToIp(net), [intToIp(net + b), intToIp(Math.max(0, net - b)), intToIp(ip), intToIp(networkOf(ip, 24)), intToIp(net + 1)]),
      answer: intToIp(net),
      explain: `${blockSteps(p)} El ${ip & 255} cae en el bloque que empieza en ${net & 255}, así que la red es ${intToIp(net)}.`,
    };
  },
  // 4. Broadcast
  () => {
    const p = randInt(25, 29);
    const ip = randomHost(p), bc = broadcastOf(ip, p), net = networkOf(ip, p), b = block(p);
    return {
      prompt: "¿Cuál es la dirección de broadcast de la red de este host?",
      subject: `${intToIp(ip)}/${p}`,
      options: opts(intToIp(bc), [intToIp(net), intToIp(bc - 1), intToIp(Math.min(0xffffffff, bc + b)), intToIp(broadcastOf(ip, 24))]),
      answer: intToIp(bc),
      explain: `${blockSteps(p)} La red es ${intToIp(net)}; el broadcast es la última dirección del bloque: ${net & 255} + ${b} − 1 = ${bc & 255} → ${intToIp(bc)}.`,
    };
  },
  // 5. Prefijo para N hosts
  () => {
    const hosts = pick([5, 10, 14, 20, 25, 30, 40, 50, 60, 100, 120, 200, 250, 500]);
    const p = prefixForHosts(hosts);
    return {
      prompt: `Un laboratorio necesita ${hosts} computadoras. ¿Qué prefijo es el más pequeño que alcanza?`,
      options: opts(`/${p}`, [`/${p + 1}`, `/${p - 1}`, `/${p + 2}`, `/${p - 2}`]),
      answer: `/${p}`,
      explain: `/${p} da ${usableHosts(p)} hosts utilizables (suficiente para ${hosts}). /${p + 1} solo daría ${usableHosts(p + 1)}, que no alcanza. Elegimos la red más pequeña que cubra la necesidad para no desperdiciar direcciones.`,
    };
  },
  // 6. ¿Misma red?
  () => {
    const p = randInt(25, 28);
    const a = randomHost(p);
    const same = Math.random() < 0.5;
    const b = same ? networkOf(a, p) + randInt(1, block(p) - 2) : randomHost(p);
    const really = networkOf(a, p) === networkOf(b, p);
    return {
      prompt: `¿Están estos dos equipos en la misma red /${p}?`,
      subject: `${intToIp(a)}  y  ${intToIp(b)}`,
      options: ["Sí", "No"],
      answer: really ? "Sí" : "No",
      explain: `${blockSteps(p)} ${intToIp(a)} está en la red ${intToIp(networkOf(a, p))} y ${intToIp(b)} en la red ${intToIp(networkOf(b, p))}: ${really ? "es la misma, se comunican sin router." : "son distintas, necesitan un router para hablar."}`,
    };
  },
];

export function makeSubnetQuiz(count = 8): SubnetQ[] {
  // Garantiza variedad: cada tipo al menos una vez y el resto al azar.
  const order = shuffle([0, 1, 2, 3, 4, 5, ...Array.from({ length: Math.max(0, count - 6) }, () => randInt(0, 5))]);
  return order.slice(0, count).map((i) => generators[i]());
}
