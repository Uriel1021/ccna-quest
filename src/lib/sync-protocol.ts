/**
 * Contrato compartido entre el cliente (outbox en IndexedDB) y el servidor (/api/sync).
 * Las fechas viajan como milisegundos epoch.
 */
import { z } from "zod";

const ms = z.number().int().nonnegative();

export const ProfileOp = z.object({
  kind: z.literal("profile"),
  data: z.object({ displayName: z.string().min(1).max(60), xp: z.number().int().min(0), level: z.number().int().min(1), streakDays: z.number().int().min(0), updatedAt: ms }),
});
export const AttemptOp = z.object({
  kind: z.literal("attempt"),
  data: z.object({
    id: z.uuid(), examId: z.string().max(64), kind: z.enum(["module", "checkpoint", "final", "practice"]),
    questionOrder: z.array(z.string()).max(200), startedAt: ms, finishedAt: ms.nullable(),
    score: z.number().int().min(0).max(100).nullable(), passed: z.boolean().nullable(),
  }),
});
export const AnswerOp = z.object({
  kind: z.literal("answer"),
  data: z.object({ attemptId: z.uuid(), questionId: z.string().max(64), answer: z.array(z.string()).max(20), isCorrect: z.boolean(), answeredAt: ms }),
});
export const LessonOp = z.object({
  kind: z.literal("lesson"),
  data: z.object({ lessonId: z.string().max(16), percent: z.number().int().min(0).max(100), done: z.boolean(), updatedAt: ms }),
});
export const GameOp = z.object({
  kind: z.literal("game"),
  data: z.object({ id: z.uuid(), gameSlug: z.string().max(40), level: z.number().int().min(1), score: z.number().int(), durationSec: z.number().int().min(0), playedAt: ms }),
});
export const BadgeOp = z.object({
  kind: z.literal("badge"),
  data: z.object({ badgeId: z.string().max(40), earnedAt: ms }),
});
export const FocusOp = z.object({
  kind: z.literal("focus"),
  data: z.object({
    id: z.uuid(), startedAt: ms, endedAt: ms.nullable(), targetSec: z.number().int().positive(),
    status: z.enum(["active", "completed", "aborted"]), interruptions: z.number().int().min(0),
    platform: z.enum(["android", "web"]), updatedAt: ms,
  }),
});

export const SyncOp = z.discriminatedUnion("kind", [ProfileOp, AttemptOp, AnswerOp, LessonOp, GameOp, BadgeOp, FocusOp]);
export type SyncOp = z.infer<typeof SyncOp>;

export const SyncRequest = z.object({
  userId: z.uuid(),
  ops: z.array(z.object({ seq: z.number().int(), op: SyncOp })).min(1).max(100),
});
export type SyncRequest = z.infer<typeof SyncRequest>;

export type SyncResponse = { applied: number[]; rejected: { seq: number; reason: string }[] };

export const SYNC_TAG = "outbox";
/** En la web es relativo; en la APK apunta al servidor de Vercel. */
export const SYNC_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE ?? ""}/api/sync`;
