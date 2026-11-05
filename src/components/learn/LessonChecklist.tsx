"use client";
import { CheckCircle2, Circle } from "lucide-react";
import { Group, Row } from "@/components/ui/apple";
import { setLessonProgress } from "@/lib/progress";
import { useLessonStats } from "./useLessonStats";
import type { Module } from "@/content/syllabus";

/** Lista de lecciones. Marcar/desmarcar se guarda al instante, con o sin internet. */
export function LessonChecklist({ module: m }: { module: Module }) {
  const { done } = useLessonStats();
  const count = m.lessons.filter(([id]) => done.has(id)).length;
  return (
    <Group header={`Lecciones · ${count} de ${m.lessons.length}`} footer="Toca una lección para marcarla como vista (+10 XP). Se guarda aunque no tengas internet.">
      {m.lessons.map(([id, title]) => {
        const isDone = done.has(id);
        return (
          <Row
            key={id}
            onClick={() => void setLessonProgress(id, !isDone)}
            ariaLabel={`${id} ${title}. ${isDone ? "Vista. Toca para desmarcar." : "Pendiente. Toca para marcar como vista."}`}
            leading={isDone
              ? <CheckCircle2 size={26} className="shrink-0 fill-ok text-white" aria-hidden />
              : <Circle size={26} className="shrink-0 text-muted/50" aria-hidden />}
            title={<span className={isDone ? "text-muted" : undefined}>{title}</span>}
            subtitle={`Lección ${id}`}
          />
        );
      })}
    </Group>
  );
}
