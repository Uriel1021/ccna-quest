"use client";
/**
 * Simulador de examen offline-first.
 *  - Cada respuesta se guarda en IndexedDB al instante (y se sincroniza sola).
 *  - El sorteo y el orden de opciones quedan congelados en el intento → se puede reanudar.
 *  - Heurísticas: H1 tiempo/progreso/guardado visibles; H3 navegar libremente y marcar para revisar;
 *    H5 confirmación antes de entregar y aviso de preguntas sin responder; H7 atajos de teclado;
 *    H9 retroalimentación con explicación de cada pregunta.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, ChevronLeft, ChevronRight, Clock, Flag, Grid3x3, Play, RotateCcw, X, CloudCheck } from "lucide-react";
import { Button, Group, IconTile, ProgressRing, Row } from "@/components/ui/apple";
import { db, type LocalAttempt } from "@/lib/local-db";
import { finishAttempt, saveAnswer, startAttempt } from "@/lib/progress";
import { haptic } from "@/lib/feedback";
import { drawQuestions, examById, isCorrect, optionOrder, type Exam } from "@/content/exams";
import { questionById, type Question } from "@/content/questions";
import { syllabus } from "@/content/syllabus";
import { ClipboardCheck } from "lucide-react";

type Answers = Record<string, number[]>;
const fmt = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

async function loadAnswers(attemptId: string): Promise<Answers> {
  const rows = await db.answers.where("attemptId").equals(attemptId).toArray();
  return Object.fromEntries(rows.map((r) => [r.questionId, r.answer.map(Number)]));
}
const scoreOf = (qs: Question[], ans: Answers) => {
  const ok = qs.filter((q) => isCorrect(q, ans[q.id] ?? [])).length;
  return { ok, pct: qs.length ? Math.round((ok / qs.length) * 100) : 0 };
};

export function ExamRunner({ examId }: { examId: string }) {
  const exam = examById(examId)!;
  const [phase, setPhase] = useState<"intro" | "run" | "results">("intro");
  const [attempt, setAttempt] = useState<LocalAttempt | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [idx, setIdx] = useState(0);
  const [grid, setGrid] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [limitHit, setLimitHit] = useState<string | null>(null);

  const history = useLiveQuery(
    () => db.attempts.where("examId").equals(examId).reverse().sortBy("startedAt"),
    [examId], [] as LocalAttempt[],
  );
  const unfinished = history.find((a) => !a.finishedAt);
  const finished = history.filter((a) => a.finishedAt);
  const best = finished.reduce((m, a) => Math.max(m, a.score ?? 0), 0);

  const questions = useMemo(() => (attempt ? attempt.questionOrder.map((id) => questionById(id)).filter((q): q is Question => !!q) : []), [attempt]);
  const q = questions[idx];
  const deadline = attempt && exam.minutes > 0 ? attempt.startedAt + exam.minutes * 60_000 : null;

  /* ── Acciones ── */
  const open = async (a: LocalAttempt, to: "run" | "results") => {
    setAttempt(a);
    setAnswers(await loadAnswers(a.id));
    const f = (await db.meta.get(`flags:${a.id}`))?.value as string[] | undefined;
    setFlags(new Set(f ?? []));
    setIdx(0); setConfirm(false); setGrid(false);
    setPhase(to);
  };
  const start = async () => {
    const id = await startAttempt({ examId: exam.id, kind: exam.kind, questionOrder: drawQuestions(exam) });
    const a = await db.attempts.get(id);
    if (a) await open(a, "run");
    void haptic("tap");
  };
  const submit = useCallback(async () => {
    if (!attempt) return;
    const qs = attempt.questionOrder.map((id) => questionById(id)).filter((x): x is Question => !!x);
    const ans = await loadAnswers(attempt.id);
    const { pct } = scoreOf(qs, ans);
    await finishAttempt(attempt.id, pct, exam.pass);
    const a = await db.attempts.get(attempt.id);
    if (a) { setAttempt(a); setAnswers(ans); }
    setConfirm(false);
    setPhase("results");
    void haptic(pct >= exam.pass ? "success" : "tap");
    window.scrollTo({ top: 0 });
  }, [attempt, exam.pass]);

  const choose = async (opt: number) => {
    if (!attempt || !q || phase !== "run") return;
    const multi = q.correct.length > 1;
    const cur = answers[q.id] ?? [];
    let next: number[];
    if (!multi) next = [opt];
    else if (cur.includes(opt)) next = cur.filter((x) => x !== opt);
    else if (cur.length >= q.correct.length) { setLimitHit(`Solo puedes elegir ${q.correct.length}. Quita una opción para cambiarla.`); void haptic("error"); return; }
    else next = [...cur, opt];
    setLimitHit(null);
    setAnswers((a) => ({ ...a, [q.id]: next }));
    void haptic("tap");
    await saveAnswer(attempt.id, q.id, next.map(String), isCorrect(q, next));
  };
  const toggleFlag = async () => {
    if (!attempt || !q) return;
    const f = new Set(flags);
    if (f.has(q.id)) f.delete(q.id); else f.add(q.id);
    setFlags(f);
    await db.meta.put({ key: `flags:${attempt.id}`, value: [...f] });
  };
  const go = (i: number) => { setIdx(Math.max(0, Math.min(questions.length - 1, i))); setLimitHit(null); setGrid(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  /* ── Reloj y entrega automática ── */
  useEffect(() => {
    if (phase !== "run" || !deadline) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [phase, deadline]);
  useEffect(() => {
    if (phase === "run" && deadline && now >= deadline) void submit();
  }, [now, deadline, phase, submit]);

  /* ── Atajos de teclado (H7) ── */
  useEffect(() => {
    if (phase !== "run") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(idx + 1);
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (/^[1-6]$/.test(e.key) && q) { const order = optionOrder(attempt!.id, q); const o = order[Number(e.key) - 1]; if (o !== undefined) void choose(o); }
      else if (e.key.toLowerCase() === "m") void toggleFlag();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ───────────── INTRO ───────────── */
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <IconTile icon={ClipboardCheck} tint={exam.kind === "final" ? "red" : exam.kind === "practice" ? "teal" : "green"} size={64} />
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">{exam.kind === "final" ? "Examen final" : exam.kind === "practice" ? "Práctica" : "Examen por módulos"}</p>
            <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight">{exam.title}</h1>
            <p className="text-[15px] text-muted">{exam.subtitle}</p>
          </div>
        </div>

        {unfinished && (
          <section className="mb-6 rounded-2xl bg-brand/12 p-4">
            <p className="font-semibold">Tienes un intento sin terminar</p>
            <p className="mt-0.5 text-[15px] text-muted">Tus respuestas están guardadas en este dispositivo.{exam.minutes > 0 && unfinished.startedAt + exam.minutes * 60_000 < Date.now() ? " Su tiempo ya terminó: al abrirlo se entregará." : ""}</p>
            <Button onClick={() => void open(unfinished, "run")} className="mt-3">Continuar intento</Button>
          </section>
        )}

        <Group header="Detalles">
          <Row title="Preguntas" trailing={exam.count} />
          <Row title="Tiempo" trailing={exam.minutes ? `${exam.minutes} min` : "Sin límite"} />
          <Row title="Para aprobar" trailing={`${exam.pass}%`} />
          <Row title="Módulos" trailing={exam.modules.length === 17 ? "1 al 17" : exam.modules.join(", ")} />
        </Group>
        <Group header="Cómo funciona">
          <Row title={<span className="whitespace-normal">Cada intento sortea preguntas distintas y cambia el orden de las respuestas.</span>} />
          <Row title={<span className="whitespace-normal">Tu avance se guarda al instante, aunque no tengas internet o se cierre la app.</span>} />
          <Row title={<span className="whitespace-normal">Puedes marcar preguntas 🚩 para revisarlas antes de entregar.</span>} />
        </Group>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Button onClick={() => void start()} className="min-w-44"><Play size={18} fill="currentColor" aria-hidden /> {unfinished ? "Empezar uno nuevo" : "Comenzar examen"}</Button>
          {best > 0 && <span className="text-[15px] text-muted">Mejor calificación: <b className={best >= exam.pass ? "text-ok" : "text-fg"}>{best}%</b></span>}
        </div>

        {finished.length > 0 && (
          <Group header="Intentos anteriores" footer="Toca un intento para repasar tus respuestas.">
            {finished.slice(0, 8).map((a) => (
              <Row key={a.id} onClick={() => void open(a, "results")}
                leading={<span className={clsx("grid size-[29px] shrink-0 place-items-center rounded-full text-white", a.passed ? "bg-ok" : "bg-danger")}>{a.passed ? <Check size={16} /> : <X size={16} />}</span>}
                title={`${a.score}% · ${a.passed ? "Aprobado" : "No aprobado"}`}
                subtitle={new Date(a.startedAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })} />
            ))}
          </Group>
        )}
      </div>
    );
  }

  if (!attempt || !q) return <p className="py-10 text-center text-muted">Cargando examen…</p>;

  /* ───────────── RESULTADOS ───────────── */
  if (phase === "results") return <Results exam={exam} attempt={attempt} questions={questions} answers={answers} flags={flags} onRetry={() => void start()} onBack={() => setPhase("intro")} />;

  /* ───────────── EXAMEN EN CURSO ───────────── */
  const answeredCount = questions.filter((x) => (answers[x.id] ?? []).length > 0).length;
  const remaining = deadline ? deadline - now : null;
  const chosen = answers[q.id] ?? [];
  const multi = q.correct.length > 1;
  const order = optionOrder(attempt.id, q);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Barra de estado del examen */}
      <div className="sticky top-12 z-20 -mx-4 mb-4 bg-bg/90 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-semibold">{exam.title}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[13px] text-muted" title="Cada respuesta se guarda al instante"><CloudCheck size={15} aria-hidden /> Guardado</span>
          {remaining != null && (
            <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[14px] font-semibold tabular-nums", remaining < 60_000 ? "bg-danger text-white" : remaining < 300_000 ? "bg-warn/20 text-warn" : "bg-fill")}
              role="timer" aria-label={`Tiempo restante ${fmt(remaining)}`}>
              <Clock size={14} aria-hidden /> {fmt(remaining)}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fill"><div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
          <span className="text-[13px] tabular-nums text-muted">{answeredCount}/{questions.length}</span>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Pregunta {idx + 1} de {questions.length} · Módulo {q.module}</p>
        <button onClick={() => void toggleFlag()} aria-pressed={flags.has(q.id)} className={clsx("pressable inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-semibold", flags.has(q.id) ? "bg-warn text-white" : "bg-fill text-muted")}>
          <Flag size={14} aria-hidden /> {flags.has(q.id) ? "Marcada" : "Marcar"}
        </button>
      </div>
      <h2 className="text-[21px] font-semibold leading-snug">{q.prompt}</h2>
      {multi && <p className="mt-1 text-[15px] font-medium text-brand">Elige {q.correct.length} respuestas · llevas {chosen.length}</p>}

      <ul className="mt-4 overflow-hidden rounded-xl bg-surface" role={multi ? "group" : "radiogroup"} aria-label="Opciones">
        {order.map((oi, k) => {
          const sel = chosen.includes(oi);
          return (
            <li key={oi} className="group">
              <button onClick={() => void choose(oi)} role={multi ? "checkbox" : "radio"} aria-checked={sel}
                className={clsx("flex w-full items-center gap-3 pl-4 text-left transition-colors", sel ? "bg-brand/10" : "hover:bg-fill")}>
                <span className={clsx("grid size-6 shrink-0 place-items-center border-2 transition-colors", multi ? "rounded-md" : "rounded-full", sel ? "border-brand bg-brand text-white" : "border-muted/40")}>
                  {sel && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="flex min-h-14 flex-1 items-center gap-3 border-b border-border/70 py-3 pr-4 group-last:border-b-0">
                  <span className="flex-1 text-[17px]">{q.options[oi]}</span>
                  <kbd className="hidden rounded border border-border px-1.5 text-[11px] text-muted md:inline">{k + 1}</kbd>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {limitHit && <p className="mt-2 text-[15px] text-warn" role="alert">{limitHit}</p>}

      {/* Navegación */}
      <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <Button variant="tinted" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Pregunta anterior"><ChevronLeft size={20} /></Button>
        <Button variant="plain" onClick={() => setGrid(true)}><Grid3x3 size={18} aria-hidden /> Ver todas</Button>
        {idx < questions.length - 1
          ? <Button onClick={() => go(idx + 1)}>Siguiente <ChevronRight size={18} aria-hidden /></Button>
          : <Button onClick={() => setConfirm(true)} className="bg-ok">Entregar</Button>}
      </div>
      <p className="mt-3 hidden text-center text-[12px] text-muted md:block">Atajos: ← → para moverte · 1–4 para responder · M para marcar</p>

      {/* Mapa de preguntas (hoja) */}
      {(grid || confirm) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
          <button aria-label="Cerrar" tabIndex={-1} className="animate-fade absolute inset-0 bg-black/35" onClick={() => { setGrid(false); setConfirm(false); }} />
          <div className="animate-sheet relative max-h-[85dvh] w-full overflow-y-auto rounded-t-[14px] bg-bg p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:max-w-lg md:rounded-[14px]">
            <div className="mx-auto mb-3 h-[5px] w-9 rounded-full bg-muted/40 md:hidden" aria-hidden />
            <h2 id="sheet-title" className="mb-1 text-center text-[17px] font-semibold">{confirm ? "¿Entregar el examen?" : "Todas las preguntas"}</h2>
            {confirm && (
              <p className="mb-3 text-center text-[15px] text-muted">
                {questions.length - answeredCount > 0
                  ? <>Te faltan <b className="text-danger">{questions.length - answeredCount}</b> por responder (cuentan como incorrectas).</>
                  : "Respondiste todas las preguntas."}
                {flags.size > 0 && <> Tienes <b className="text-warn">{flags.size}</b> marcada(s) para revisar.</>}
              </p>
            )}
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
              {questions.map((x, i) => {
                const done = (answers[x.id] ?? []).length > 0;
                return (
                  <button key={x.id} onClick={() => { setConfirm(false); go(i); }}
                    aria-label={`Pregunta ${i + 1}${done ? ", respondida" : ", sin responder"}${flags.has(x.id) ? ", marcada" : ""}`}
                    className={clsx("relative grid aspect-square place-items-center rounded-xl text-[15px] font-semibold",
                      done ? "bg-brand text-white" : "bg-surface ring-1 ring-border", i === idx && "ring-2 ring-offset-2 ring-brand")}>
                    {i + 1}
                    {flags.has(x.id) && <span className="absolute -right-1 -top-1 text-[12px]" aria-hidden>🚩</span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex justify-center gap-4 text-[12px] text-muted">
              <span><span className="mr-1 inline-block size-3 rounded bg-brand align-middle" />Respondida</span>
              <span><span className="mr-1 inline-block size-3 rounded ring-1 ring-border align-middle" />Pendiente</span>
              <span>🚩 Marcada</span>
            </div>
            <div className="mt-4 grid gap-2">
              {confirm ? (
                <>
                  <Button onClick={() => void submit()} className="bg-ok">Entregar ahora</Button>
                  <Button variant="plain" onClick={() => setConfirm(false)}>Seguir revisando</Button>
                </>
              ) : (
                <Button variant="tinted" onClick={() => { setGrid(false); setConfirm(true); }}>Entregar examen</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── Pantalla de resultados con revisión ───────────── */
function Results({ exam, attempt, questions, answers, flags, onRetry, onBack }: {
  exam: Exam; attempt: LocalAttempt; questions: Question[]; answers: Answers; flags: Set<string>; onRetry: () => void; onBack: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "wrong" | "flag">("wrong");
  const { ok, pct } = scoreOf(questions, answers);
  const passed = pct >= exam.pass;
  const byModule = [...new Set(questions.map((x) => x.module))].sort((a, b) => a - b).map((m) => {
    const qs = questions.filter((x) => x.module === m);
    return { m, ok: qs.filter((x) => isCorrect(x, answers[x.id] ?? [])).length, total: qs.length };
  });
  const list = questions.map((x, i) => ({ x, i })).filter(({ x }) =>
    filter === "all" ? true : filter === "flag" ? flags.has(x.id) : !isCorrect(x, answers[x.id] ?? []));
  const used = (attempt.finishedAt ?? Date.now()) - attempt.startedAt;

  return (
    <div className="mx-auto max-w-2xl">
      <section className="mb-8 text-center" role="status">
        <div className="relative mx-auto grid size-40 place-items-center">
          <ProgressRing value={pct / 100} size={160} stroke={14} tint={passed ? "var(--ok)" : "var(--danger)"} />
          <span className="absolute font-display text-[44px] font-bold tracking-tight">{pct}%</span>
        </div>
        <h1 className={clsx("mt-4 font-display text-[30px] font-bold", passed ? "text-ok" : "text-danger")}>{passed ? "¡Aprobado!" : "Aún no apruebas"}</h1>
        <p className="mt-1 text-[17px] text-muted">{ok} de {questions.length} correctas · se necesita {exam.pass}% · tiempo {fmt(used)}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button onClick={onRetry}><RotateCcw size={18} aria-hidden /> Nuevo intento</Button>
          <Button variant="tinted" onClick={onBack}>Volver al examen</Button>
        </div>
      </section>

      <Group header="Resultado por módulo" footer="Repasa los módulos en rojo antes de tu siguiente intento.">
        {byModule.map(({ m, ok: o, total }) => {
          const r = o / total;
          return (
            <Row key={m} href={`/aprender/modulo-${m}`}
              title={<span className="truncate">Módulo {m} · {syllabus[m - 1].title}</span>}
              subtitle={<span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-fill"><span className={clsx("block h-full rounded-full", r >= 0.7 ? "bg-ok" : r >= 0.4 ? "bg-warn" : "bg-danger")} style={{ width: `${r * 100}%` }} /></span>}
              trailing={`${o}/${total}`} />
          );
        })}
      </Group>

      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[20px] font-bold">Revisión</h2>
        <div className="flex rounded-lg bg-fill p-0.5 text-[13px] font-semibold" role="tablist" aria-label="Filtrar preguntas">
          {([["wrong", "Errores"], ["flag", "Marcadas"], ["all", "Todas"]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
              className={clsx("rounded-md px-3 py-1.5 transition-colors", filter === k ? "bg-surface shadow-sm" : "text-muted")}>{l}</button>
          ))}
        </div>
      </div>

      {list.length === 0 && <p className="rounded-xl bg-surface p-6 text-center text-muted">{filter === "wrong" ? "¡Sin errores! 🎉" : "No hay preguntas aquí."}</p>}
      <ol className="space-y-4">
        {list.map(({ x, i }) => {
          const mine = answers[x.id] ?? [];
          const good = isCorrect(x, mine);
          return (
            <li key={x.id} className="rounded-2xl bg-surface p-4">
              <p className="text-[13px] font-semibold text-muted">
                <span className={good ? "text-ok" : "text-danger"}>{good ? "✓ Correcta" : mine.length ? "✗ Incorrecta" : "— Sin responder"}</span> · Pregunta {i + 1} · Módulo {x.module}
              </p>
              <p className="mt-1 text-[17px] font-semibold">{x.prompt}</p>
              <ul className="mt-3 space-y-1.5">
                {optionOrder(attempt.id, x).map((oi) => {
                  const isAns = x.correct.includes(oi), picked = mine.includes(oi);
                  return (
                    <li key={oi} className={clsx("flex items-start gap-2 rounded-lg px-3 py-2 text-[15px]", isAns ? "bg-ok/12" : picked ? "bg-danger/10" : "")}>
                      <span className="mt-0.5 w-4 shrink-0" aria-hidden>{isAns ? <Check size={16} className="text-ok" /> : picked ? <X size={16} className="text-danger" /> : null}</span>
                      <span>{x.options[oi]}{picked && <span className="ml-1 text-[13px] text-muted">(tu respuesta)</span>}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 rounded-lg bg-fill p-3 text-[15px] leading-relaxed"><b>¿Por qué?</b> {x.explain}</p>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 text-center"><Link href={`/aprender`} className="font-semibold text-brand">Ir a repasar el temario</Link></div>
    </div>
  );
}
