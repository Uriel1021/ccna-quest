import { Home, BookOpen, Gamepad2, ClipboardCheck, Timer, type LucideIcon } from "lucide-react";
import type { Tint } from "@/components/ui/apple";
import { gameBySlug } from "@/content/games";

/* H6 Reconocer antes que recordar: icono + texto siempre visibles, nunca solo icono. */
export type NavItem = { href: string; label: string; icon: LucideIcon; hint: string; tint: Tint };

export const NAV: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home, hint: "Tu progreso y qué sigue", tint: "blue" },
  { href: "/aprender", label: "Aprender", icon: BookOpen, hint: "Los 17 módulos explicados fácil", tint: "orange" },
  { href: "/juegos", label: "Juegos", icon: Gamepad2, hint: "Aprende jugando: OSI, subredes, rutas", tint: "pink" },
  { href: "/examenes", label: "Exámenes", icon: ClipboardCheck, hint: "Simuladores con preguntas aleatorias", tint: "green" },
  { href: "/enfoque", label: "Enfoque", icon: Timer, hint: "Sesión de estudio de 1 hora sin distracciones", tint: "indigo" },
];

/** Nombre legible de un segmento de URL (para el botón "Atrás" estilo iOS). */
export function labelFor(segment: string): string {
  const m = /^modulo-(\d+)$/.exec(segment);
  if (m) return `Módulo ${m[1]}`;
  const game = gameBySlug(segment);
  if (game) return game.title;
  return NAV.find((n) => n.href === `/${segment}`)?.label ?? decodeURIComponent(segment);
}
