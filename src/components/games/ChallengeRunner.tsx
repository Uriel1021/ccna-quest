"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useLiveQuery } from "@/lib/use-live-query";
import { Lock, Trophy } from "lucide-react";
import { db } from "@/lib/local-db";
import { syllabus } from "@/content/syllabus";
import { lessonSlug } from "@/content/lessons";
import type { GameMeta, GameSlug } from "@/content/games";
import { GameFrame } from "./GameFrame";
import { makeChallenge } from "./ModuleChallenge";

export function ChallengeRunner({ moduleId }: { moduleId: number }) {
  const m = syllabus[moduleId - 1];
  const doneIds = useLiveQuery(async () => new Set((await db.lessons.toArray()).filter((l) => l.done).map((l) => l.lessonId)), [], null);
  const Game = useMemo(() => makeChallenge(moduleId), [moduleId]);
  const meta: GameMeta = {
    slug: `reto-modulo-${moduleId}` as GameSlug,
    title: `Reto del módulo ${moduleId}`,
    tagline: m.title,
    module: moduleId, icon: Trophy, tint: "orange", minutes: 4,
    learn: `Demuestra lo que aprendiste en "${m.title}". Si aciertas al menos el 70 %, ganas la insignia de módulo dominado.`,
    howTo: [
      "Cada pregunta tiene 25 segundos. ¡Responder rápido da más puntos!",
      "Tienes 3 vidas: un error o que se acabe el tiempo te quita una.",
      "Con 3 aciertos seguidos tus puntos valen ×1.5, y con 5 seguidos ×2.",
    ],
  };
  if (doneIds === null) {
    return (
      <section className="mx-auto max-w-md py-10 text-center" aria-busy="true">
        <h1 className="font-display text-2xl font-bold">{meta.title}</h1>
        <p className="mt-2 text-muted">Cargando tu progreso…</p>
      </section>
    );
  }
  const pending = m.lessons.filter(([id]) => !doneIds.has(id));
  if (pending.length > 0) {
    return (
      <section className="mx-auto max-w-md py-10 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-fill text-muted"><Lock size={30} aria-hidden /></span>
        <h1 className="mt-4 font-display text-2xl font-bold">Reto bloqueado</h1>
        <p className="mt-2 text-muted">Estudia todas las lecciones del módulo {moduleId} para desbloquearlo. Te faltan {pending.length}.</p>
        <Link href={`/aprender/modulo-${moduleId}/${lessonSlug(pending[0][0])}`} className="pressable mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-6 font-semibold text-brand-fg">
          Continuar con la lección {pending[0][0]}
        </Link>
      </section>
    );
  }
  return <GameFrame meta={meta} Game={Game} />;
}
