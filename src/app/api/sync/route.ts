/**
 * POST /api/sync — recibe la cola del dispositivo y la aplica en orden.
 * Idempotente: reenviar el mismo lote no duplica nada.
 * Respuestas:
 *   200 { applied, rejected } → el cliente borra ambos de su cola
 *   400 cuerpo inválido · 503 BD no configurada / caída → el cliente reintenta luego
 */
import { NextResponse } from "next/server";
import { sql, eq, inArray } from "drizzle-orm";
import { getDb, type DB } from "@/db/client";
import { users, examAttempts, attemptAnswers, lessonProgress, gameScores, userBadges, focusSessions } from "@/db/schema";
import { SyncEnvelope, SyncOp, type SyncResponse, type PullResponse } from "@/lib/sync-protocol";
import { sessionUser } from "@/lib/server/auth";
import { withCors, preflight } from "@/lib/server/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const d = (ms: number) => new Date(ms);
const dn = (ms: number | null) => (ms == null ? null : new Date(ms));


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

export const OPTIONS = preflight;
export const POST = withCors(push);
export const GET = withCors(pull);

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

/** Un usuario con cuenta (contraseña) solo acepta cambios con un token de SU sesión. Los anónimos siguen igual. */
async function authorize(db: DB, req: Request, userId: string): Promise<Response | null> {
  const [u] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  if (!u?.passwordHash) return null;
  const owner = await sessionUser(db, req);
  return owner === userId ? null : json({ error: "auth" }, 401);
}

async function push(req: Request): Promise<Response> {
  const parsed = SyncEnvelope.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Cuerpo inválido" }, 400);

  const db = getDb();
  if (!db) return json({ error: "Base de datos no configurada" }, 503);

  const { userId, ops } = parsed.data;
  const out: SyncResponse = { applied: [], rejected: [] };

  try {
    const denied = await authorize(db, req, userId);
    if (denied) return denied;
    // Garantiza que el usuario exista antes de cualquier FK.
    await db.insert(users).values({ id: userId, updatedAt: new Date(0) }).onConflictDoNothing();
  } catch (e) {
    console.error("sync: DB unavailable", e);
    return json({ error: "Base de datos no disponible" }, 503);
  }

  // En orden: un intento siempre llega antes que sus respuestas.
  for (const { seq, op: raw } of ops) {
    const op = SyncOp.safeParse(raw);
    if (!op.success) { out.rejected.push({ seq, reason: "invalid" }); continue; }
    try {
      if (op.data.kind === "answer" && !(await ownsAttempt(db, userId, op.data.data.attemptId))) {
        out.rejected.push({ seq, reason: "forbidden" }); continue;
      }
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
  return json(out);
}

/** Una respuesta solo se guarda en un intento del mismo alumno (o si el intento aún no existe: la FK lo rechazará). */
async function ownsAttempt(db: DB, userId: string, attemptId: string) {
  const [a] = await db.select({ userId: examAttempts.userId }).from(examAttempts).where(eq(examAttempts.id, attemptId)).limit(1);
  return !a || a.userId === userId;
}

/** GET /api/sync — descarga todo el progreso de la cuenta (requiere sesión). Se usa al iniciar sesión y periódicamente. */
async function pull(req: Request): Promise<Response> {
  const db = getDb();
  if (!db) return json({ error: "Base de datos no configurada" }, 503);
  try {
    const userId = await sessionUser(db, req);
    if (!userId) return json({ error: "auth" }, 401);
    const ms = (d: Date | null) => (d ? d.getTime() : null);
    const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [lessons, attempts, games, badges, focus] = await Promise.all([
      db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId)),
      db.select().from(examAttempts).where(eq(examAttempts.userId, userId)),
      db.select().from(gameScores).where(eq(gameScores.userId, userId)),
      db.select().from(userBadges).where(eq(userBadges.userId, userId)),
      db.select().from(focusSessions).where(eq(focusSessions.userId, userId)),
    ]);
    const answers = attempts.length
      ? await db.select().from(attemptAnswers).where(inArray(attemptAnswers.attemptId, attempts.map((a) => a.id)))
      : [];
    const body: PullResponse = {
      profile: { displayName: u.displayName, xp: u.xp, level: u.level, streakDays: u.streakDays, updatedAt: u.updatedAt.getTime() },
      lessons: lessons.map((l) => ({ lessonId: l.lessonId, percent: l.percent, done: l.done, updatedAt: l.updatedAt.getTime() })),
      attempts: attempts.map((a) => ({ id: a.id, examId: a.examId, kind: a.kind, questionOrder: a.questionOrder, startedAt: a.startedAt.getTime(),
        finishedAt: ms(a.finishedAt), score: a.score, passed: a.passed })),
      answers: answers.map((a) => ({ attemptId: a.attemptId, questionId: a.questionId, answer: a.answer, isCorrect: a.isCorrect, answeredAt: a.answeredAt.getTime() })),
      games: games.map((g) => ({ id: g.id, gameSlug: g.gameSlug, level: g.level, score: g.score, durationSec: g.durationSec, playedAt: g.playedAt.getTime() })),
      badges: badges.map((b) => ({ badgeId: b.badgeId, earnedAt: b.earnedAt.getTime() })),
      focus: focus.map((f) => ({ id: f.id, startedAt: f.startedAt.getTime(), endedAt: ms(f.endedAt), targetSec: f.targetSec, status: f.status,
        interruptions: f.interruptions, platform: f.platform === "android" ? "android" : "web", updatedAt: f.updatedAt.getTime() })),
    };
    return json(body);
  } catch (e) {
    console.error("sync pull:", e);
    return json({ error: "Base de datos no disponible" }, 503);
  }
}
