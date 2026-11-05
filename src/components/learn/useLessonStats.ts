"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/local-db";
import { syllabus } from "@/content/syllabus";

/** Progreso por módulo, leído en vivo de IndexedDB (funciona offline). */
export function useLessonStats() {
  const done = useLiveQuery(async () => new Set((await db.lessons.toArray()).filter((l) => l.done).map((l) => l.lessonId)), [], new Set<string>());
  const perModule = syllabus.map((m) => {
    const d = m.lessons.filter(([id]) => done.has(id)).length;
    return { id: m.id, done: d, total: m.lessons.length, ratio: d / m.lessons.length };
  });
  const totalLessons = perModule.reduce((a, m) => a + m.total, 0);
  return {
    done,
    perModule,
    lessonsDone: done.size,
    totalLessons,
    modulesDone: perModule.filter((m) => m.done === m.total).length,
    nextModule: syllabus.find((m) => m.lessons.some(([id]) => !done.has(id))) ?? syllabus[syllabus.length - 1],
  };
}
