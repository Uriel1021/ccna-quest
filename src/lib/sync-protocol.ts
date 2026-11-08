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

export const FEEDBACK_CATEGORIES = ["bug", "content", "idea", "other"] as const;
export const FEEDBACK_STATUSES = ["new", "reviewing", "resolved"] as const;
export const FeedbackOp = z.object({
  kind: z.literal("feedback"),
  data: z.object({
    id: z.uuid(), category: z.enum(FEEDBACK_CATEGORIES), message: z.string().trim().min(5).max(2000),
    page: z.string().max(200).nullable(), appVersion: z.string().max(40).nullable(), platform: z.enum(["android", "web"]),
    createdAt: ms,
  }),
});

export const SyncOp = z.discriminatedUnion("kind", [ProfileOp, AttemptOp, AnswerOp, LessonOp, GameOp, BadgeOp, FocusOp, FeedbackOp]);
export type SyncOp = z.infer<typeof SyncOp>;

export const SyncRequest = z.object({
  userId: z.uuid(),
  ops: z.array(z.object({ seq: z.number().int(), op: SyncOp })).min(1).max(100),
});
export type SyncRequest = z.infer<typeof SyncRequest>;

/**
 * Sobre que valida el servidor: cada `op` se revisa por separado. Así una operación inválida
 * se rechaza sola en vez de tumbar el lote entero (que dejaría la cola del alumno atascada para siempre).
 */
export const SyncEnvelope = z.object({
  userId: z.uuid(),
  ops: z.array(z.object({ seq: z.number().int(), op: z.unknown() })).min(1).max(100),
});

type D<T extends { shape: { data: z.ZodType } }> = z.infer<T["shape"]["data"]>;
/** Respuesta de GET /api/sync: todo el progreso de la cuenta, con el mismo formato que las operaciones. */
export type PullResponse = {
  profile: D<typeof ProfileOp>;
  lessons: D<typeof LessonOp>[];
  attempts: D<typeof AttemptOp>[];
  answers: D<typeof AnswerOp>[];
  games: D<typeof GameOp>[];
  badges: D<typeof BadgeOp>[];
  focus: D<typeof FocusOp>[];
  feedback: FeedbackItem[];
};
/** Comentario tal como lo ve el alumno (con el estado y la respuesta del autor). */
export type FeedbackItem = D<typeof FeedbackOp> & { status: (typeof FEEDBACK_STATUSES)[number]; reply: string | null; updatedAt: number };

export type SyncResponse = { applied: number[]; rejected: { seq: number; reason: string }[] };

export const SYNC_TAG = "outbox";
/** En la web es relativo; en la APK apunta al servidor de Vercel. */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
export const SYNC_ENDPOINT = `${API_BASE}/api/sync`;
