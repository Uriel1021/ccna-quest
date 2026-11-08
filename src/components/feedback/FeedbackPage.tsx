"use client";
/**
 * Comentarios para el autor: errores, contenido incorrecto, sugerencias.
 * H1 estado visible (pendiente / recibido / en revisión / resuelto) · H5 límites y contador ·
 * H9 mensajes claros · H10 se explica qué datos se envían.
 */
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Bug, BookX, Lightbulb, MessageCircle, Send, CheckCircle2, Clock, Eye, CloudUpload, Reply } from "lucide-react";
import { Button, LargeTitle } from "@/components/ui/apple";
import { useLiveQuery } from "@/lib/use-live-query";
import { db } from "@/lib/local-db";
import { sendFeedback } from "@/lib/progress";
import { haptic } from "@/lib/feedback";
import type { FeedbackItem } from "@/lib/sync-protocol";

type Cat = FeedbackItem["category"];
export const CATEGORIES: { id: Cat; label: string; icon: typeof Bug; hint: string }[] = [
  { id: "bug", label: "Error en la app", icon: Bug, hint: "Algo no funciona, se traba o se ve mal." },
  { id: "content", label: "Contenido incorrecto", icon: BookX, hint: "Una explicación, figura o respuesta de examen tiene un error." },
  { id: "idea", label: "Sugerencia", icon: Lightbulb, hint: "Una idea para mejorar la app o un tema que te gustaría ver." },
  { id: "other", label: "Otro", icon: MessageCircle, hint: "Cualquier otra cosa que quieras decirnos." },
];
export const STATUS: Record<FeedbackItem["status"] | "pending", { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: "Por enviar", cls: "bg-warn/15 text-warn", icon: CloudUpload },
  new: { label: "Recibido", cls: "bg-brand/12 text-brand", icon: CheckCircle2 },
  reviewing: { label: "En revisión", cls: "bg-indigo/15 text-indigo", icon: Eye },
  resolved: { label: "Resuelto", cls: "bg-ok/15 text-ok", icon: CheckCircle2 },
};
const MIN = 5, MAX = 2000;
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function FeedbackPage() {
  const params = useSearchParams();
  const from = params.get("desde");
  const initial = (params.get("tipo") as Cat | null) ?? (from ? "content" : "bug");
  const [cat, setCat] = useState<Cat>(CATEGORIES.some((c) => c.id === initial) ? initial : "bug");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const mine = useLiveQuery(() => db.feedback.orderBy("createdAt").reverse().toArray(), [], []);
  const pendingIds = useLiveQuery(async () => new Set((await db.outbox.toArray()).filter((o) => o.op.kind === "feedback").map((o) => (o.op.data as { id: string }).id)), [], new Set<string>());

  const len = text.trim().length;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (len < MIN) { setErr(`Escribe al menos ${MIN} caracteres para que podamos entenderte.`); return; }
    setBusy(true);
    try {
      await sendFeedback(cat, text, from ?? null);
      setText(""); void haptic("success");
      setDone(navigator.onLine ? "¡Gracias! Tu comentario llegó al autor de la app. Aquí abajo verás si lo revisa o te responde."
        : "¡Gracias! Lo guardamos y se enviará solo cuando vuelvas a tener internet.");
    } catch { setErr("No se pudo guardar tu comentario. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <LargeTitle title="Comentarios" subtitle="¿Encontraste un error o tienes una idea? Cuéntanos: cada comentario llega directo al autor para corregir y mejorar la app." />

      <form onSubmit={submit} className="mb-10" noValidate>
        <fieldset>
          <legend className="mb-2 px-1 text-[13px] font-normal uppercase tracking-wide text-muted">¿De qué se trata?</legend>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de comentario">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="radio" aria-checked={cat === id} onClick={() => setCat(id)}
                className={clsx("pressable flex min-h-12 items-center gap-2 rounded-xl px-3 text-left text-[15px] font-medium",
                  cat === id ? "bg-brand text-brand-fg" : "bg-surface")}>
                <Icon size={18} aria-hidden className="shrink-0" /> {label}
              </button>
            ))}
          </div>
          <p className="mt-2 px-1 text-[14px] text-muted">{CATEGORIES.find((c) => c.id === cat)!.hint}</p>
        </fieldset>

        <label htmlFor="fb-text" className="mt-5 block px-1 text-[13px] uppercase tracking-wide text-muted">Tu comentario</label>
        <textarea id="fb-text" value={text} onChange={(e) => { setText(e.target.value.slice(0, MAX)); setDone(null); }} rows={6} maxLength={MAX}
          placeholder={cat === "content" ? "Ej.: En la lección 11.5 dice que /26 tiene 64 hosts utilizables, pero son 62." : "Cuéntanos con detalle qué pasó o qué te gustaría…"}
          aria-invalid={!!err || undefined} aria-describedby="fb-count fb-info"
          className="mt-1.5 w-full resize-y rounded-xl bg-surface p-4 text-[17px] leading-relaxed outline-none ring-brand/40 focus:ring-2" />
        <div className="mt-1 flex justify-between px-1 text-[13px] text-muted">
          <span id="fb-info">{from ? <>Se enviará indicando la pantalla <b className="font-mono text-fg">{from}</b>.</> : "Se enviará con la versión de la app y tu dispositivo (web o Android)."}</span>
          <span id="fb-count" className={clsx("tabular-nums", len > MAX - 100 && "text-warn")}>{len}/{MAX}</span>
        </div>
        {err && <p role="alert" className="mt-3 rounded-xl bg-danger/10 p-3 text-[15px] text-danger">{err}</p>}
        {done && <p role="status" className="mt-3 rounded-xl bg-ok/12 p-3 text-[15px]">{done}</p>}
        <Button type="submit" className="mt-4 w-full" disabled={busy || len === 0}><Send size={18} aria-hidden /> {busy ? "Enviando…" : "Enviar comentario"}</Button>
      </form>

      <section aria-labelledby="mine-title">
        <h2 id="mine-title" className="mb-2 px-1 text-[13px] font-normal uppercase tracking-wide text-muted">Mis comentarios</h2>
        {mine.length === 0 ? (
          <p className="rounded-xl bg-surface p-5 text-center text-[15px] text-muted">Aún no has enviado comentarios.</p>
        ) : (
          <ul className="space-y-3">
            {mine.map((f) => {
              const st = STATUS[pendingIds.has(f.id) ? "pending" : f.status];
              const c = CATEGORIES.find((x) => x.id === f.category)!;
              return (
                <li key={f.id} className="rounded-xl bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[13px]">
                    <span className="inline-flex items-center gap-1 font-semibold"><c.icon size={14} aria-hidden /> {c.label}</span>
                    <span className="text-muted">· {fmtDate(f.createdAt)}</span>
                    <span className={clsx("ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold", st.cls)}><st.icon size={13} aria-hidden /> {st.label}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-[16px]">{f.message}</p>
                  {f.page && <p className="mt-1 font-mono text-[12px] text-muted">{f.page}</p>}
                  {f.reply && (
                    <div className="mt-3 rounded-lg bg-brand/8 p-3">
                      <p className="flex items-center gap-1 text-[13px] font-semibold text-brand"><Reply size={14} aria-hidden /> Respuesta del autor</p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">{f.reply}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
