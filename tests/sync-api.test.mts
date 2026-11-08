/**
 * Pruebas de POST /api/sync con una BD simulada (no toca Neon).
 * Ejecutar: npm test
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

type Call = { table: string; values: unknown };
let calls: Call[] = [];
let failWith: { onTable: string; code?: string } | null = null;
let dbEnabled = true;

const tableName = (t: unknown) => (t as Record<symbol, string>)[Symbol.for("drizzle:Name")] ?? "?";
function fakeDb() {
  return {
    insert(table: unknown) {
      const name = tableName(table);
      return {
        values(values: unknown) {
          const run = async () => {
            if (failWith && failWith.onTable === name) throw Object.assign(new Error("boom"), { code: failWith.code });
            calls.push({ table: name, values });
          };
          const chain = { onConflictDoUpdate: () => ({ then: (r: () => void, j: (e: unknown) => void) => run().then(r, j) }),
            onConflictDoNothing: () => ({ then: (r: () => void, j: (e: unknown) => void) => run().then(r, j) }) };
          return chain;
        },
      };
    },
  };
}

mock.module(pathToFileURL(path.resolve("src/db/client.ts")).href, { exports: { getDb: () => (dbEnabled ? fakeDb() : null) } });
mock.module("server-only", { exports: {} });

const { POST, OPTIONS } = await import("../src/app/api/sync/route");

const USER = "11111111-1111-4111-8111-111111111111";
const ATTEMPT = "22222222-2222-4222-8222-222222222222";
const post = (body: unknown, origin?: string) =>
  POST(new Request("http://x/api/sync", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json", ...(origin ? { origin } : {}) } }));
const reset = () => { calls = []; failWith = null; dbEnabled = true; };

const lesson = (seq: number, extra: Record<string, unknown> = {}) =>
  ({ seq, op: { kind: "lesson", data: { lessonId: "1.1", percent: 100, done: true, updatedAt: 1, ...extra } } });

test("cuerpo no JSON o sin userId → 400", async () => {
  reset();
  assert.equal((await post("no-json")).status, 400);
  assert.equal((await post({ ops: [lesson(1)] })).status, 400);
  assert.equal((await post({ userId: USER, ops: [] })).status, 400);
});

test("sin BD configurada → 503 (el cliente conserva la cola)", async () => {
  reset(); dbEnabled = false;
  assert.equal((await post({ userId: USER, ops: [lesson(1)] })).status, 503);
});

test("lote válido: se aplica en orden y el usuario se crea primero", async () => {
  reset();
  const res = await post({ userId: USER, ops: [
    { seq: 1, op: { kind: "attempt", data: { id: ATTEMPT, examId: "practica", kind: "practice", questionOrder: ["m1-01"], startedAt: 1, finishedAt: null, score: null, passed: null } } },
    { seq: 2, op: { kind: "answer", data: { attemptId: ATTEMPT, questionId: "m1-01", answer: ["0"], isCorrect: true, answeredAt: 2 } } },
    lesson(3),
  ] });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { applied: [1, 2, 3], rejected: [] });
  assert.deepEqual(calls.map((c) => c.table), ["users", "exam_attempts", "attempt_answers", "lesson_progress"]);
});

test("una operación inválida se rechaza sola y NO bloquea el resto del lote", async () => {
  reset();
  const res = await post({ userId: USER, ops: [
    lesson(1),
    { seq: 2, op: { kind: "game", data: { id: ATTEMPT, gameSlug: "torre-osi", level: 1, score: 7.5, durationSec: 3, playedAt: 1 } } },
    { seq: 3, op: { kind: "desconocido", data: {} } },
    lesson(4, { lessonId: "2.1" }),
  ] });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.applied, [1, 4]);
  assert.deepEqual(body.rejected.map((r: { seq: number }) => r.seq), [2, 3]);
});

test("violación de integridad (23xxx) se rechaza; error transitorio corta el lote para reintentar", async () => {
  reset(); failWith = { onTable: "attempt_answers", code: "23503" };
  let body = await (await post({ userId: USER, ops: [
    { seq: 1, op: { kind: "answer", data: { attemptId: ATTEMPT, questionId: "m1-01", answer: ["0"], isCorrect: true, answeredAt: 2 } } }, lesson(2)] })).json();
  assert.deepEqual(body, { applied: [2], rejected: [{ seq: 1, reason: "23503" }] });

  reset(); failWith = { onTable: "lesson_progress" };
  body = await (await post({ userId: USER, ops: [lesson(1), lesson(2)] })).json();
  assert.deepEqual(body, { applied: [], rejected: [] });
});

test("CORS: solo orígenes de la APK", async () => {
  reset();
  const ok = await OPTIONS(new Request("http://x/api/sync", { method: "OPTIONS", headers: { origin: "https://localhost" } }));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get("access-control-allow-origin"), "https://localhost");
  const evil = await post({ userId: USER, ops: [lesson(1)] }, "https://evil.example");
  assert.equal(evil.headers.get("access-control-allow-origin"), null);
});
