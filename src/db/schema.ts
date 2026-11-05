/**
 * Esquema de base de datos (Postgres serverless — Neon / Vercel Postgres) con Drizzle.
 * Migraciones: `npm run db:push` (desarrollo) o `npm run db:generate && npm run db:migrate`.
 *
 * Decisiones offline-first:
 *  - El CONTENIDO (temario, lecciones, banco de preguntas, insignias) vive en el código
 *    (`src/content/*`), se versiona con git y se precarga en el Service Worker → funciona sin red.
 *  - La BD guarda solo el ESTADO del alumno.
 *  - Toda llave primaria es un UUID generado en el dispositivo. Si Background Sync reenvía
 *    el mismo registro, el `ON CONFLICT` lo vuelve idempotente (no hay duplicados).
 *  - Conflictos entre dispositivos: gana la escritura más reciente (`updatedAt`).
 */
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, primaryKey, index, pgEnum } from "drizzle-orm/pg-core";

export const examKindEnum = pgEnum("exam_kind", ["module", "checkpoint", "final", "practice"]);
export const focusStatusEnum = pgEnum("focus_status", ["active", "completed", "aborted"]);

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),                   // generado en el dispositivo
  displayName: text("display_name").notNull().default("Alumno"),
  email: text("email").unique(),                 // se vincula al iniciar sesión (paso posterior)
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streakDays: integer("streak_days").notNull().default(0),
  updatedAt: ts("updated_at").notNull().defaultNow(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

/* Intento de examen. `questionOrder` congela el sorteo aleatorio para poder reanudarlo offline. */
export const examAttempts = pgTable("exam_attempts", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  examId: text("exam_id").notNull(),             // "itn-m1-3", "itn-final"… (definido en src/content)
  kind: examKindEnum("kind").notNull(),
  questionOrder: jsonb("question_order").$type<string[]>().notNull(),
  startedAt: ts("started_at").notNull(),
  finishedAt: ts("finished_at"),
  score: integer("score"),                       // 0..100
  passed: boolean("passed"),
}, (t) => [index("attempt_user_idx").on(t.userId, t.examId)]);

/* Cada respuesta se guarda en el instante en que el alumno la marca. */
export const attemptAnswers = pgTable("attempt_answers", {
  attemptId: uuid("attempt_id").notNull().references(() => examAttempts.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  answer: jsonb("answer").$type<string[]>().notNull(),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: ts("answered_at").notNull(),
}, (t) => [primaryKey({ columns: [t.attemptId, t.questionId] })]);

export const lessonProgress = pgTable("lesson_progress", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),         // "11.5"
  percent: integer("percent").notNull().default(0),
  done: boolean("done").notNull().default(false),
  updatedAt: ts("updated_at").notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.lessonId] })]);

export const gameScores = pgTable("game_scores", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gameSlug: text("game_slug").notNull(),         // "osi-stack", "subnet-sprint"…
  level: integer("level").notNull().default(1),
  score: integer("score").notNull(),
  durationSec: integer("duration_sec").notNull(),
  playedAt: ts("played_at").notNull(),
}, (t) => [index("game_user_idx").on(t.userId, t.gameSlug)]);

export const userBadges = pgTable("user_badges", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull(),           // "subnet-ninja"
  earnedAt: ts("earned_at").notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.badgeId] })]);

export const focusSessions = pgTable("focus_sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startedAt: ts("started_at").notNull(),
  endedAt: ts("ended_at"),
  targetSec: integer("target_sec").notNull().default(3600),
  status: focusStatusEnum("status").notNull().default("active"),
  interruptions: integer("interruptions").notNull().default(0),
  platform: text("platform").notNull(),          // "android" | "web"
  updatedAt: ts("updated_at").notNull(),
});
