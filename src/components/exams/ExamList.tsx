"use client";
import { useLiveQuery } from "@/lib/use-live-query";
import { ClipboardCheck, GraduationCap, Shuffle } from "lucide-react";
import { Group, Row } from "@/components/ui/apple";
import { db } from "@/lib/local-db";
import { EXAMS, type Exam } from "@/content/exams";

export function ExamList() {
  const stats = useLiveQuery(async () => {
    const all = await db.attempts.toArray();
    const m = new Map<string, { best: number; tries: number; open: boolean; passed: boolean }>();
    for (const a of all) {
      const s = m.get(a.examId) ?? { best: 0, tries: 0, open: false, passed: false };
      m.set(a.examId, {
        best: Math.max(s.best, a.score ?? 0), tries: s.tries + (a.finishedAt ? 1 : 0),
        open: s.open || !a.finishedAt, passed: s.passed || !!a.passed,
      });
    }
    return m;
  }, [], new Map());

  const row = (e: Exam) => {
    const s = stats.get(e.id);
    return (
      <Row key={e.id} href={`/examenes/${e.id}`}
        icon={e.kind === "final" ? GraduationCap : e.kind === "practice" ? Shuffle : ClipboardCheck}
        tint={e.kind === "final" ? "red" : e.kind === "practice" ? "teal" : s?.passed ? "green" : "gray"}
        title={<span className="font-semibold">{e.title}</span>}
        subtitle={<>{e.subtitle}<span className="mt-0.5 block text-[13px]">{e.count} preguntas · {e.minutes ? `${e.minutes} min` : "sin tiempo"}{s?.open ? " · ⏸ intento sin terminar" : ""}</span></>}
        trailing={s?.tries ? <span className={s.passed ? "font-semibold text-ok" : ""}>{s.best}%</span> : undefined} />
    );
  };
  return (
    <>
      <Group header="Exámenes por módulos" footer="Se aprueba con 70%. Cada intento sortea preguntas nuevas.">{EXAMS.filter((e) => e.kind === "module").map(row)}</Group>
      <Group header="Evaluación final">{EXAMS.filter((e) => e.kind === "final").map(row)}</Group>
      <Group header="Para calentar">{EXAMS.filter((e) => e.kind === "practice").map(row)}</Group>
    </>
  );
}
