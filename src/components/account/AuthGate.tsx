"use client";
/**
 * La app solo se usa con cuenta: sin sesión se muestra la bienvenida (crear cuenta / iniciar sesión).
 *  - Mientras se lee la sesión de IndexedDB (y durante la hidratación) se ve una pantalla de carga neutra,
 *    así nunca asoma el contenido a quien no ha entrado.
 *  - Sesión vencida: el alumno YA tiene cuenta; puede seguir estudiando con lo guardado y el indicador
 *    "Vuelve a entrar" le pide iniciar sesión (bloquearlo le haría perder lo que no se ha subido).
 *  - /instalar queda abierta: se puede instalar la app antes de crear la cuenta.
 */
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WifiOff } from "lucide-react";
import { AppIcon } from "@/components/brand/AppIcon";
import { useLiveQuery } from "@/lib/use-live-query";
import { getSession } from "@/lib/local-db";
import { AuthForms, RecoveryCode } from "./AccountPage";

const OPEN_PATHS = ["/instalar"];

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb); window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main id="contenido" className="min-h-dvh px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-md">{children}</div>
    </main>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const session = useLiveQuery(() => getSession(), [], null); // null = aún leyendo
  const pathname = usePathname();
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const [code, setCode] = useState<string | null>(null);

  // El código de recuperación se muestra ANTES de entrar (la sesión ya existe en ese momento).
  if (code) return <Frame><RecoveryCode code={code} onDone={() => setCode(null)} /></Frame>;
  if (session === null) {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true">
        <span className="animate-pulse overflow-hidden rounded-[22px] shadow-sm"><AppIcon size={88} /></span>
        <span className="sr-only">Cargando CCNA Quest…</span>
      </div>
    );
  }
  if (session || OPEN_PATHS.includes(pathname)) return <>{children}</>;

  return (
    <Frame>
      <header className="mb-8 text-center">
        <span className="mx-auto mb-4 block w-fit overflow-hidden rounded-[22px] shadow-sm"><AppIcon size={88} /></span>
        <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight">Bienvenido a CCNA Quest</h1>
        <p className="mt-2 text-[16px] text-muted">Aprende redes (CCNA 1) con lecciones sencillas, minijuegos y exámenes de práctica. Crea tu cuenta para empezar; si ya tienes una, inicia sesión.</p>
      </header>
      {!online && (
        <p className="mb-5 flex items-start gap-3 rounded-xl bg-warn/15 p-3 text-[15px]" role="status">
          <WifiOff size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <span>Estás sin conexión. Para crear tu cuenta o entrar la primera vez necesitas internet; después la app también funciona sin conexión.</span>
        </p>
      )}
      <AuthForms initialMode="register" onCode={setCode} />
      <p className="mt-6 text-center text-[15px]"><Link href="/instalar" className="font-semibold text-brand">Instalar la app en este dispositivo</Link></p>
    </Frame>
  );
}
