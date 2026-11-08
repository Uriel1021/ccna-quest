/**
 * Comentarios: envío por /api/sync, bandeja del autor (/api/feedback) y respuesta visible para el alumno.
 * Postgres real en memoria (PGlite). Ejecutar: npm test
 */
import { test, mock, before } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/db/schema.ts";

process.env.ADMIN_EMAILS = " Autor@Ejemplo.com , otro@ejemplo.com";
const db = drizzle(new PGlite(), { schema });
mock.module(pathToFileURL(path.resolve("src/db/client.ts")).href, { exports: { getDb: () => db } });
mock.module("server-only", { exports: {} });
const auth = await import("../src/app/api/auth/[action]/route.ts");
const sync = await import("../src/app/api/sync/route.ts");
const fb = await import("../src/app/api/feedback/route.ts");
before(async () => { await migrate(db, { migrationsFolder: "drizzle" }); });

type J = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const req = (url: string, method: string, body?: unknown, token?: string) => new Request(`http://x${url}`, {
  method, body: body ? JSON.stringify(body) : undefined,
  headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
});
const out = async (r: Response) => ({ status: r.status, json: (await r.json()) as J });
const register = async (userId: string, email: string) =>
  (await out(await auth.POST(req("/api/auth/register", "POST", { userId, email, password: "contraseña-123", displayName: email.split("@")[0] }), { params: Promise.resolve({ action: "register" }) }))).json;

const STUDENT = "cccccccc-0000-4000-8000-000000000001";
const ADMIN = "cccccccc-0000-4000-8000-000000000002";
const F1 = "dddddddd-0000-4000-8000-000000000001";
const op = (id: string, message = "En la lección 11.5 el /26 tiene 62 hosts, no 64.", category = "content") =>
  ({ kind: "feedback", data: { id, category, message, page: "/aprender/modulo-11/leccion-11-5", appVersion: "0.8.0", platform: "android", createdAt: 1_700_000_000_000 } });
const push = async (userId: string, ops: unknown[], token: string) =>
  out(await sync.POST(req("/api/sync", "POST", { userId, ops: ops.map((o, i) => ({ seq: i + 1, op: o })) }, token)));
const pull = async (token: string) => out(await sync.GET(req("/api/sync", "GET", undefined, token)));

let student = "", admin = "";

test("el alumno envía un comentario por la cola; reenviarlo no lo duplica", async () => {
  student = (await register(STUDENT, "alumna@ejemplo.com")).token;
  assert.deepEqual((await push(STUDENT, [op(F1)], student)).json.applied, [1]);
  assert.deepEqual((await push(STUDENT, [op(F1)], student)).json.applied, [1]);
  const rows = await db.select().from(schema.feedback);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, "new");
  assert.equal(rows[0].platform, "android");
});

test("comentarios inválidos se rechazan solos (sin atascar la cola)", async () => {
  const r = await push(STUDENT, [op("dddddddd-0000-4000-8000-000000000009", "hola"), op("dddddddd-0000-4000-8000-00000000000a", "Categoría rara de verdad", "spam")], student);
  assert.deepEqual(r.json.rejected.map((x: J) => x.reason), ["invalid", "invalid"]);
});

test("el alumno ve sus comentarios al descargar de la nube", async () => {
  const p = await pull(student);
  assert.equal(p.json.feedback.length, 1);
  assert.equal(p.json.feedback[0].status, "new");
  assert.equal(p.json.feedback[0].reply, null);
});

test("la bandeja exige sesión y ser autor", async () => {
  assert.equal((await fb.GET(req("/api/feedback", "GET"))).status, 401);
  const r = await fb.GET(req("/api/feedback", "GET", undefined, student));
  assert.equal(r.status, 403);
  assert.equal((await fb.POST(req("/api/feedback", "POST", { id: F1, status: "resolved" }, student))).status, 403);
});

test("el autor (ADMIN_EMAILS, sin importar mayúsculas) ve la bandeja con nombre y correo", async () => {
  const r = await register(ADMIN, "autor@ejemplo.com");
  admin = r.token;
  assert.equal(r.user.isAdmin, true);
  assert.equal((await register("cccccccc-0000-4000-8000-000000000003", "nadie@ejemplo.com")).user.isAdmin, undefined);
  const list = await out(await fb.GET(req("/api/feedback?status=new", "GET", undefined, admin)));
  assert.equal(list.status, 200);
  assert.equal(list.json.items.length, 1);
  assert.equal(list.json.items[0].userEmail, "alumna@ejemplo.com");
  assert.equal(list.json.items[0].page, "/aprender/modulo-11/leccion-11-5");
  assert.equal((await out(await fb.GET(req("/api/feedback?status=resolved", "GET", undefined, admin)))).json.items.length, 0);
});

test("el autor responde y resuelve; el alumno ve la respuesta al sincronizar", async () => {
  assert.equal((await fb.POST(req("/api/feedback", "POST", { id: F1 }, admin))).status, 400, "sin cambios");
  assert.equal((await fb.POST(req("/api/feedback", "POST", { id: "dddddddd-0000-4000-8000-0000000000ff", status: "resolved" }, admin))).status, 404);
  assert.equal((await fb.POST(req("/api/feedback", "POST", { id: F1, status: "reviewing" }, admin))).status, 200);
  assert.equal((await fb.POST(req("/api/feedback", "POST", { id: F1, status: "resolved", reply: "¡Gracias! Ya lo corregí." }, admin))).status, 200);
  const p = await pull(student);
  assert.equal(p.json.feedback[0].status, "resolved");
  assert.equal(p.json.feedback[0].reply, "¡Gracias! Ya lo corregí.");
  assert.ok(p.json.feedback[0].updatedAt > p.json.feedback[0].createdAt);
});

test("un reenvío posterior del alumno no borra la respuesta ni el estado", async () => {
  await push(STUDENT, [op(F1)], student);
  const [row] = await db.select().from(schema.feedback);
  assert.equal(row.status, "resolved");
  assert.equal(row.reply, "¡Gracias! Ya lo corregí.");
});
