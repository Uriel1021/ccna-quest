import { GAMES } from "./games";

export type Badge = { id: string; title: string; description: string; emoji: string };

export const BADGES: Badge[] = [
  { id: "primer-juego", title: "Primer paquete", description: "Terminaste tu primer minijuego.", emoji: "📦" },
  ...GAMES.map((g) => ({
    id: `perfecto-${g.slug}`,
    title: `${g.title} perfecto`,
    description: `Obtuviste la puntuación máxima en ${g.title}.`,
    emoji: "🏆",
  })),
];

export const badgeById = (id: string) => BADGES.find((b) => b.id === id);
