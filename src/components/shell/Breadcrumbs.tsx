"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { labelFor } from "./nav";

/**
 * Botón "‹ Atrás" estilo iOS (H3 control y libertad): siempre indica a dónde vuelves.
 * En escritorio muestra además la ruta completa, como la barra de ruta de Finder.
 */
export function Breadcrumbs() {
  const parts = usePathname().split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const parentHref = "/" + parts.slice(0, -1).join("/");
  return (
    <nav aria-label="Ruta de navegación" className="-ml-2 mb-2 flex items-center gap-4">
      <Link href={parentHref} className="pressable inline-flex min-h-11 items-center text-brand">
        <ChevronLeft size={26} strokeWidth={2.5} aria-hidden className="-mr-0.5" />
        <span>{labelFor(parts[parts.length - 2])}</span>
      </Link>
      <ol className="hidden items-center gap-1.5 text-[13px] text-muted md:flex">
        {parts.map((seg, i) => (
          <li key={seg} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>›</span>}
            <span aria-current={i === parts.length - 1 ? "page" : undefined}>{labelFor(seg)}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
