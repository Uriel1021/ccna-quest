/**
 * Catálogo de exámenes, agrupados como los exámenes por bloques del curso ITN.
 * Cada intento sortea preguntas del banco (repartidas entre los módulos del bloque).
 */
import { questionsForModules, type Question } from "./questions";

export type ExamKind = "module" | "final" | "practice";
export type Exam = {
  id: string; kind: ExamKind; title: string; subtitle: string;
  modules: number[]; count: number; minutes: number; pass: number;
};

export const EXAMS: Exam[] = [
  { id: "itn-m1-3", kind: "module", title: "Módulos 1–3", subtitle: "Conectividad básica y comunicaciones", modules: [1, 2, 3], count: 15, minutes: 20, pass: 70 },
  { id: "itn-m4-7", kind: "module", title: "Módulos 4–7", subtitle: "Conceptos de Ethernet", modules: [4, 5, 6, 7], count: 20, minutes: 25, pass: 70 },
  { id: "itn-m8-10", kind: "module", title: "Módulos 8–10", subtitle: "Comunicación entre redes", modules: [8, 9, 10], count: 15, minutes: 20, pass: 70 },
  { id: "itn-m11-13", kind: "module", title: "Módulos 11–13", subtitle: "Direccionamiento IP", modules: [11, 12, 13], count: 20, minutes: 25, pass: 70 },
  { id: "itn-m14-15", kind: "module", title: "Módulos 14–15", subtitle: "Comunicación de aplicaciones de red", modules: [14, 15], count: 15, minutes: 20, pass: 70 },
  { id: "itn-m16-17", kind: "module", title: "Módulos 16–17", subtitle: "Construir y asegurar una red pequeña", modules: [16, 17], count: 15, minutes: 20, pass: 70 },
  { id: "itn-final", kind: "final", title: "Examen final", subtitle: "Todo el curso Introducción a redes", modules: Array.from({ length: 17 }, (_, i) => i + 1), count: 40, minutes: 60, pass: 70 },
  { id: "practica", kind: "practice", title: "Práctica rápida", subtitle: "10 preguntas al azar, sin límite de tiempo", modules: Array.from({ length: 17 }, (_, i) => i + 1), count: 10, minutes: 0, pass: 70 },
];
export const examById = (id: string) => EXAMS.find((e) => e.id === id);
export const examsForModule = (m: number) => EXAMS.filter((e) => e.kind === "module" && e.modules.includes(m));

/* ── Aleatoriedad reproducible ── */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  const r = rng(hash(seed)), a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Sorteo de preguntas repartido entre módulos (round-robin) para que ninguno quede fuera. */
export function drawQuestions(exam: Exam, seed = crypto.randomUUID()): string[] {
  const perModule = exam.modules.map((m) => seededShuffle(questionsForModules([m]), `${seed}-${m}`));
  const picked: Question[] = [];
  for (let round = 0; picked.length < exam.count && perModule.some((l) => l.length > round); round++) {
    for (const list of seededShuffle(perModule, `${seed}-r${round}`)) {
      if (list[round] && picked.length < exam.count) picked.push(list[round]);
    }
  }
  return seededShuffle(picked, `${seed}-final`).map((q) => q.id);
}

/** Orden de opciones estable para un intento (así al reanudar se ve igual). */
export const optionOrder = (attemptId: string, q: Question) => seededShuffle(q.options.map((_, i) => i), `${attemptId}:${q.id}`);

export const isCorrect = (q: Question, answer: number[]) =>
  answer.length === q.correct.length && q.correct.every((c) => answer.includes(c));
