"use client";
/** Bandeja del autor: todos los comentarios, con filtros, respuesta y estado. Solo cuentas en ADMIN_EMAILS. */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { Button, LargeTitle } from "@/components/ui/apple";
import { useLiveQuery } from "@/lib/use-live-query";
import { getSession } from "@/lib/local-db";
import { API_BASE, type FeedbackItem } from "@/lib/sync-protocol";
import { CATEGORIES, STATUS } from "./FeedbackPage";

type Item = Omit<FeedbackItem, "platform"> & { platform: string | null; userName: string; userEmail: string | null };
type Filter = FeedbackItem["status"] | "all";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "new", label: "Nuevos" }, { id: "reviewing", label: "En revisión" }, { id: "resolved", label: "Resueltos" }, { id: "all", label: "Todos" },
];
const fmt = (ms: number) => new Date(ms).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Card({ item, token, onChanged }: { item: Item; token: string; onChanged: () => void }) {
  const [reply, setReply] = useState(item.reply ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const c = CATEGORIES.find((x) => x.id === item.category)!;
  const save = async (patch: { status?: FeedbackItem["status"]; reply?: string | null }) => {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: item.id, ...patch }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`);
      setMsg("Guardado."); onChanged();
    } catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); }
  };
  return (
    <li className="rounded-xl bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="inline-flex items-center gap-1 font-semibold"><c.icon size={14} aria-hidden /> {c.label}</span>
        <span className="text-muted">· {fmt(item.createdAt)}</span>
        <span className={clsx("ml-auto rounded-full px-2.5 py-0.5 font-semibold", STATUS[item.status].cls)}>{STATUS[item.status].label}</span>
      </div>
      <p className="mt-1 text-[14px]"><b>{item.userName}</b> <span className="text-muted">{item.userEmail}</span></p>
      <p className="mt-2 whitespace-pre-wrap break-words text-[16px]">{item.message}</p>
      <p className="mt-1 text-[12px] text-muted">
        {item.page && <><Link href={item.page} className="font-mono text-brand">{item.page}</Link> · </>}
        {item.platform ?? "?"} · v{item.appVersion ?? "?"}
      </p>
      <label className="mt-3 block text-[13px] text-muted" htmlFor={`r-${item.id}`}>Respuesta para el alumno (la verá en “Mis comentarios”)</label>
      <textarea id={`r-${item.id}`} value={reply} onChange={(e) => setReply(e.target.value.slice(0, 2000))} rows={2}
        className="mt-1 w-full rounded-lg bg-fill p-3 text-[15px] outline-none ring-brand/40 focus:ring-2" />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="tinted" className="min-h-9 px-4 text-[15px]" disabled={busy || reply === (item.reply ?? "")} onClick={() => void save({ reply: reply.trim() || null })}>Guardar respuesta</Button>
        {(["new", "reviewing", "resolved"] as const).filter((s) => s !== item.status).map((s) => (
          <Button key={s} variant="plain" className="min-h-9 px-3 text-[15px]" disabled={busy} onClick={() => void save({ status: s })}>Marcar “{STATUS[s].label}”</Button>
        ))}
      </div>
      {msg && <p role="status" className="mt-1 text-[13px] text-muted">{msg}</p>}
    </li>
  );
}

export function FeedbackInbox() {
  const session = useLiveQuery(() => getSession(), [], null);
  const [filter, setFilter] = useState<Filter>("new");
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = session?.token;

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/feedback?status=${filter}`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) { setItems(null); setError(body.error ?? `Error ${res.status}`); return; }
      setItems(body.items);
    } catch { setError("Necesitas conexión a internet para ver la bandeja."); }
  }, [token, filter]);
  useEffect(() => { void load(); }, [load]);

  return (
    <div className="mx-auto max-w-3xl">
      <LargeTitle title="Bandeja de comentarios" subtitle="Lo que los alumnos reportan y sugieren.">
        <Button variant="tinted" className="min-h-9 px-4 text-[15px]" onClick={() => void load()}><RefreshCw size={16} aria-hidden /> Actualizar</Button>
      </LargeTitle>
      <div className="mb-5 flex rounded-lg bg-fill p-0.5 text-[14px] font-semibold" role="tablist" aria-label="Filtrar por estado">
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
            className={clsx("min-h-9 flex-1 rounded-md", filter === f.id ? "bg-surface shadow-sm" : "text-muted")}>{f.label}</button>
        ))}
      </div>
      {error ? (
        <p className="flex items-start gap-3 rounded-xl bg-warn/15 p-4 text-[15px]" role="alert"><ShieldAlert className="shrink-0 text-warn" aria-hidden /> {error}</p>
      ) : items === null ? (
        <p className="py-10 text-center text-muted">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-center text-muted">No hay comentarios en esta sección.</p>
      ) : (
        <ul className="space-y-3">{items.map((it) => <Card key={`${it.id}-${it.updatedAt}`} item={it} token={token!} onChanged={() => void load()} />)}</ul>
      )}
    </div>
  );
}
