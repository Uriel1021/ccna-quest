"use client";
/**
 * Cuenta: iniciar sesión, crear cuenta, recuperar con código y ajustes.
 * H1 estado visible (sincronizado / pendientes) · H5 prevención (confirmar al cerrar sesión con cambios sin subir,
 * contraseña con "mostrar") · H9 errores en lenguaje claro junto al campo · H10 explicación de qué se guarda.
 */
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Cloud, Copy, Check, Eye, EyeOff, KeyRound, LogOut, ShieldCheck, Smartphone, RefreshCw } from "lucide-react";
import { Button, Group, LargeTitle, Row } from "@/components/ui/apple";
import { useLiveQuery } from "@/lib/use-live-query";
import { db, getSession } from "@/lib/local-db";
import { AuthFailure, changePassword, checkSession, login, logout, newRecoveryCode, recover, register } from "@/lib/account";
import { haptic } from "@/lib/feedback";
import { runSync, useSyncState } from "@/lib/sync-client";

type Mode = "login" | "register" | "recover";
type Err = { message: string; field?: string } | null;

const toErr = (e: unknown): Err => (e instanceof AuthFailure ? { message: e.message, field: e.field } : { message: "Algo salió mal. Inténtalo de nuevo." });

function Field({ label, type = "text", value, onChange, autoComplete, error, hint, inputMode, autoFocus }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; autoComplete?: string; error?: boolean; hint?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; autoFocus?: boolean;
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <div className="border-b border-border/70 last:border-b-0">
      <label htmlFor={id} className="block px-4 pt-2.5 text-[13px] font-medium text-muted">{label}</label>
      <div className="flex items-center">
        <input id={id} type={isPw && show ? "text" : type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
          inputMode={inputMode} autoFocus={autoFocus} aria-invalid={error || undefined} aria-describedby={hint ? `${id}-h` : undefined}
          autoCapitalize={type === "email" || isPw ? "none" : undefined} spellCheck={false}
          className={clsx("min-h-11 w-full bg-transparent px-4 pb-2.5 text-[17px] outline-none", error && "text-danger")} />
        {isPw && (
          <button type="button" onClick={() => setShow((s) => !s)} className="grid size-11 shrink-0 place-items-center text-muted" aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {hint && <p id={`${id}-h`} className="px-4 pb-2 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

const ErrorBox = ({ err }: { err: Err }) => err && <p role="alert" className="mt-3 rounded-xl bg-danger/10 p-3 text-[15px] text-danger">{err.message}</p>;

/* ── Muestra el código de recuperación una sola vez ── */
function RecoveryCode({ code, onDone, title = "Guarda tu código de recuperación" }: { code: string; onDone: () => void; title?: string }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <section className="mx-auto max-w-md rounded-2xl bg-surface p-5 text-center shadow-sm" aria-labelledby="rc-title">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ok/15 text-ok"><KeyRound size={28} aria-hidden /></span>
      <h2 id="rc-title" className="mt-3 text-[22px] font-bold">{title}</h2>
      <p className="mt-1 text-[15px] text-muted">Si olvidas tu contraseña, con este código podrás entrar y poner una nueva. <b className="text-fg">Solo se muestra ahora.</b></p>
      <p className="mt-4 select-all rounded-xl bg-fill px-3 py-4 font-mono text-[22px] font-semibold tracking-wider" aria-label={`Código: ${code.split("").join(" ")}`}>{code}</p>
      <Button variant="tinted" className="mt-3 w-full" onClick={async () => {
        try { await navigator.clipboard.writeText(code); setCopied(true); void haptic("success"); } catch { setCopied(false); }
      }}>{copied ? <><Check size={18} aria-hidden /> Copiado</> : <><Copy size={18} aria-hidden /> Copiar código</>}</Button>
      <p className="mt-3 text-[13px] text-muted">Anótalo en tu cuaderno, guárdalo en tus notas o tómale captura.</p>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-fill p-3 text-left">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1 size-5 accent-[var(--brand)]" />
        <span className="text-[15px] font-medium">Ya guardé mi código en un lugar seguro.</span>
      </label>
      <Button className="mt-4 w-full" disabled={!saved} onClick={onDone}>Continuar</Button>
    </section>
  );
}

/* ── Formularios sin sesión ── */
function AuthForms({ expiredEmail, onCode }: { expiredEmail?: string; onCode: (code: string) => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState(expiredEmail ?? "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<Err>(null);

  const switchTo = (m: Mode) => { setMode(m); setErr(null); setPassword(""); setPassword2(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (mode !== "login" && password.length < 8) { setErr({ message: "La contraseña debe tener al menos 8 caracteres.", field: mode === "recover" ? "newPassword" : "password" }); return; }
    if (mode !== "login" && password !== password2) { setErr({ message: "Las contraseñas no coinciden.", field: "password2" }); return; }
    setBusy(true);
    try {
      if (mode === "login") { await login(email, password); void haptic("success"); }
      else if (mode === "register") onCode(await register(email, password, name));
      else onCode(await recover(email, code, password));
    } catch (e2) { setErr(toErr(e2)); void haptic("error"); }
    finally { setBusy(false); }
  };

  const f = err?.field;
  return (
    <div className="mx-auto max-w-md">
      {expiredEmail && <p className="mb-4 rounded-xl bg-warn/15 p-3 text-[15px]" role="status">Tu sesión expiró. Tu progreso sigue guardado en este dispositivo: entra de nuevo para subirlo a tu cuenta.</p>}
      {mode !== "recover" && (
        <div className="mb-5 flex rounded-lg bg-fill p-0.5 text-[15px] font-semibold" role="tablist" aria-label="Elige una opción">
          {(["login", "register"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchTo(m)}
              className={clsx("min-h-9 flex-1 rounded-md", mode === m ? "bg-surface shadow-sm" : "text-muted")}>
              {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>
      )}
      {mode === "recover" && (
        <div className="mb-4">
          <h2 className="text-[22px] font-bold">Recuperar tu cuenta</h2>
          <p className="mt-1 text-[15px] text-muted">Escribe tu correo y el código de recuperación que guardaste al crear tu cuenta. Después elige una contraseña nueva.</p>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div className="overflow-hidden rounded-xl bg-surface">
          {mode === "register" && <Field label="Tu nombre" value={name} onChange={setName} autoComplete="nickname" error={f === "displayName"} />}
          <Field label="Correo" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" error={f === "email"} />
          {mode === "recover" && <Field label="Código de recuperación" value={code} onChange={setCode} autoComplete="one-time-code" error={f === "recoveryCode"} hint="16 caracteres, por ejemplo ABCD-EFGH-JKMN-PQRS" />}
          <Field label={mode === "recover" ? "Contraseña nueva" : "Contraseña"} type="password" value={password} onChange={setPassword}
            autoComplete={mode === "login" ? "current-password" : "new-password"} error={f === "password" || f === "newPassword"}
            hint={mode === "login" ? undefined : "Mínimo 8 caracteres."} />
          {mode !== "login" && <Field label="Repite la contraseña" type="password" value={password2} onChange={setPassword2} autoComplete="new-password" error={f === "password2"} />}
        </div>
        <ErrorBox err={err} />
        <Button type="submit" className="mt-5 w-full" disabled={busy || !email || !password || (mode === "register" && !name) || (mode === "recover" && !code)}>
          {busy ? "Un momento…" : mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear mi cuenta" : "Cambiar contraseña y entrar"}
        </Button>
      </form>

      <div className="mt-4 text-center text-[15px]">
        {mode === "recover"
          ? <button onClick={() => switchTo("login")} className="min-h-11 font-semibold text-brand">Volver a iniciar sesión</button>
          : <button onClick={() => switchTo("recover")} className="min-h-11 font-semibold text-brand">¿Olvidaste tu contraseña?</button>}
      </div>

      <Group header="¿Para qué una cuenta?" className="mt-6" footer="Solo guardamos tu nombre, tu correo y tu progreso. La contraseña se guarda cifrada. Sin cuenta, la app funciona igual y tu progreso se queda en este dispositivo.">
        <Row icon={Cloud} tint="blue" title="Tu progreso en la nube" subtitle="No lo pierdes si cambias o formateas tu teléfono." />
        <Row icon={Smartphone} tint="green" title="En todos tus dispositivos" subtitle="Empieza en el celular y sigue en la computadora." />
        <Row icon={ShieldCheck} tint="indigo" title="Lo que ya hiciste se conserva" subtitle="Al crear tu cuenta, tu avance actual pasa a ella." />
      </Group>
    </div>
  );
}

/* ── Con sesión ── */
function AccountView({ email, displayName }: { email: string; displayName: string }) {
  const pending = useLiveQuery(() => db.outbox.count(), [], 0);
  const { syncing, lastError } = useSyncState();
  const [panel, setPanel] = useState<"none" | "password" | "code" | "logout">("none");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<Err>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [logoutPending, setLogoutPending] = useState(0);

  const open = (p: typeof panel) => { setPanel(p); setErr(null); setMsg(null); setCurrent(""); setNext(""); };
  const run = async (fn: () => Promise<void>) => { setBusy(true); setErr(null); try { await fn(); } catch (e) { setErr(toErr(e)); void haptic("error"); } finally { setBusy(false); } };

  if (code) return <RecoveryCode code={code} title="Tu nuevo código de recuperación" onDone={() => { setCode(null); open("none"); setMsg("Listo: el código anterior ya no sirve."); }} />;

  return (
    <div className="mx-auto max-w-md">
      <section className="mb-6 flex items-center gap-4 rounded-2xl bg-surface p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-[24px] font-bold text-brand-fg" aria-hidden>{displayName.trim()[0]?.toUpperCase() ?? "?"}</span>
        <div className="min-w-0">
          <p className="truncate text-[20px] font-bold">{displayName}</p>
          <p className="truncate text-[15px] text-muted">{email}</p>
        </div>
      </section>

      <Group header="Sincronización">
        <Row icon={Cloud} tint={pending ? "orange" : "green"} title={syncing ? "Sincronizando…" : pending ? `${pending} cambios por subir` : "Todo tu progreso está en la nube"}
          subtitle={lastError && pending ? "Se reintentará solo cuando haya conexión." : "Se sincroniza automáticamente."} />
        <Row icon={RefreshCw} tint="blue" title="Sincronizar ahora" onClick={() => void runSync()} />
      </Group>

      {msg && <p className="mb-4 rounded-xl bg-ok/12 p-3 text-[15px]" role="status">{msg}</p>}

      <Group header="Seguridad">
        <Row icon={KeyRound} tint="gray" title="Cambiar contraseña" onClick={() => open(panel === "password" ? "none" : "password")} />
        <Row icon={ShieldCheck} tint="indigo" title="Nuevo código de recuperación" subtitle="Por si perdiste el anterior." onClick={() => open(panel === "code" ? "none" : "code")} />
      </Group>

      {panel === "password" && (
        <form className="mb-8" onSubmit={(e) => { e.preventDefault(); void run(async () => { await changePassword(current, next); open("none"); setMsg("Contraseña actualizada. Cerramos tu sesión en los demás dispositivos."); void haptic("success"); }); }}>
          <div className="overflow-hidden rounded-xl bg-surface">
            <Field label="Contraseña actual" type="password" value={current} onChange={setCurrent} autoComplete="current-password" error={err?.field === "currentPassword"} autoFocus />
            <Field label="Contraseña nueva" type="password" value={next} onChange={setNext} autoComplete="new-password" error={err?.field === "newPassword"} hint="Mínimo 8 caracteres." />
          </div>
          <ErrorBox err={err} />
          <Button type="submit" className="mt-4 w-full" disabled={busy || !current || !next}>{busy ? "Un momento…" : "Guardar contraseña"}</Button>
        </form>
      )}
      {panel === "code" && (
        <form className="mb-8" onSubmit={(e) => { e.preventDefault(); void run(async () => setCode(await newRecoveryCode(current))); }}>
          <div className="overflow-hidden rounded-xl bg-surface">
            <Field label="Confirma tu contraseña" type="password" value={current} onChange={setCurrent} autoComplete="current-password" error={err?.field === "password"} autoFocus />
          </div>
          <ErrorBox err={err} />
          <Button type="submit" className="mt-4 w-full" disabled={busy || !current}>{busy ? "Un momento…" : "Generar código nuevo"}</Button>
        </form>
      )}

      <Group footer="Al cerrar sesión, tu progreso se borra de este dispositivo pero queda guardado en tu cuenta. Úsalo en computadoras compartidas.">
        <Row icon={LogOut} tint="red" title={<span className="text-danger">Cerrar sesión</span>} onClick={() => void run(async () => {
          const r = await logout();
          if (!r.done) { setLogoutPending(r.pending); setPanel("logout"); }
        })} />
      </Group>

      {panel === "logout" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="alertdialog" aria-modal="true" aria-labelledby="lo-title">
          <button aria-label="Cancelar" tabIndex={-1} className="animate-fade absolute inset-0 bg-black/40" onClick={() => setPanel("none")} />
          <div className="animate-sheet relative w-full max-w-md rounded-t-[16px] bg-bg p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:rounded-[16px]">
            <h2 id="lo-title" className="text-center text-[20px] font-bold">Tienes {logoutPending} cambios sin subir</h2>
            <p className="mt-2 text-center text-[15px] text-muted">No hay conexión con el servidor. Si cierras sesión ahora, ese avance se perderá. Te recomendamos esperar a tener internet.</p>
            <div className="mt-5 grid gap-2">
              <Button onClick={() => setPanel("none")}>Esperar y no cerrar sesión</Button>
              <Button variant="plain" className="text-danger" onClick={() => void run(async () => { await logout({ force: true }); setPanel("none"); })}>Cerrar sesión de todos modos</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AccountPage() {
  const session = useLiveQuery(() => getSession(), [], null);
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => { void checkSession(); }, []);

  return (
    <>
      <LargeTitle title="Tu cuenta" subtitle={session && !session.expired ? "Tu progreso se guarda en la nube." : "Guarda tu progreso en la nube y úsalo en varios dispositivos."} />
      {session === null ? <p className="py-10 text-center text-muted">Cargando…</p>
        : code ? <RecoveryCode code={code} onDone={() => setCode(null)} />
        : session && !session.expired ? <AccountView email={session.email} displayName={session.displayName} />
        : <AuthForms expiredEmail={session?.expired ? session.email : undefined} onCode={setCode} />}
      {!session && <p className="mt-8 text-center text-[13px] text-muted"><Link href="/" className="text-brand">Seguir sin cuenta</Link></p>}
    </>
  );
}
