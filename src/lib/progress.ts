/**
 * API de alto nivel para la interfaz. Cada función:
 *   escribe en IndexedDB + encola para el servidor (misma transacción, todo o nada)
 *   y luego pide sincronizar. Si no hay red, no pasa nada: queda en cola.
 */
import { db, getProfile, levelFor, type LocalAttempt, type LocalFocus } from "./local-db";
import { enqueue } from "./sync";
import { requestSync } from "./sync-client";

export { XP_PER_LEVEL } from "./local-db";

async function bumpXp(amount: number) {
  if (amount === 0) return;
  const p = await getProfile();
  const xp = Math.max(0, p.xp + amount);
  const next = { ...p, xp, level: levelFor(xp), updatedAt: Date.now() };
  await db.profile.put(next);
  await enqueue({ kind: "profile", data: { displayName: next.displayName, xp, level: next.level, streakDays: next.streakDays, updatedAt: next.updatedAt } });
}

export async function setLessonProgress(lessonId: string, done: boolean, percent = done ? 100 : 0) {
  await getProfile();
  await db.transaction("rw", [db.lessons, db.profile, db.outbox], async () => {
    const prev = await db.lessons.get(lessonId);
    const data = { lessonId, percent, done, updatedAt: Date.now() };
    await db.lessons.put(data);
    await enqueue({ kind: "lesson", data });
    if (done && !prev?.done) await bumpXp(10);
    if (!done && prev?.done) await bumpXp(-10);
  });
  void requestSync();
}

export async function startAttempt(a: Omit<LocalAttempt, "id" | "startedAt" | "finishedAt" | "score" | "passed">) {
  const data: LocalAttempt = { ...a, id: crypto.randomUUID(), startedAt: Date.now(), finishedAt: null, score: null, passed: null };
  await db.transaction("rw", [db.attempts, db.outbox], async () => {
    await db.attempts.add(data);
    await enqueue({ kind: "attempt", data });
  });
  void requestSync();
  return data.id;
}

export async function saveAnswer(attemptId: string, questionId: string, answer: string[], isCorrect: boolean) {
  const data = { attemptId, questionId, answer, isCorrect, answeredAt: Date.now() };
  await db.transaction("rw", [db.answers, db.outbox], async () => {
    await db.answers.put(data);
    await enqueue({ kind: "answer", data });
  });
  void requestSync();
}

export async function finishAttempt(attemptId: string, score: number, passScore: number) {
  await getProfile();
  await db.transaction("rw", [db.attempts, db.profile, db.outbox], async () => {
    const a = await db.attempts.get(attemptId);
    if (!a || a.finishedAt) return;
    const data = { ...a, finishedAt: Date.now(), score, passed: score >= passScore };
    await db.attempts.put(data);
    await enqueue({ kind: "attempt", data });
    await bumpXp(Math.round(score / 2) + (data.passed ? 25 : 0));
  });
  void requestSync();
}

export async function recordGame(gameSlug: string, level: number, score: number, durationSec: number, xp = 15) {
  await getProfile();
  const data = { id: crypto.randomUUID(), gameSlug, level, score, durationSec, playedAt: Date.now() };
  await db.transaction("rw", [db.games, db.profile, db.outbox], async () => {
    await db.games.add(data);
    await enqueue({ kind: "game", data });
    await bumpXp(xp);
  });
  void requestSync();
}

export async function awardBadge(badgeId: string) {
  await db.transaction("rw", [db.badges, db.outbox], async () => {
    if (await db.badges.get(badgeId)) return;
    const data = { badgeId, earnedAt: Date.now() };
    await db.badges.add(data);
    await enqueue({ kind: "badge", data });
  });
  void requestSync();
}

export async function saveFocus(data: LocalFocus, xpDelta = 0) {
  await getProfile();
  await db.transaction("rw", [db.focus, db.profile, db.outbox], async () => {
    await db.focus.put(data);
    await enqueue({ kind: "focus", data });
    await bumpXp(xpDelta);
  });
  void requestSync();
}
