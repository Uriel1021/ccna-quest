"use client";
/**
 * Marco común de todos los minijuegos:
 *   Intro (qué aprenderás + cómo se juega)  →  Juego  →  Resultados (puntos, XP, insignias).
 * Heurísticas: H1 progreso/puntos visibles, H3 salir en cualquier momento (con confirmación,
 * H5), H9 la explicación de cada error vive dentro de cada juego, H10 instrucciones a la vista.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Play, RotateCcw, X, Trophy, Clock, Zap } from "lucide-react";
import { Button, Group, Row, IconTile } from "@/components/ui/apple";
import { db } from "@/lib/local-db";
import { recordGame, awardBadge } from "@/lib/progress";
import { haptic } from "@/lib/feedback";
import { badgeById, type Badge } from "@/content/badges";
import type { GameMeta } from "@/content/games";

export type GameResult = { score: number; max: number; level?: number; summary?: string };
export type GameProps = { onFinish: (r: GameResult) => void };

type Done = GameResult & { xp: number; durationSec: number; newBest: boolean; badges: Badge[] };

export function GameFrame({ meta, Game }: { meta: GameMeta; Game: React.ComponentType<GameProps> }) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [runId, setRunId] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const startedAt = useRef(0);

  const best = useLiveQuery(
    async () => (await db.games.where("gameSlug").equals(meta.slug).toArray()).reduce((m, g) => Math.max(m, g.score), 0),
    [meta.slug],
    0,
  );

  const start = () => {
    startedAt.current = Date.now();
    setRunId((r) => r + 1);
    setDone(null);
    setConfirmExit(false);
    setPhase("play");
    void haptic("tap");
  };

  const finish = async (r: GameResult) => {
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    const ratio = r.max > 0 ? Math.min(1, r.score / r.max) : 0;
    const xp = 5 + Math.round(20 * ratio);
    const prevBest = best;
    await recordGame(meta.slug, r.level ?? 1, r.score, durationSec, xp);

    const earned: Badge[] = [];
    for (const id of ["primer-juego", ...(ratio === 1 ? [`perfecto-${meta.slug}`] : [])]) {
      if (!(await db.badges.get(id))) {
        await awardBadge(id);
        const b = badgeById(id);
        if (b) earned.push(b);
      }
    }
    setDone({ ...r, xp, durationSec, newBest: r.score > prevBest, badges: earned });
    setPhase("done");
    void haptic(ratio >= 0.7 ? "success" : "tap");
  };

  /* ── Intro ── */
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <IconTile icon={meta.icon} tint={meta.tint} size={64} />
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Módulo {meta.module} · {meta.minutes} min</p>
            <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight">{meta.title}</h1>
          </div>
        </div>
        <p className="mb-6 text-[17px] leading-relaxed">{meta.learn}</p>
        <Group header="Cómo se juega">
          {meta.howTo.map((h, i) => (
            <Row key={i} leading={<span className="grid size-7 shrink-0 place-items-center rounded-full bg-fill text-[15px] font-semibold">{i + 1}</span>} title={<span className="whitespace-normal">{h}</span>} />
          ))}
        </Group>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={start} className="min-w-40"><Play size={18} fill="currentColor" aria-hidden /> Jugar</Button>
          {best > 0 && <span className="text-[15px] text-muted">Tu mejor puntuación: <b className="text-fg">{best}</b></span>}
        </div>
      </div>
    );
  }

  /* ── Resultados ── */
  if (phase === "done" && done) {
    const ratio = done.max ? Math.min(1, done.score / done.max) : 0;
    const msg = ratio === 1 ? "¡Perfecto!" : ratio >= 0.7 ? "¡Muy bien!" : ratio >= 0.4 ? "¡Vas por buen camino!" : "¡Sigue practicando!";
    return (
      <div className="mx-auto max-w-md text-center" role="status" aria-live="polite">
        <span className="mx-auto grid size-20 place-items-center rounded-[22px] bg-warn/15 text-warn"><Trophy size={40} aria-hidden /></span>
        <h1 className="mt-4 font-display text-[30px] font-bold tracking-tight">{msg}</h1>
        <p className="mt-1 text-[17px] text-muted">{done.summary ?? meta.title}</p>
        <p className="mt-6 font-display text-[56px] font-bold leading-none tracking-tight">
          {done.score}<span className="text-[28px] text-muted"> / {done.max}</span>
        </p>
        {done.newBest && <p className="mt-2 font-semibold text-ok">¡Nuevo récord personal!</p>}

        <div className="mt-6 text-left">
          <Group>
            <Row icon={Zap} tint="purple" title="Experiencia ganada" trailing={`+${done.xp} XP`} />
            <Row icon={Clock} tint="gray" title="Tiempo" trailing={`${Math.floor(done.durationSec / 60)}:${String(done.durationSec % 60).padStart(2, "0")}`} />
            {done.badges.map((b) => (
              <Row key={b.id} leading={<span className="grid size-[29px] shrink-0 place-items-center text-2xl">{b.emoji}</span>} title={`Insignia: ${b.title}`} subtitle={b.description} />
            ))}
          </Group>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={start}><RotateCcw size={18} aria-hidden /> Jugar otra vez</Button>
          <Link href={`/aprender/modulo-${meta.module}`} className="pressable inline-flex min-h-11 items-center justify-center rounded-full bg-brand/15 px-5 font-semibold text-brand">
            Repasar el módulo {meta.module}
          </Link>
          <Link href="/juegos" className="min-h-11 py-2 font-semibold text-brand">Ver otros juegos</Link>
        </div>
      </div>
    );
  }

  /* ── Jugando ── */
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold">
          <IconTile icon={meta.icon} tint={meta.tint} size={26} /> {meta.title}
        </h1>
        {confirmExit ? (
          <span className="flex items-center gap-2 text-[15px]">
            <span className="text-muted">¿Salir? Se pierde esta partida.</span>
            <button onClick={() => setPhase("intro")} className="font-semibold text-danger">Salir</button>
            <button onClick={() => setConfirmExit(false)} className="font-semibold text-brand">Seguir</button>
          </span>
        ) : (
          <button onClick={() => setConfirmExit(true)} className="pressable grid size-9 place-items-center rounded-full bg-fill text-muted" aria-label="Salir del juego">
            <X size={18} />
          </button>
        )}
      </div>
      <Game key={runId} onFinish={(r) => void finish(r)} />
    </div>
  );
}

/** Barra de progreso fina estilo iOS. */
export function ProgressBar({ value, tint = "bg-brand" }: { value: number; tint?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-fill" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
      <div className={`h-full rounded-full ${tint} transition-[width] duration-500`} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

/** Tarjeta de retroalimentación después de cada respuesta (H9). */
export function Feedback({ ok, title, children, onNext, nextLabel = "Siguiente" }: {
  ok: boolean; title?: string; children: React.ReactNode; onNext: () => void; nextLabel?: string;
}) {
  return (
    <div className={`animate-fade mt-4 rounded-2xl p-4 ${ok ? "bg-ok/12" : "bg-danger/10"}`} role="status" aria-live="polite">
      <p className={`font-semibold ${ok ? "text-ok" : "text-danger"}`}>{title ?? (ok ? "¡Correcto!" : "Casi…")}</p>
      <div className="mt-1 text-[15px] leading-relaxed">{children}</div>
      <Button onClick={onNext} className="mt-3 w-full" autoFocus>{nextLabel}</Button>
    </div>
  );
}
