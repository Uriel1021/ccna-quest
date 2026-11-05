"use client";
/** Vista de un módulo: lecciones (con avance), reto final, juegos relacionados y exámenes. */
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, Circle, ClipboardCheck, Lock, Trophy } from "lucide-react";
import { Group, IconTile, Row } from "@/components/ui/apple";
import { db } from "@/lib/local-db";
import { gamesForModule } from "@/content/games";
import { examsForModule } from "@/content/exams";
import { lessonSlug } from "@/content/lessons";
import type { Module } from "@/content/syllabus";

export function ModuleView({ module: m }: { module: Module }) {
  const done = useLiveQuery(async () => new Set((await db.lessons.toArray()).filter((l) => l.done).map((l) => l.lessonId)), [], new Set<string>());
  const mastered = useLiveQuery(async () => !!(await db.badges.get(`dominado-m${m.id}`)), [m.id], false);
  const count = m.lessons.filter(([id]) => done.has(id)).length;
  const all = count === m.lessons.length;
  const next = m.lessons.find(([id]) => !done.has(id));

  return (
    <>
      <Group header={`Lecciones · ${count} de ${m.lessons.length}`} footer={next ? `Siguiente: ${next[0]} ${next[1]}` : "¡Estudiaste todas las lecciones!"}>
        {m.lessons.map(([id, title]) => {
          const d = done.has(id);
          return (
            <Row key={id} href={`/aprender/modulo-${m.id}/${lessonSlug(id)}`}
              ariaLabel={`Lección ${id}: ${title}. ${d ? "Estudiada" : "Pendiente"}.`}
              leading={d ? <CheckCircle2 size={26} className="shrink-0 fill-ok text-white" aria-hidden /> : <Circle size={26} className="shrink-0 text-muted/50" aria-hidden />}
              title={title} subtitle={`Lección ${id}`} />
          );
        })}
      </Group>

      <Group header="Reto final del módulo" footer={all ? "Responde a contrarreloj. Con 70 % o más dominas el módulo." : `Se desbloquea al estudiar las ${m.lessons.length} lecciones.`}>
        {all ? (
          <Row href={`/aprender/modulo-${m.id}/reto`} leading={<IconTile icon={Trophy} tint="orange" size={44} />}
            title={<span className="font-semibold">Reto del módulo {m.id}</span>}
            subtitle={mastered ? "⭐ Módulo dominado · ¡juega otra vez para superar tu récord!" : "¡Desbloqueado! Pon a prueba lo que aprendiste"} />
        ) : (
          <Row leading={<IconTile icon={Lock} tint="gray" size={44} />} title={<span className="text-muted">Reto del módulo {m.id}</span>}
            subtitle={`Te faltan ${m.lessons.length - count} lección(es)`} />
        )}
      </Group>

      {gamesForModule(m.id).length > 0 && (
        <Group header="Practica jugando">
          {gamesForModule(m.id).map((g) => <Row key={g.slug} href={`/juegos/${g.slug}`} icon={g.icon} tint={g.tint} title={g.title} subtitle={g.tagline} />)}
        </Group>
      )}
      <Group header="Evalúate">
        {examsForModule(m.id).map((e) => <Row key={e.id} href={`/examenes/${e.id}`} icon={ClipboardCheck} tint="green" title={`Examen ${e.title}`} subtitle={e.subtitle} />)}
      </Group>
    </>
  );
}
