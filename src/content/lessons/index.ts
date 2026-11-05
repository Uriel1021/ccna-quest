import { syllabus } from "../syllabus";
import { LESSONS_1_4 } from "./m01-04";
import { LESSONS_5_10 } from "./m05-10";
import { LESSONS_11_17 } from "./m11-17";
import type { LessonContent } from "./types";

export type { LessonContent } from "./types";
export { SOURCES } from "./sources";

const ALL: LessonContent[] = [...LESSONS_1_4, ...LESSONS_5_10, ...LESSONS_11_17];
const BY_ID = new Map(ALL.map((l) => [l.id, l]));

export const lessonContent = (id: string) => BY_ID.get(id);
/** "3.5" ↔ "leccion-3-5" (sin puntos en la URL: Capacitor y la exportación estática lo agradecen). */
export const lessonSlug = (id: string) => `leccion-${id.replace(".", "-")}`;
export const lessonIdFromSlug = (slug: string) => slug.replace(/^leccion-/, "").replace("-", ".");

/** Lista ordenada de todas las lecciones con su módulo, título y vecinas. */
export const LESSON_LIST = syllabus.flatMap((m) => m.lessons.map(([id, title]) => ({ id, title, module: m.id })));
export function neighbors(id: string) {
  const i = LESSON_LIST.findIndex((l) => l.id === id);
  return { prev: LESSON_LIST[i - 1], next: LESSON_LIST[i + 1], index: i };
}
/** Minutos aproximados de lectura (≈ 180 palabras por minuto para estudiantes). */
export function readingMinutes(l: LessonContent) {
  const words = [...l.body, ...l.keys, l.example ?? ""].join(" ").split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
