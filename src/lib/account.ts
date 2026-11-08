/**
 * Cuenta del alumno (lado cliente).
 *
 *  - Sin cuenta: el progreso vive en el dispositivo con un identificador anónimo (como siempre).
 *  - Crear cuenta: "reclama" ese identificador → todo lo que ya hizo queda en su cuenta.
 *  - Iniciar sesión / recuperar: el dispositivo adopta la cuenta, sube lo que tenía y descarga
 *    lo guardado en la nube; ambos se combinan (gana lo más reciente, el XP mayor).
 *  - Cerrar sesión: sube lo pendiente y borra el progreso del dispositivo (útil en equipos compartidos).
 */
import { db, getProfile, getSession, setSession, levelFor, type LocalSession } from "./local-db";
import { enqueue, flushOutbox } from "./sync";
import { API_BASE, SYNC_ENDPOINT, type PullResponse } from "./sync-protocol";
import type { AccountUser, AuthOk } from "./auth-protocol";

export class AuthFailure extends Error {
  constructor(message: string, public field?: string, public status = 0) { super(message); }
}

async function call<T>(path: string, init: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/auth/${path}`, {
      method: init.method ?? "POST",
      headers: { ...(init.body ? { "content-type": "application/json" } : {}), ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new AuthFailure("Necesitas conexión a internet para esto. Tu progreso sigue guardado en este dispositivo.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new AuthFailure(body.error ?? `Error del servidor (${res.status}).`, body.field, res.status);
  return body as T;
}

async function requireSession(): Promise<LocalSession> {
  const s = await getSession();
  if (!s) throw new AuthFailure("No has iniciado sesión.");
  return s;
}

const toSession = (r: { token: string; user: AccountUser }): LocalSession =>
  ({ token: r.token, userId: r.user.id, email: r.user.email, displayName: r.user.displayName, ...(r.user.isAdmin ? { isAdmin: true } : {}) });

/* ───────────── Crear cuenta / entrar / recuperar ───────────── */

export async function register(email: string, password: string, displayName: string): Promise<string> {
  await flushOutbox().catch(() => {}); // sube lo anónimo pendiente mientras aún no hace falta token
  const p = await getProfile();
  const r = await call<AuthOk>("register", { body: { userId: p.userId, email, password, displayName } });
  if (r.user.id === p.userId) {
    await setSession(toSession(r));
    await db.transaction("rw", db.profile, db.outbox, async () => {
      const next = { ...p, displayName: r.user.displayName, updatedAt: Date.now() };
      await db.profile.put(next);
      await enqueue({ kind: "profile", data: { displayName: next.displayName, xp: next.xp, level: next.level, streakDays: next.streakDays, updatedAt: next.updatedAt } });
    });
    void flushOutbox().catch(() => {});
  } else {
    await adopt(r);
  }
  return r.recoveryCode!;
}

export async function login(email: string, password: string) {
  await adopt(await call<AuthOk>("login", { body: { email, password } }));
}

export async function recover(email: string, recoveryCode: string, newPassword: string): Promise<string> {
  const r = await call<AuthOk>("recover", { body: { email, recoveryCode, newPassword } });
  await adopt(r);
  return r.recoveryCode!;
}

/**
 * El dispositivo pasa a ser de la cuenta: todo lo local se vuelve a encolar con el id de la cuenta
 * (el servidor lo combina sin duplicar) y luego se descarga lo que ya había en la nube.
 */
async function adopt(r: { token: string; user: AccountUser }) {
  await setSession(toSession(r));
  await db.transaction("rw", [db.profile, db.attempts, db.answers, db.lessons, db.games, db.badges, db.focus, db.feedback, db.outbox], async () => {
    const p = await getProfile();
    await db.profile.put({ ...p, userId: r.user.id, displayName: r.user.displayName });
    await db.outbox.clear();
    for (const data of await db.attempts.toArray()) await enqueue({ kind: "attempt", data });
    for (const data of await db.answers.toArray()) await enqueue({ kind: "answer", data });
    for (const data of await db.lessons.toArray()) await enqueue({ kind: "lesson", data });
    for (const data of await db.games.toArray()) await enqueue({ kind: "game", data });
    for (const data of await db.badges.toArray()) await enqueue({ kind: "badge", data });
    for (const data of await db.focus.toArray()) await enqueue({ kind: "focus", data });
    for (const f of await db.feedback.toArray()) {
      await enqueue({ kind: "feedback", data: { id: f.id, category: f.category, message: f.message, page: f.page, appVersion: f.appVersion, platform: f.platform, createdAt: f.createdAt } });
    }
  });
  await pullAndMerge({ force: true }).catch(() => {});
  void flushOutbox().catch(() => {});
}

/* ───────────── Descargar y combinar el progreso de la nube ───────────── */

const PULL_EVERY_MS = 2 * 60_000;

export async function pullAndMerge({ force = false } = {}): Promise<boolean> {
  const s = await getSession();
  if (!s || s.expired) return false;
  const last = ((await db.meta.get("lastPullAt"))?.value as number | undefined) ?? 0;
  if (!force && Date.now() - last < PULL_EVERY_MS) return false;

  const res = await fetch(SYNC_ENDPOINT, { headers: { authorization: `Bearer ${s.token}` }, signal: AbortSignal.timeout(20_000) });
  if (res.status === 401) { await setSession({ ...s, expired: true }); return false; }
  if (!res.ok) return false;
  const remote = (await res.json()) as PullResponse;

  await db.transaction("rw", [db.profile, db.attempts, db.answers, db.lessons, db.games, db.badges, db.focus, db.feedback, db.outbox, db.meta], async () => {
    for (const l of remote.lessons) { const cur = await db.lessons.get(l.lessonId); if (!cur || l.updatedAt > cur.updatedAt) await db.lessons.put(l); }
    for (const a of remote.attempts) { const cur = await db.attempts.get(a.id); if (!cur || (a.finishedAt && !cur.finishedAt)) await db.attempts.put(a); }
    for (const a of remote.answers) { const cur = await db.answers.get([a.attemptId, a.questionId]); if (!cur || a.answeredAt > cur.answeredAt) await db.answers.put(a); }
    for (const g of remote.games) if (!(await db.games.get(g.id))) await db.games.add(g);
    for (const b of remote.badges) if (!(await db.badges.get(b.badgeId))) await db.badges.add(b);
    for (const f of remote.focus) { const cur = await db.focus.get(f.id); if (!cur || f.updatedAt > cur.updatedAt) await db.focus.put(f); }
    for (const f of remote.feedback ?? []) { const cur = await db.feedback.get(f.id); if (!cur || f.updatedAt > cur.updatedAt) await db.feedback.put(f); }

    // Perfil: XP y racha = el mayor de ambos; nombre = el más reciente.
    const p = await getProfile();
    const rp = remote.profile;
    const xp = Math.max(p.xp, rp.xp);
    const merged = { ...p, xp, level: levelFor(xp), streakDays: Math.max(p.streakDays, rp.streakDays),
      displayName: rp.updatedAt > p.updatedAt ? rp.displayName : p.displayName };
    const changedLocal = merged.xp !== p.xp || merged.displayName !== p.displayName || merged.streakDays !== p.streakDays;
    const differsRemote = merged.xp !== rp.xp || merged.level !== rp.level || merged.displayName !== rp.displayName || merged.streakDays !== rp.streakDays;
    if (changedLocal || differsRemote) {
      const next = { ...merged, updatedAt: Date.now() };
      await db.profile.put(next);
      if (differsRemote) await enqueue({ kind: "profile", data: { displayName: next.displayName, xp: next.xp, level: next.level, streakDays: next.streakDays, updatedAt: next.updatedAt } });
    }
    await db.meta.put({ key: "lastPullAt", value: Date.now() });
  });
  return true;
}

/* ───────────── Cerrar sesión ───────────── */

/** Devuelve cuántos cambios quedarían sin subir; si hay y no se fuerza, NO cierra sesión (la UI pregunta). */
export async function logout({ force = false } = {}): Promise<{ done: boolean; pending: number }> {
  const s = await getSession();
  if (s && !s.expired) await flushOutbox().catch(() => {});
  const pending = await db.outbox.count();
  if (pending > 0 && !force) return { done: false, pending };

  if (s) void call("logout", { token: s.token }).catch(() => {});
  await db.transaction("rw", [db.profile, db.attempts, db.answers, db.lessons, db.games, db.badges, db.focus, db.feedback, db.outbox, db.meta], async () => {
    await Promise.all([db.profile, db.attempts, db.answers, db.lessons, db.games, db.badges, db.focus, db.feedback, db.outbox].map((t) => t.clear()));
    await db.meta.bulkDelete(["session", "lastPullAt", "lastSyncAt", "lastSyncError"]);
  });
  await getProfile(); // nuevo alumno anónimo para este dispositivo
  return { done: true, pending: 0 };
}

/* ───────────── Ajustes de la cuenta ───────────── */

export async function changePassword(currentPassword: string, newPassword: string) {
  const s = await requireSession();
  await call("password", { token: s.token, body: { currentPassword, newPassword } }).catch(expireOn401(s));
}

export async function newRecoveryCode(password: string): Promise<string> {
  const s = await requireSession();
  const r = await call<{ recoveryCode: string }>("recovery-code", { token: s.token, body: { password } }).catch(expireOn401(s));
  return r.recoveryCode;
}

/** Comprueba el token con el servidor (si hay red). Marca la sesión como vencida si ya no vale. */
export async function checkSession() {
  const s = await getSession();
  if (!s || s.expired) return;
  try {
    const { user } = await call<{ user: AccountUser }>("me", { method: "GET", token: s.token });
    if (!!user.isAdmin !== !!s.isAdmin || user.displayName !== s.displayName) await setSession({ ...s, isAdmin: !!user.isAdmin, displayName: user.displayName });
  }
  catch (e) { if (e instanceof AuthFailure && e.status === 401) await setSession({ ...s, expired: true }); }
}

function expireOn401(s: LocalSession) {
  return async (e: unknown): Promise<never> => {
    // Solo expira si el fallo es de sesión, no si la contraseña escrita está mal (también 401 pero con campo).
    if (e instanceof AuthFailure && e.status === 401 && !e.field) await setSession({ ...s, expired: true });
    throw e;
  };
}
