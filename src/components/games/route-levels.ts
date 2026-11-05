/**
 * Niveles de "Ruta del paquete". Cada router tiene una tabla de routing real;
 * el jugador elige la interfaz de salida y gana la coincidencia más larga.
 */
import { longestPrefixMatch } from "@/lib/net/ip";

export type NodeKind = "pc" | "router" | "server";
export type RNode = { id: string; label: string; kind: NodeKind; x: number; y: number; ip?: string };
/** Enlace entre dos nodos; `ifA`/`ifB` = nombre de la interfaz en cada extremo (solo routers). */
export type RLink = { a: string; b: string; ifA?: string; ifB?: string };
export type RouteKind = "conectada" | "estática" | "por defecto";
export type RouteEntry = { net: string; iface: string; kind: RouteKind };
export type Packet = { start: string; dst: string; to: string };
export type Level = { name: string; intro: string; nodes: RNode[]; links: RLink[]; tables: Record<string, RouteEntry[]>; packets: Packet[] };

export const LEVELS: Level[] = [
  {
    name: "Nivel 1 · Tres routers",
    intro: "Cada router conoce sus redes conectadas y algunas rutas. Si no conoce el destino, usa la ruta por defecto.",
    nodes: [
      { id: "A", label: "PC-A", kind: "pc", x: 40, y: 150, ip: "192.168.1.10" },
      { id: "R1", label: "R1", kind: "router", x: 135, y: 150 },
      { id: "R2", label: "R2", kind: "router", x: 255, y: 70 },
      { id: "R3", label: "R3", kind: "router", x: 255, y: 230 },
      { id: "S", label: "Servidor", kind: "server", x: 365, y: 70, ip: "10.0.3.20" },
      { id: "B", label: "PC-B", kind: "pc", x: 365, y: 230, ip: "172.16.5.9" },
    ],
    links: [
      { a: "R1", b: "A", ifA: "G0/0" },
      { a: "R1", b: "R2", ifA: "G0/1", ifB: "G0/0" },
      { a: "R1", b: "R3", ifA: "G0/2", ifB: "G0/0" },
      { a: "R2", b: "S", ifA: "G0/1" },
      { a: "R3", b: "B", ifA: "G0/1" },
      { a: "R2", b: "R3", ifA: "S0/0", ifB: "S0/0" },
    ],
    tables: {
      R1: [
        { net: "192.168.1.0/24", iface: "G0/0", kind: "conectada" },
        { net: "10.0.3.0/24", iface: "G0/1", kind: "estática" },
        { net: "172.16.5.0/24", iface: "G0/2", kind: "estática" },
      ],
      R2: [
        { net: "10.0.3.0/24", iface: "G0/1", kind: "conectada" },
        { net: "192.168.1.0/24", iface: "G0/0", kind: "estática" },
        { net: "0.0.0.0/0", iface: "S0/0", kind: "por defecto" },
      ],
      R3: [
        { net: "172.16.5.0/24", iface: "G0/1", kind: "conectada" },
        { net: "0.0.0.0/0", iface: "G0/0", kind: "por defecto" },
      ],
    },
    packets: [
      { start: "R1", dst: "10.0.3.20", to: "S" },
      { start: "R3", dst: "192.168.1.10", to: "A" },
      { start: "R2", dst: "172.16.5.9", to: "B" },
    ],
  },
  {
    name: "Nivel 2 · La ruta más específica",
    intro: "Ahora hay rutas que se enciman. Cuando varias coinciden, gana la de prefijo más grande (la más específica).",
    nodes: [
      { id: "A", label: "PC-A", kind: "pc", x: 40, y: 150, ip: "192.168.1.10" },
      { id: "R1", label: "R1", kind: "router", x: 135, y: 150 },
      { id: "R2", label: "R2", kind: "router", x: 255, y: 70 },
      { id: "R3", label: "R3", kind: "router", x: 255, y: 230 },
      { id: "S2", label: "Web", kind: "server", x: 365, y: 70, ip: "10.20.0.5" },
      { id: "S1", label: "Archivos", kind: "server", x: 365, y: 230, ip: "10.0.3.20" },
    ],
    links: [
      { a: "R1", b: "A", ifA: "G0/0" },
      { a: "R1", b: "R2", ifA: "G0/1", ifB: "G0/0" },
      { a: "R1", b: "R3", ifA: "G0/2", ifB: "G0/0" },
      { a: "R2", b: "S2", ifA: "G0/1" },
      { a: "R3", b: "S1", ifA: "G0/1" },
      { a: "R2", b: "R3", ifA: "S0/0", ifB: "S0/0" },
    ],
    tables: {
      R1: [
        { net: "192.168.1.0/24", iface: "G0/0", kind: "conectada" },
        { net: "10.0.0.0/8", iface: "G0/1", kind: "estática" },
        { net: "10.0.3.0/24", iface: "G0/2", kind: "estática" },
        { net: "0.0.0.0/0", iface: "G0/1", kind: "por defecto" },
      ],
      R2: [
        { net: "10.20.0.0/16", iface: "G0/1", kind: "conectada" },
        { net: "10.0.3.0/24", iface: "S0/0", kind: "estática" },
        { net: "0.0.0.0/0", iface: "G0/0", kind: "por defecto" },
      ],
      R3: [
        { net: "10.0.3.0/24", iface: "G0/1", kind: "conectada" },
        { net: "0.0.0.0/0", iface: "G0/0", kind: "por defecto" },
      ],
    },
    packets: [
      { start: "R1", dst: "10.0.3.20", to: "S1" },
      { start: "R1", dst: "10.20.0.5", to: "S2" },
      { start: "R2", dst: "10.0.3.20", to: "S1" },
      { start: "R2", dst: "192.168.1.10", to: "A" },
    ],
  },
];

/** Interfaces de un router con el vecino al que llevan. */
export function interfacesOf(level: Level, routerId: string) {
  return level.links.flatMap((l) => {
    if (l.a === routerId && l.ifA) return [{ iface: l.ifA, neighbor: l.b }];
    if (l.b === routerId && l.ifB) return [{ iface: l.ifB, neighbor: l.a }];
    return [];
  }).sort((x, y) => x.iface.localeCompare(y.iface));
}

/** La decisión correcta de un router para un destino. */
export function correctHop(level: Level, routerId: string, dst: string) {
  const route = longestPrefixMatch(level.tables[routerId], dst);
  if (!route) return undefined;
  const hop = interfacesOf(level, routerId).find((i) => i.iface === route.iface);
  return hop && { ...hop, route };
}

/** Recorrido completo (para validar los niveles y contar saltos). */
export function solvePath(level: Level, p: Packet): string[] {
  const path = [p.start];
  let at = p.start;
  for (let guard = 0; guard < 10; guard++) {
    const hop = correctHop(level, at, p.dst);
    if (!hop) break;
    path.push(hop.neighbor);
    at = hop.neighbor;
    if (level.nodes.find((n) => n.id === at)?.kind !== "router") break;
  }
  return path;
}

export const totalHops = (level: Level) => level.packets.reduce((s, p) => s + solvePath(level, p).length - 1, 0);
