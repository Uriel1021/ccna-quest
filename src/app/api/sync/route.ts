/**
 * POST /api/sync — recibe la cola del dispositivo y la aplica en orden.
 * Idempotente: reenviar el mismo lote no duplica nada.
 * Respuestas:
 *   200 { applied, rejected } → el cliente borra ambos de su cola
 *   400 cuerpo inválido · 503 BD no configurada / caída → el cliente reintenta luego
 */
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, examAttempts, attemptAnswers, lessonProgress, gameScores, userBadges, focusSessions } from "@/db/schema";
import { SyncEnvelope, SyncOp, type SyncResponse } from "@/lib/sync-protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const d = (ms: number) => new Date(ms);
const dn = (ms: number | null) => (ms == null ? null : new Date(ms));

type DB = NonNullable<ReturnType<typeof getDb>>;

async function apply(db: DB, userId: string, op: SyncOp) {
  switch (op.kind) {
    case "profile": {
      const v = op.data;
      await db.insert(users)
        .values({ id: userId, displayName: v.displayName, xp: v.xp, level: v.level, streakDays: v.streakDays, updatedAt: d(v.updatedAt) })
        .onConflictDoUpdate({
          target: users.id,
          set: { displayName: v.displayName, xp: v.xp, level: v.level, streakDays: v.streakDays, updatedAt: d(v.updatedAt) },
          setWhere: sql`${users.updatedAt} < ${d(v.updatedAt)}`,
        });
      return;
    }
    case "attempt": {
      const v = op.data;
      const row = { id: v.id, userId, examId: v.examId, kind: v.kind, questionOrder: v.questionOrder,
        startedAt: d(v.startedAt), finishedAt: dn(v.finishedAt), score: v.score, passed: v.passed };
      // Un intento terminado nunca se "des-termina".
      await db.insert(examAttempts).values(row).onConflictDoUpdate({
        target: examAttempts.id,
        set: { finishedAt: row.finishedAt, score: row.score, passed: row.passed },
        setWhere: sql`${examAttempts.finishedAt} IS NULL AND ${examAttempts.userId} = ${userId}`,
      });
      return;
    }
    case "answer": {
      const v = op.data;
      await db.insert(attemptAnswers)
        .values({ attemptId: v.attemptId, questionId: v.questionId, answer: v.answer, isCorrect: v.isCorrect, answeredAt: d(v.answeredAt) })
        .onConflictDoUpdate({
          target: [attemptAnswers.attemptId, attemptAnswers.questionId],
          set: { answer: v.answer, isCorrect: v.isCorrect, answeredAt: d(v.answeredAt) },
          setWhere: sql`${attemptAnswers.answeredAt} < ${d(v.answeredAt)}`,
        });
      return;
    }
    case "lesson": {
      const v = op.data;
      await db.insert(lessonProgress)
        .values({ userId, lessonId: v.lessonId, percent: v.percent, done: v.done, updatedAt: d(v.updatedAt) })
        .onConflictDoUpdate({
          target: [lessonProgress.userId, lessonProgress.lessonId],
          set: { percent: v.percent, done: v.done, updatedAt: d(v.updatedAt) },
          setWhere: sql`${lessonProgress.updatedAt} < ${d(v.updatedAt)}`,
        });
      return;
    }
    case "game": {
      const v = op.data;
      await db.insert(gameScores)
        .values({ id: v.id, userId, gameSlug: v.gameSlug, level: v.level, score: v.score, durationSec: v.durationSec, playedAt: d(v.playedAt) })
        .onConflictDoNothing();
      return;
    }
    case "badge": {
      await db.insert(userBadges).values({ userId, badgeId: op.data.badgeId, earnedAt: d(op.data.earnedAt) }).onConflictDoNothing();
      return;
    }
    case "focus": {
      const v = op.data;
      const row = { id: v.id, userId, startedAt: d(v.startedAt), endedAt: dn(v.endedAt), targetSec: v.targetSec,
        status: v.status, interruptions: v.interruptions, platform: v.platform, updatedAt: d(v.updatedAt) };
      await db.insert(focusSessions).values(row).onConflictDoUpdate({
        target: focusSessions.id,
        set: { endedAt: row.endedAt, status: row.status, interruptions: row.interruptions, updatedAt: row.updatedAt },
        setWhere: sql`${focusSessions.updatedAt} < ${row.updatedAt} AND ${focusSessions.userId} = ${userId}`,
      });
      return;
    }
  }
}

/* CORS: la APK (Capacitor) llama desde https://localhost. */
const ALLOWED_ORIGINS = new Set(["https://localhost", "capacitor://localhost", "http://localhost"]);
function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req) });
}

export async function POST(req: Request) {
  const res = await handle(req);
  for (const [k, v] of Object.entries(cors(req))) res.headers.set(k, v);
  return res;
}

async function handle(req: Request): Promise<Response> {
  const parsed = SyncEnvelope.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });

  const { userId, ops } = parsed.data;
  const out: SyncResponse = { applied: [], rejected: [] };

  try {
    // Garantiza que el usuario exista antes de cualquier FK.
    await db.insert(users).values({ id: userId, updatedAt: new Date(0) }).onConflictDoNothing();
  } catch (e) {
    console.error("sync: DB unavailable", e);
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 503 });
  }

  // En orden: un intento siempre llega antes que sus respuestas.
  for (const { seq, op: raw } of ops) {
    const op = SyncOp.safeParse(raw);
    if (!op.success) { out.rejected.push({ seq, reason: "invalid" }); continue; }
    try {
      await apply(db, userId, op.data);
      out.applied.push(seq);
    } catch (e) {
      const msg = (e as { code?: string; message?: string });
      // 23xxx = violación de integridad (dato imposible) → se rechaza para no bloquear la cola.
      if (msg.code?.startsWith("23")) { out.rejected.push({ seq, reason: msg.code }); continue; }
      // Error transitorio: devolvemos lo aplicado hasta aquí; el resto se reintenta.
      console.error("sync: transient error", e);
      break;
    }
  }
  return NextResponse.json(out);
}
