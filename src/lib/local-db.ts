/**
 * Base de datos local (IndexedDB vía Dexie). Es la "fuente de verdad" en el dispositivo:
 * la interfaz SIEMPRE lee y escribe aquí; el servidor es solo una réplica.
 * Este módulo no usa `window`, así que también funciona dentro del Service Worker.
 */
import Dexie, { type Table } from "dexie";
import type { SyncOp } from "./sync-protocol";

type Data<K extends SyncOp["kind"]> = Extract<SyncOp, { kind: K }>["data"];

export type LocalProfile = Data<"profile"> & { key: "me"; userId: string };
export type LocalAttempt = Data<"attempt">;
export type LocalAnswer = Data<"answer">;
export type LocalLesson = Data<"lesson">;
export type LocalGame = Data<"game">;
export type LocalBadge = Data<"badge">;
export type LocalFocus = Data<"focus">;

export type OutboxItem = { seq?: number; op: SyncOp; createdAt: number; tries: number; lastError?: string };
export type MetaItem = { key: string; value: unknown };

export class LocalDB extends Dexie {
  profile!: Table<LocalProfile, "me">;
  attempts!: Table<LocalAttempt, string>;
  answers!: Table<LocalAnswer, [string, string]>;
  lessons!: Table<LocalLesson, string>;
  games!: Table<LocalGame, string>;
  badges!: Table<LocalBadge, string>;
  focus!: Table<LocalFocus, string>;
  outbox!: Table<OutboxItem, number>;
  meta!: Table<MetaItem, string>;

  constructor() {
    super("ccna-quest");
    this.version(1).stores({
      profile: "key",
      attempts: "id, examId, startedAt",
      answers: "[attemptId+questionId], attemptId",
      lessons: "lessonId, updatedAt",
      games: "id, gameSlug, playedAt",
      badges: "badgeId",
      focus: "id, status, startedAt",
      outbox: "++seq, createdAt",
      meta: "key",
    });
  }
}

export const db = new LocalDB();

export const XP_PER_LEVEL = 250;
export const levelFor = (xp: number) => 1 + Math.floor(xp / XP_PER_LEVEL);

/** Perfil del dispositivo. Se crea la primera vez con un UUID anónimo. */
export async function getProfile(): Promise<LocalProfile> {
  const existing = await db.profile.get("me");
  if (existing) return existing;
  const fresh: LocalProfile = {
    key: "me", userId: crypto.randomUUID(), displayName: "Alumno", xp: 0, level: 1, streakDays: 0, updatedAt: Date.now(),
  };
  // `add` falla si otra pestaña lo creó al mismo tiempo; en ese caso devolvemos el suyo.
  try { await db.profile.add(fresh); return fresh; } catch { return (await db.profile.get("me"))!; }
}

/* ── Sesión de la cuenta (si el alumno inició sesión) ── */
export type LocalSession = { token: string; userId: string; email: string; displayName: string; expired?: boolean };
export const getSession = async () => (await db.meta.get("session"))?.value as LocalSession | undefined;
export const setSession = (s: LocalSession | null) => (s ? db.meta.put({ key: "session", value: s }) : db.meta.delete("session"));
