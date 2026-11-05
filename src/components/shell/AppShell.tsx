"use client";
/**
 * Layout principal con lenguaje visual de Apple (macOS en escritorio, iOS en móvil).
 * Mapa de las 10 heurísticas de Nielsen:
 *  H1 Visibilidad del estado   → estado de sincronización en vivo, pestaña activa, anillo de nivel/XP.
 *  H2 Mundo real               → lenguaje cotidiano, iconos reconocibles, metáforas de "correo".
 *  H3 Control y libertad       → botón "‹ Atrás" con destino visible, Esc cierra hojas, deshacer en todo.
 *  H4 Consistencia             → convenciones iOS/macOS (tab bar, sidebar, hojas, "Listo").
 *  H5 Prevención de errores    → objetivos táctiles ≥44px, sin callejones sin salida.
 *  H6 Reconocer > recordar     → iconos SIEMPRE con texto.
 *  H7 Flexibilidad/eficiencia  → atajo "?", navegación completa por teclado, tocar estado = sincronizar.
 *  H8 Minimalismo              → 5 destinos; materiales translúcidos que no compiten con el contenido.
 *  H9 Recuperarse de errores   → páginas de error/404/offline en lenguaje claro y con salida.
 *  H10 Ayuda                   → botón de ayuda permanente.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { HelpCircle } from "lucide-react";
import clsx from "clsx";
import { NAV } from "./nav";
import { ConnectionStatus } from "./ConnectionStatus";
import { Breadcrumbs } from "./Breadcrumbs";
import { HelpDrawer } from "./HelpDrawer";
import { IconTile, ProgressRing } from "@/components/ui/apple";
import { AppIcon } from "@/components/brand/AppIcon";
import { db } from "@/lib/local-db";
import { startSyncTriggers } from "@/lib/sync-client";
import { XP_PER_LEVEL } from "@/lib/progress";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

function useProfile() {
  return useLiveQuery(() => db.profile.get("me"), []);
}

function LevelBadge({ compact = false }: { compact?: boolean }) {
  const p = useProfile();
  const xp = p?.xp ?? 0, level = p?.level ?? 1;
  const into = (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  if (compact) {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fill pl-1 pr-3 text-[13px] font-semibold" title={`Nivel ${level} · ${xp} XP`}>
        <ProgressRing value={into} size={24} stroke={3} /> {xp} XP
      </span>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl bg-fill p-3">
      <ProgressRing value={into} size={40} stroke={4.5} />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold">Nivel {level}</div>
        <div className="text-[13px] text-muted">{xp} XP · faltan {XP_PER_LEVEL - (xp % XP_PER_LEVEL)}</div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => startSyncTriggers(), []);

  // H7: atajos de teclado (ignorados mientras se escribe).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      if (e.key === "?") { e.preventDefault(); setHelpOpen(true); }
      if (e.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = NAV.find((n) => isActive(pathname, n.href));

  return (
    <div className="min-h-dvh md:flex">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg">
        Saltar al contenido
      </a>

      {/* ── Barra lateral estilo macOS ── */}
      <aside className="material sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/60 px-3 pb-4 pt-5 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2" aria-label="CCNA Quest, ir al inicio">
          <span className="overflow-hidden rounded-[9px] shadow-sm"><AppIcon size={32} /></span>
          <span className="text-[17px] font-semibold tracking-tight">CCNA Quest</span>
        </Link>
        <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Estudiar</p>
        <nav aria-label="Principal">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon, hint, tint }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={hint}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex min-h-9 items-center gap-2.5 rounded-lg px-2 py-1.5 text-[15px]",
                      active ? "bg-brand font-medium text-white" : "hover:bg-fill",
                    )}
                  >
                    <span className={clsx(active && "[&>span]:!bg-white/25")}><IconTile icon={icon} tint={tint} size={24} /></span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto"><LevelBadge /></div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* ── Barra superior translúcida ── */}
        <header className="material sticky top-0 z-30 border-b border-border/60 pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-12 max-w-5xl items-center gap-2 px-4 md:px-8">
            <span className="text-[17px] font-semibold md:hidden">{current?.label ?? "CCNA Quest"}</span>
            <div className="ml-auto flex items-center gap-2">
              <ConnectionStatus />
              <span className="md:hidden"><LevelBadge compact /></span>
              <button
                onClick={() => setHelpOpen(true)}
                className="pressable grid size-9 place-items-center rounded-full text-brand hover:bg-fill"
                aria-label="Abrir ayuda (atajo: ?)"
                title="Ayuda (?)"
              >
                <HelpCircle size={22} />
              </button>
            </div>
          </div>
        </header>

        <main id="contenido" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-32 pt-5 outline-none md:px-8 md:pb-12 md:pt-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>

      {/* ── Barra de pestañas estilo iOS ── */}
      <nav aria-label="Principal" className="material fixed inset-x-0 bottom-0 z-30 border-t border-border/60 pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={clsx("flex h-[52px] flex-col items-center justify-center gap-1 text-[10px] font-medium", active ? "text-brand" : "text-muted")}
                >
                  <Icon size={24} strokeWidth={active ? 2.4 : 1.9} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
