/**
 * /api/auth/{register|login|recover|logout|me|password|recovery-code}
 *
 *  register       crea la cuenta "reclamando" el usuario anónimo del dispositivo (conserva su progreso)
 *  login          correo + contraseña → token
 *  recover        correo + código de recuperación → nueva contraseña, nuevo código, cierra otras sesiones
 *  logout         borra la sesión actual
 *  me             datos de la cuenta (valida el token)
 *  password       cambia la contraseña (pide la actual)
 *  recovery-code  genera un nuevo código de recuperación (pide la contraseña)
 */
import { NextResponse } from "next/server";
import { eq, ne, and } from "drizzle-orm";
import type { z } from "zod";
import { getDb, type DB } from "@/db/client";
import { users, sessions } from "@/db/schema";
import {
  hashSecret, verifySecret, newRecoveryCode, normalizeRecoveryCode, createSession, sessionUser, deleteSession,
  registerFailure, isLocked, bearer, LOCK_MINUTES,
} from "@/lib/server/auth";
import { withCors, preflight } from "@/lib/server/cors";
import { RegisterBody, LoginBody, RecoverBody, ChangePasswordBody, NewRecoveryBody, type AuthOk } from "@/lib/auth-protocol";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const err = (status: number, error: string, field?: string) => NextResponse.json({ error, ...(field ? { field } : {}) }, { status });
const BAD_LOGIN = "Correo o contraseña incorrectos.";
const LOCKED = `Demasiados intentos. Espera ${LOCK_MINUTES} minutos e inténtalo de nuevo.`;

async function parse<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T> | Response> {
  const body = await req.json().catch(() => null);
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  const issue = r.error.issues[0];
  return err(400, issue?.message ?? "Datos inválidos.", issue?.path[0]?.toString());
}

const userJson = (u: { id: string; email: string | null; displayName: string }) => ({ id: u.id, email: u.email!, displayName: u.displayName });
const findByEmail = async (db: DB, email: string) => (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
const findById = async (db: DB, id: string) => (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];

async function register(db: DB, req: Request) {
  const b = await parse(req, RegisterBody);
  if (b instanceof Response) return b;
  if (await findByEmail(db, b.email)) return err(409, "Ese correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.", "email");

  const existing = await findById(db, b.userId);
  // El identificador del dispositivo ya pertenece a otra cuenta: se crea un usuario nuevo.
  const id = existing?.passwordHash ? crypto.randomUUID() : b.userId;
  const recoveryCode = newRecoveryCode();
  const secret = { email: b.email, displayName: b.displayName, passwordHash: await hashSecret(b.password),
    recoveryHash: await hashSecret(normalizeRecoveryCode(recoveryCode)), failedLogins: 0, lockedUntil: null, updatedAt: new Date() };
  try {
    if (existing && !existing.passwordHash) await db.update(users).set(secret).where(eq(users.id, id));
    else await db.insert(users).values({ id, ...secret });
  } catch (e) {
    if ((e as { code?: string }).code === "23505" || /unique/i.test(String((e as Error).message))) return err(409, "Ese correo ya tiene una cuenta.", "email");
    throw e;
  }
  const token = await createSession(db, id);
  return NextResponse.json({ token, recoveryCode, user: { id, email: b.email, displayName: b.displayName } } satisfies AuthOk);
}

async function login(db: DB, req: Request) {
  const b = await parse(req, LoginBody);
  if (b instanceof Response) return b;
  const u = await findByEmail(db, b.email);
  if (u && isLocked(u)) return err(429, LOCKED);
  const ok = await verifySecret(b.password, u?.passwordHash);
  if (!u || !ok) {
    if (u) await registerFailure(db, u.id, u.failedLogins);
    return err(401, BAD_LOGIN);
  }
  if (u.failedLogins) await db.update(users).set({ failedLogins: 0 }).where(eq(users.id, u.id));
  return NextResponse.json({ token: await createSession(db, u.id), user: userJson(u) } satisfies AuthOk);
}

async function recover(db: DB, req: Request) {
  const b = await parse(req, RecoverBody);
  if (b instanceof Response) return b;
  const u = await findByEmail(db, b.email);
  if (u && isLocked(u)) return err(429, LOCKED);
  const ok = await verifySecret(normalizeRecoveryCode(b.recoveryCode), u?.recoveryHash);
  if (!u || !ok) {
    if (u) await registerFailure(db, u.id, u.failedLogins);
    return err(401, "El correo o el código de recuperación no coinciden.");
  }
  const recoveryCode = newRecoveryCode();
  await db.update(users).set({ passwordHash: await hashSecret(b.newPassword), recoveryHash: await hashSecret(normalizeRecoveryCode(recoveryCode)),
    failedLogins: 0, lockedUntil: null }).where(eq(users.id, u.id));
  await db.delete(sessions).where(eq(sessions.userId, u.id)); // quien tuviera la cuenta abierta queda fuera
  return NextResponse.json({ token: await createSession(db, u.id), recoveryCode, user: userJson(u) } satisfies AuthOk);
}

async function authed(db: DB, req: Request) {
  const id = await sessionUser(db, req);
  return id ? findById(db, id) : undefined;
}

async function changePassword(db: DB, req: Request) {
  const u = await authed(db, req);
  if (!u) return err(401, "Tu sesión expiró. Vuelve a iniciar sesión.");
  const b = await parse(req, ChangePasswordBody);
  if (b instanceof Response) return b;
  if (isLocked(u)) return err(429, LOCKED);
  if (!(await verifySecret(b.currentPassword, u.passwordHash))) { await registerFailure(db, u.id, u.failedLogins); return err(401, "La contraseña actual no es correcta.", "currentPassword"); }
  await db.update(users).set({ passwordHash: await hashSecret(b.newPassword), failedLogins: 0 }).where(eq(users.id, u.id));
  // Cierra las demás sesiones; la actual sigue abierta.
  const current = createHash("sha256").update(bearer(req)!).digest("hex");
  await db.delete(sessions).where(and(eq(sessions.userId, u.id), ne(sessions.tokenHash, current)));
  return NextResponse.json({ ok: true });
}

async function newRecovery(db: DB, req: Request) {
  const u = await authed(db, req);
  if (!u) return err(401, "Tu sesión expiró. Vuelve a iniciar sesión.");
  const b = await parse(req, NewRecoveryBody);
  if (b instanceof Response) return b;
  if (isLocked(u)) return err(429, LOCKED);
  if (!(await verifySecret(b.password, u.passwordHash))) { await registerFailure(db, u.id, u.failedLogins); return err(401, "La contraseña no es correcta.", "password"); }
  const recoveryCode = newRecoveryCode();
  await db.update(users).set({ recoveryHash: await hashSecret(normalizeRecoveryCode(recoveryCode)), failedLogins: 0 }).where(eq(users.id, u.id));
  return NextResponse.json({ recoveryCode });
}

type Ctx = { params: Promise<{ action: string }> };

async function handle(req: Request, action: string): Promise<Response> {
  const db = getDb();
  if (!db) return err(503, "El servidor no está disponible. Inténtalo más tarde.");
  try {
    if (req.method === "GET" && action === "me") {
      const u = await authed(db, req);
      return u ? NextResponse.json({ user: userJson(u) }) : err(401, "Tu sesión expiró. Vuelve a iniciar sesión.");
    }
    if (req.method !== "POST") return err(405, "Método no permitido.");
    switch (action) {
      case "register": return await register(db, req);
      case "login": return await login(db, req);
      case "recover": return await recover(db, req);
      case "logout": await deleteSession(db, req); return NextResponse.json({ ok: true });
      case "password": return await changePassword(db, req);
      case "recovery-code": return await newRecovery(db, req);
      default: return err(404, "No encontrado.");
    }
  } catch (e) {
    console.error(`auth/${action}:`, e);
    return err(503, "El servidor no está disponible. Inténtalo más tarde.");
  }
}

export const OPTIONS = preflight;
export async function GET(req: Request, ctx: Ctx) { const { action } = await ctx.params; return withCors((r) => handle(r, action))(req); }
export async function POST(req: Request, ctx: Ctx) { const { action } = await ctx.params; return withCors((r) => handle(r, action))(req); }
