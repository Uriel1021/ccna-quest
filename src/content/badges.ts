import { GAMES } from "./games";

export type Badge = { id: string; title: string; description: string; emoji: string };

export const BADGES: Badge[] = [
  { id: "primer-juego", title: "Primer paquete", description: "Terminaste tu primer minijuego.", emoji: "📦" },
  { id: "enfocado", title: "Enfocado", description: "Completaste una sesión de enfoque de 25 minutos o más.", emoji: "🎯" },
  { id: "hora-perfecta", title: "Hora perfecta", description: "Una hora de enfoque sin ninguna interrupción.", emoji: "⏱️" },
  { id: "maraton-de-estudio", title: "Maratón de estudio", description: "Completaste una sesión de 90 minutos o más.", emoji: "🏃" },
  ...GAMES.map((g) => ({
    id: `perfecto-${g.slug}`,
    title: `${g.title} perfecto`,
    description: `Obtuviste la puntuación máxima en ${g.title}.`,
    emoji: "🏆",
  })),
];

export const badgeById = (id: string) => BADGES.find((b) => b.id === id);
