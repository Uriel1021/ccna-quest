import "server-only";
/**
 * Autenticación sin dependencias externas:
 *  - Contraseñas y códigos de recuperación: scrypt (node:crypto) con sal aleatoria.
 *  - Sesiones: token aleatorio de 256 bits que guarda el cliente; en la BD solo su SHA-256.
 *  - Bloqueo temporal tras varios intentos fallidos (frena ataques de fuerza bruta).
 * Se usa token "Bearer" (no cookies) porque la APK llama desde otro origen (https://localhost).
 */
import { randomBytes, scrypt as scryptCb, createHash, timingSafeEqual, randomInt } from "node:crypto";
import { promisify } from "node:util";
import { eq, and, gt } from "drizzle-orm";
import type { DB } from "@/db/client";
import { sessions, users } from "@/db/schema";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const N = 16384, R = 8, P = 1, LEN = 32;

export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(secret, salt, LEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifySecret(secret: string, stored: string | null | undefined): Promise<boolean> {
  // Sin hash guardado igual se calcula uno: así la respuesta tarda lo mismo exista o no la cuenta.
  const parts = (stored ?? DUMMY).split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, salt, hash] = parts;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(secret, Buffer.from(salt, "base64"), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
  return timingSafeEqual(actual, expected) && stored != null;
}
const DUMMY = `scrypt$${N}$${R}$${P}$${Buffer.alloc(16).toString("base64")}$${Buffer.alloc(LEN).toString("base64")}`;

/* ── Código de recuperación: 16 caracteres sin ambiguos (sin 0/O, 1/I/L), en grupos de 4 ── */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function newRecoveryCode(): string {
  const chars = Array.from({ length: 16 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return chars.match(/.{4}/g)!.join("-");
}
export const normalizeRecoveryCode = (code: string) => code.toUpperCase().replace(/[^0-9A-Z]/g, "");

/* ── Sesiones ── */
export const SESSION_DAYS = 180;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function createSession(db: DB, userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.insert(sessions).values({ tokenHash: sha256(token), userId, expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) });
  return token;
}

export function bearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  const m = h && /^Bearer\s+([A-Za-z0-9_-]{20,200})$/.exec(h.trim());
  return m ? m[1] : null;
}

/** Usuario dueño del token (o null si falta, expiró o no existe). Renueva la expiración (sesión deslizante). */
export async function sessionUser(db: DB, req: Request): Promise<string | null> {
  const token = bearer(req);
  if (!token) return null;
  const [row] = await db.select({ userId: sessions.userId, lastUsedAt: sessions.lastUsedAt }).from(sessions)
    .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date()))).limit(1);
  if (!row) return null;
  if (Date.now() - row.lastUsedAt.getTime() > 86_400_000) {
    await db.update(sessions).set({ lastUsedAt: new Date(), expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) })
      .where(eq(sessions.tokenHash, sha256(token)));
  }
  return row.userId;
}

export async function deleteSession(db: DB, req: Request) {
  const token = bearer(req);
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
}

/* ── Bloqueo tras intentos fallidos ── */
export const MAX_FAILS = 5;
export const LOCK_MINUTES = 15;

export async function registerFailure(db: DB, userId: string, fails: number) {
  const next = fails + 1;
  await db.update(users).set(next >= MAX_FAILS
    ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) }
    : { failedLogins: next }).where(eq(users.id, userId));
}
export const isLocked = (u: { lockedUntil: Date | null }) => !!u.lockedUntil && u.lockedUntil.getTime() > Date.now();
