/**
 * Integración de /api/auth/* y /api/sync contra Postgres REAL en memoria (PGlite) con las migraciones del repo.
 * No toca Neon. Ejecutar: npm test
 */
import { test, mock, before } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema.ts";

const db = drizzle(new PGlite(), { schema });
mock.module(pathToFileURL(path.resolve("src/db/client.ts")).href, { exports: { getDb: () => db } });
mock.module("server-only", { exports: {} });

const auth = await import("../src/app/api/auth/[action]/route.ts");
const sync = await import("../src/app/api/sync/route.ts");

before(async () => { await migrate(db, { migrationsFolder: "drizzle" }); });

type J = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
async function call(action: string, body?: unknown, token?: string, method = "POST"): Promise<{ status: number; json: J }> {
  const req = new Request(`http://x/api/auth/${action}`, {
    method, body: body ? JSON.stringify(body) : undefined,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
  });
  const res = await (method === "GET" ? auth.GET : auth.POST)(req, { params: Promise.resolve({ action }) });
  return { status: res.status, json: await res.json() };
}
async function push(userId: string, ops: unknown[], token?: string) {
  const res = await sync.POST(new Request("http://x/api/sync", { method: "POST", body: JSON.stringify({ userId, ops: ops.map((op, i) => ({ seq: i + 1, op })) }),
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) } }));
  return { status: res.status, json: await res.json() as J };
}
const pull = async (token?: string) => {
  const res = await sync.GET(new Request("http://x/api/sync", { headers: token ? { authorization: `Bearer ${token}` } : {} }));
  return { status: res.status, json: await res.json() as J };
};

const U1 = "aaaaaaaa-0000-4000-8000-000000000001";
const U2 = "aaaaaaaa-0000-4000-8000-000000000002";
const ATT = "bbbbbbbb-0000-4000-8000-000000000001";
const lesson = (id: string, at = Date.now()) => ({ kind: "lesson", data: { lessonId: id, percent: 100, done: true, updatedAt: at } });
const attempt = { kind: "attempt", data: { id: ATT, examId: "practica", kind: "practice", questionOrder: ["m1-01"], startedAt: 1, finishedAt: 2, score: 100, passed: true } };
const answer = (attemptId = ATT) => ({ kind: "answer", data: { attemptId, questionId: "m1-01", answer: ["0"], isCorrect: true, answeredAt: 3 } });

let token1 = "", code1 = "";

test("registro: valida correo, contraseña y nombre", async () => {
  assert.equal((await call("register", { userId: U1, email: "no-es-correo", password: "12345678", displayName: "Ana" })).json.field, "email");
  const short = await call("register", { userId: U1, email: "ana@ejemplo.com", password: "123", displayName: "Ana" });
  assert.equal(short.status, 400); assert.equal(short.json.field, "password");
  assert.equal((await call("register", { userId: U1, email: "ana@ejemplo.com", password: "12345678", displayName: " " })).json.field, "displayName");
});

test("registro reclama al alumno anónimo y CONSERVA su progreso", async () => {
  assert.equal((await push(U1, [lesson("1.1"), attempt, answer()])).json.applied.length, 3);
  const r = await call("register", { userId: U1, email: "  Ana@Ejemplo.com ", password: "contraseña-segura", displayName: "Ana" });
  assert.equal(r.status, 200);
  assert.equal(r.json.user.id, U1);
  assert.equal(r.json.user.email, "ana@ejemplo.com");
  assert.match(r.json.recoveryCode, /^[2-9A-HJKMNP-Z]{4}(-[2-9A-HJKMNP-Z]{4}){3}$/);
  token1 = r.json.token; code1 = r.json.recoveryCode;
  const p = await pull(token1);
  assert.equal(p.status, 200);
  assert.deepEqual(p.json.lessons.map((l: J) => l.lessonId), ["1.1"]);
  assert.equal(p.json.attempts.length, 1);
  assert.equal(p.json.answers.length, 1);
  const [row] = await db.select().from(schema.users).where(eq(schema.users.id, U1));
  assert.ok(row.passwordHash?.startsWith("scrypt$") && !row.passwordHash.includes("contraseña"));
});

test("registro con correo repetido → 409", async () => {
  const r = await call("register", { userId: U2, email: "ana@ejemplo.com", password: "otra-contraseña", displayName: "Otra" });
  assert.equal(r.status, 409); assert.equal(r.json.field, "email");
});

test("sincronizar una cuenta exige SU token", async () => {
  assert.equal((await push(U1, [lesson("1.2")])).status, 401, "sin token");
  const b = await call("register", { userId: U2, email: "beto@ejemplo.com", password: "contraseña-beto", displayName: "Beto" });
  assert.equal((await push(U1, [lesson("1.2")], b.json.token)).status, 401, "con token de otro");
  assert.deepEqual((await push(U1, [lesson("1.2")], token1)).json.applied, [1]);
  assert.equal((await pull()).status, 401, "descargar sin token");
});

test("no se pueden escribir respuestas en el intento de otro alumno", async () => {
  const b = await call("login", { email: "beto@ejemplo.com", password: "contraseña-beto" });
  const r = await push(U2, [answer(ATT)], b.json.token);
  assert.deepEqual(r.json.rejected, [{ seq: 1, reason: "forbidden" }]);
});

test("login: mismo mensaje para correo inexistente o contraseña mala; correcto → token", async () => {
  const a = await call("login", { email: "nadie@ejemplo.com", password: "x" });
  const b = await call("login", { email: "ana@ejemplo.com", password: "mala" });
  assert.equal(a.status, 401); assert.equal(b.status, 401); assert.equal(a.json.error, b.json.error);
  const ok = await call("login", { email: "ANA@ejemplo.com", password: "contraseña-segura" });
  assert.equal(ok.status, 200); assert.equal(ok.json.user.displayName, "Ana");
  assert.equal((await call("me", undefined, ok.json.token, "GET")).json.user.email, "ana@ejemplo.com");
});

test("bloqueo temporal tras 5 intentos fallidos (aunque luego acierte)", async () => {
  await call("register", { userId: "aaaaaaaa-0000-4000-8000-000000000003", email: "caro@ejemplo.com", password: "contraseña-caro", displayName: "Caro" });
  for (let i = 0; i < 5; i++) assert.equal((await call("login", { email: "caro@ejemplo.com", password: "mala" })).status, 401);
  assert.equal((await call("login", { email: "caro@ejemplo.com", password: "contraseña-caro" })).status, 429);
});

test("recuperar: código malo → 401; código bueno → nueva contraseña, nuevo código y cierra otras sesiones", async () => {
  assert.equal((await call("recover", { email: "ana@ejemplo.com", recoveryCode: "AAAA-AAAA-AAAA-AAAA", newPassword: "nueva-contraseña" })).status, 401);
  const r = await call("recover", { email: "ana@ejemplo.com", recoveryCode: code1.toLowerCase().replaceAll("-", " "), newPassword: "nueva-contraseña" });
  assert.equal(r.status, 200);
  assert.notEqual(r.json.recoveryCode, code1);
  assert.equal((await call("me", undefined, token1, "GET")).status, 401, "la sesión vieja queda cerrada");
  assert.equal((await call("login", { email: "ana@ejemplo.com", password: "contraseña-segura" })).status, 401, "contraseña vieja");
  assert.equal((await call("login", { email: "ana@ejemplo.com", password: "nueva-contraseña" })).status, 200);
  assert.equal((await call("recover", { email: "ana@ejemplo.com", recoveryCode: code1, newPassword: "otra-mas-123" })).status, 401, "el código viejo ya no sirve");
  token1 = r.json.token; code1 = r.json.recoveryCode;
});

test("cambiar contraseña: pide la actual y cierra las demás sesiones (la actual sigue)", async () => {
  const other = (await call("login", { email: "ana@ejemplo.com", password: "nueva-contraseña" })).json.token;
  const bad = await call("password", { currentPassword: "mala", newPassword: "cambiada-123" }, token1);
  assert.equal(bad.status, 401); assert.equal(bad.json.field, "currentPassword");
  assert.equal((await call("password", { currentPassword: "nueva-contraseña", newPassword: "cambiada-123" }, token1)).status, 200);
  assert.equal((await call("me", undefined, token1, "GET")).status, 200);
  assert.equal((await call("me", undefined, other, "GET")).status, 401);
});

test("nuevo código de recuperación invalida el anterior", async () => {
  const r = await call("recovery-code", { password: "cambiada-123" }, token1);
  assert.equal(r.status, 200);
  assert.equal((await call("recover", { email: "ana@ejemplo.com", recoveryCode: code1, newPassword: "x-12345678" })).status, 401);
  assert.equal((await call("recover", { email: "ana@ejemplo.com", recoveryCode: r.json.recoveryCode, newPassword: "x-12345678" })).status, 200);
});

test("cerrar sesión invalida el token", async () => {
  const t = (await call("login", { email: "beto@ejemplo.com", password: "contraseña-beto" })).json.token;
  assert.equal((await call("logout", undefined, t)).status, 200);
  assert.equal((await call("me", undefined, t, "GET")).status, 401);
});

test("alumnos anónimos siguen sincronizando sin token", async () => {
  assert.deepEqual((await push("aaaaaaaa-0000-4000-8000-0000000000ff", [lesson("3.1")])).json.applied, [1]);
});

test("CORS de la APK permite el encabezado Authorization", async () => {
  const res = await auth.OPTIONS(new Request("http://x/api/auth/login", { method: "OPTIONS", headers: { origin: "https://localhost" } }));
  assert.match(res.headers.get("access-control-allow-headers") ?? "", /authorization/);
  assert.match(res.headers.get("access-control-allow-methods") ?? "", /GET/);
});
