"use client";
import Link from "next/link";
import { BookOpen, Gamepad2, ClipboardCheck, Timer, ArrowRight } from "lucide-react";
import { Group, Row, ProgressRing } from "@/components/ui/apple";
import { useLessonStats } from "./useLessonStats";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/local-db";
import { GAMES } from "@/content/games";
import { lessonSlug } from "@/content/lessons";

export function HomeDashboard() {
  const s = useLessonStats();
  const bestExam = useLiveQuery(async () => (await db.attempts.toArray()).reduce((m, a) => Math.max(m, a.score ?? -1), -1), [], -1);
  const focusDone = useLiveQuery(() => db.focus.where("status").equals("completed").count(), [], 0);
  const played = useLiveQuery(async () => new Set((await db.games.toArray()).map((g) => g.gameSlug)).size, [], 0);
  const next = s.nextModule;
  const nm = s.perModule[next.id - 1];
  const nextLesson = next.lessons.find(([id]) => !s.done.has(id));
  const continueHref = nextLesson ? `/aprender/modulo-${next.id}/${lessonSlug(nextLesson[0])}` : `/aprender/modulo-${next.id}`;
  return (
    <>
      {/* Tarjeta "Continuar" al estilo de las apps de Apple */}
      <section aria-labelledby="sigue" className="mb-8 overflow-hidden rounded-2xl bg-surface">
        <div className="flex items-center gap-5 p-5">
          <span className="relative grid shrink-0 place-items-center">
            <ProgressRing value={nm.ratio} size={72} stroke={7} />
            <span className="absolute font-display text-xl font-bold">{next.id}</span>
          </span>
          <div className="min-w-0">
            <h2 id="sigue" className="text-[13px] font-semibold uppercase tracking-wide text-brand">Continuar</h2>
            <p className="font-display text-[22px] font-bold leading-tight tracking-tight">{next.title}</p>
            <p className="mt-1 text-[15px] text-muted">{next.plain}</p>
          </div>
        </div>
        <Link href={continueHref} className="pressable flex min-h-12 items-center justify-center gap-2 border-t border-border/70 font-semibold text-brand hover:bg-fill">
          {nextLesson ? `${nm.done ? "Seguir con" : "Empezar"} la lección ${nextLesson[0]}` : "Ver el módulo"} <ArrowRight size={18} aria-hidden />
        </Link>
      </section>

      <Group header="Resumen">
        <Row href="/aprender" icon={BookOpen} tint="orange" title="Lecciones vistas" trailing={`${s.lessonsDone} de ${s.totalLessons}`} />
        <Row href="/aprender" icon={BookOpen} tint="blue" title="Módulos completos" trailing={`${s.modulesDone} de 17`} />
        <Row href="/juegos" icon={Gamepad2} tint="pink" title="Minijuegos probados" trailing={`${played} de ${GAMES.length}`} />
        <Row href="/examenes" icon={ClipboardCheck} tint="green" title="Mejor calificación" trailing={bestExam >= 0 ? `${bestExam}%` : "—"} />
        <Row href="/enfoque" icon={Timer} tint="indigo" title="Sesiones de enfoque" trailing={focusDone} />
      </Group>
    </>
  );
}
