"use client";
import { useLiveQuery } from "@/lib/use-live-query";
import { Group, Row, IconTile } from "@/components/ui/apple";
import { db } from "@/lib/local-db";
import { GAMES } from "@/content/games";
import { BADGES } from "@/content/badges";

export function GameList() {
  const stats = useLiveQuery(async () => {
    const all = await db.games.toArray();
    const m = new Map<string, { best: number; plays: number }>();
    for (const g of all) {
      const s = m.get(g.gameSlug) ?? { best: 0, plays: 0 };
      m.set(g.gameSlug, { best: Math.max(s.best, g.score), plays: s.plays + 1 });
    }
    return m;
  }, [], new Map());
  const earned = useLiveQuery(async () => new Set((await db.badges.toArray()).map((b) => b.badgeId)), [], new Set<string>());

  return (
    <>
      <Group header="Minijuegos" footer="Cada juego refuerza un módulo del curso. Tus récords se guardan aunque no tengas internet.">
        {GAMES.map((g) => {
          const s = stats.get(g.slug);
          return (
            <Row
              key={g.slug}
              href={`/juegos/${g.slug}`}
              leading={<IconTile icon={g.icon} tint={g.tint} size={44} />}
              title={<span className="font-semibold">{g.title}</span>}
              subtitle={<>{g.tagline}<span className="mt-0.5 block text-[13px]">Módulo {g.module} · {g.minutes} min{s ? ` · Récord: ${s.best}` : ""}</span></>}
            />
          );
        })}
      </Group>
      <Group header={`Insignias · ${earned.size} de ${BADGES.length}`}>
        {BADGES.map((b) => {
          const has = earned.has(b.id);
          return (
            <Row
              key={b.id}
              leading={<span className={`grid size-[29px] shrink-0 place-items-center text-2xl ${has ? "" : "opacity-30 grayscale"}`} aria-hidden>{b.emoji}</span>}
              title={<span className={has ? "" : "text-muted"}>{b.title}</span>}
              subtitle={b.description}
              trailing={has ? "✓" : undefined}
            />
          );
        })}
      </Group>
    </>
  );
}
