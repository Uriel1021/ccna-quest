"use client";
/**
 * Lectura de una lección: explicación, ejemplo, puntos clave y navegación.
 * "Marcar como estudiada y continuar" guarda el avance (offline) y lleva a la siguiente lección;
 * al terminar la última del módulo, regresa al módulo donde se desbloquea el reto.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "@/lib/use-live-query";
import { BookMarked, CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, ListChecks, Clock, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/apple";
import { db } from "@/lib/local-db";
import { setLessonProgress } from "@/lib/progress";
import { haptic } from "@/lib/feedback";
import { lessonSlug, neighbors, readingMinutes, SOURCES, type LessonContent } from "@/content/lessons";
import type { Module } from "@/content/syllabus";

/** Texto con **negritas** y `código`. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
        : p.startsWith("`") ? <code key={i} className="rounded bg-fill px-1.5 py-0.5 font-mono text-[0.88em]">{p.slice(1, -1)}</code>
        : <span key={i}>{p}</span>)}
    </>
  );
}

export function LessonView({ module: m, lessonId, title, content, figures = [] }: { module: Module; lessonId: string; title: string; content: LessonContent; figures?: React.ReactNode[] }) {
  const router = useRouter();
  const done = useLiveQuery(async () => !!(await db.lessons.get(lessonId))?.done, [lessonId], false);
  const { prev, next } = neighbors(lessonId);
  const idx = m.lessons.findIndex(([id]) => id === lessonId);
  const lastOfModule = idx === m.lessons.length - 1;
  const nextHref = !lastOfModule && next ? `/aprender/modulo-${m.id}/${lessonSlug(next.id)}` : `/aprender/modulo-${m.id}`;

  const finish = async () => {
    if (!done) await setLessonProgress(lessonId, true);
    void haptic("success");
    router.push(nextHref);
    window.scrollTo({ top: 0 });
  };

  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-brand">Módulo {m.id} · Lección {lessonId} · {idx + 1} de {m.lessons.length}</p>
      <h1 className="mt-1 font-display text-[30px] font-bold leading-tight tracking-tight">{title}</h1>
      <p className="mt-2 flex items-center gap-3 text-[15px] text-muted">
        <span className="inline-flex items-center gap-1"><Clock size={15} aria-hidden /> {readingMinutes(content)} min de lectura</span>
        {done && <span className="inline-flex items-center gap-1 font-semibold text-ok"><CheckCircle2 size={15} aria-hidden /> Estudiada</span>}
      </p>

      {/* Progreso dentro del módulo */}
      <div className="mt-4 flex gap-1" aria-label={`Lección ${idx + 1} de ${m.lessons.length}`}>
        {m.lessons.map(([id]) => (
          <Link key={id} href={`/aprender/modulo-${m.id}/${lessonSlug(id)}`} aria-label={`Ir a la lección ${id}`}
            className={`h-1.5 flex-1 rounded-full ${id === lessonId ? "bg-brand" : "bg-fill"}`} />
        ))}
      </div>

      {/* Texto con figuras intercaladas: figura 1 tras el párrafo 1, figura 2 tras el párrafo 2… */}
      <div className="mt-6 space-y-4 text-[17px] leading-relaxed">
        {content.body.map((p, i) => (
          <div key={i}>
            <p><Rich text={p} /></p>
            {figures[i]}
          </div>
        ))}
        {figures.slice(content.body.length)}
      </div>

      {content.example && (
        <aside className="mt-6 flex gap-3 rounded-2xl bg-warn/12 p-4">
          <Lightbulb className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <div><p className="font-semibold">Para entenderlo mejor</p><p className="mt-1 text-[16px] leading-relaxed"><Rich text={content.example} /></p></div>
        </aside>
      )}

      <section className="mt-6 rounded-2xl bg-surface p-5 shadow-sm" aria-labelledby="claves">
        <h2 id="claves" className="flex items-center gap-2 text-[17px] font-bold"><ListChecks size={20} className="text-brand" aria-hidden /> Puntos clave</h2>
        <ul className="mt-3 space-y-2">
          {content.keys.map((k, i) => (
            <li key={i} className="flex gap-2 text-[16px] leading-snug"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden /><span><Rich text={k} /></span></li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-3">
        <Button onClick={() => void finish()} className="w-full">
          {done ? (lastOfModule ? "Volver al módulo" : "Siguiente lección") : lastOfModule ? "Marcar como estudiada y terminar el módulo" : "Marcar como estudiada y continuar"}
          <ChevronRight size={18} aria-hidden />
        </Button>
        <div className="flex items-center justify-between text-[15px]">
          {prev ? (
            <Link href={`/aprender/modulo-${prev.module}/${lessonSlug(prev.id)}`} className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand"><ChevronLeft size={18} aria-hidden /> {prev.id}</Link>
          ) : <span />}
          {done && <button onClick={() => void setLessonProgress(lessonId, false)} className="min-h-11 text-muted underline">Marcar como no estudiada</button>}
        </div>
      </div>

      <details className="mt-8 rounded-2xl bg-surface p-4 text-[14px]">
        <summary className="flex cursor-pointer items-center gap-2 font-semibold"><BookMarked size={16} aria-hidden /> Fuentes de este módulo</summary>
        <p className="mt-2 text-muted">Explicación redactada para estudiantes con base en estas obras y estándares:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">{(SOURCES[m.id] ?? []).map((s) => <li key={s}>{s}</li>)}</ul>
      </details>
      <p className="mt-4 text-center text-[15px]">
        <Link href={`/comentarios?tipo=content&desde=${encodeURIComponent(`/aprender/modulo-${m.id}/${lessonSlug(lessonId)}`)}`} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-brand">
          <MessageSquareWarning size={17} aria-hidden /> ¿Viste un error en esta lección? Avísanos
        </Link>
      </p>
    </article>
  );
}
