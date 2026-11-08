/**
 * Bandeja de comentarios del autor (solo administradores: ADMIN_EMAILS).
 *   GET  /api/feedback?status=new|reviewing|resolved|all   → lista (más recientes primero)
 *   POST /api/feedback { id, status?, reply? }             → cambia estado y/o responde
 * Los alumnos envían comentarios por /api/sync (funciona sin conexión) y ven la respuesta al sincronizar.
 */
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, type DB } from "@/db/client";
import { feedback, users } from "@/db/schema";
import { sessionUser, isAdminEmail } from "@/lib/server/auth";
import { withCors, preflight } from "@/lib/server/cors";
import { FEEDBACK_STATUSES } from "@/lib/sync-protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

async function requireAdmin(db: DB, req: Request): Promise<Response | null> {
  const id = await sessionUser(db, req);
  if (!id) return json({ error: "Tu sesión expiró. Vuelve a iniciar sesión." }, 401);
  const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, id)).limit(1);
  return isAdminEmail(u?.email) ? null : json({ error: "Esta sección es solo para el autor de la app." }, 403);
}

async function list(req: Request) {
  const db = getDb();
  if (!db) return json({ error: "Base de datos no configurada" }, 503);
  const denied = await requireAdmin(db, req);
  if (denied) return denied;
  const status = new URL(req.url).searchParams.get("status") ?? "all";
  const base = db.select({
    id: feedback.id, category: feedback.category, message: feedback.message, page: feedback.page, appVersion: feedback.appVersion,
    platform: feedback.platform, status: feedback.status, reply: feedback.reply, createdAt: feedback.createdAt, updatedAt: feedback.updatedAt,
    userName: users.displayName, userEmail: users.email,
  }).from(feedback).innerJoin(users, eq(users.id, feedback.userId));
  const rows = await ((FEEDBACK_STATUSES as readonly string[]).includes(status)
    ? base.where(eq(feedback.status, status as (typeof FEEDBACK_STATUSES)[number]))
    : base).orderBy(desc(feedback.createdAt)).limit(500);
  return json({ items: rows.map((r) => ({ ...r, createdAt: r.createdAt.getTime(), updatedAt: r.updatedAt.getTime() })) });
}

const Update = z.object({
  id: z.uuid(),
  status: z.enum(FEEDBACK_STATUSES).optional(),
  reply: z.string().trim().max(2000).nullable().optional(),
}).refine((v) => v.status !== undefined || v.reply !== undefined, { message: "Nada que cambiar." });

async function update(req: Request) {
  const db = getDb();
  if (!db) return json({ error: "Base de datos no configurada" }, 503);
  const denied = await requireAdmin(db, req);
  if (denied) return denied;
  const b = Update.safeParse(await req.json().catch(() => null));
  if (!b.success) return json({ error: b.error.issues[0]?.message ?? "Datos inválidos." }, 400);
  const { id, status, reply } = b.data;
  const set = { updatedAt: new Date(), ...(status ? { status } : {}), ...(reply !== undefined ? { reply: reply || null } : {}) };
  const rows = await db.update(feedback).set(set).where(eq(feedback.id, id)).returning({ id: feedback.id });
  return rows.length ? json({ ok: true }) : json({ error: "No existe ese comentario." }, 404);
}

export const OPTIONS = preflight;
export const GET = withCors(list);
export const POST = withCors(update);
