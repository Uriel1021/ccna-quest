/**
 * Componentes con lenguaje visual iOS/macOS: títulos grandes, listas agrupadas
 * con inserción, iconos en "squircle" de color y botones tipo cápsula.
 */
import Link from "next/link";
import clsx from "clsx";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function LargeTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[34px] font-bold leading-tight tracking-[-0.025em]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function Group({ header, footer, children, className }: {
  header?: string; footer?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={clsx("mb-8", className)}>
      {header && <h2 className="mb-1.5 px-4 text-[13px] font-normal uppercase tracking-wide text-muted">{header}</h2>}
      <ul className="overflow-hidden rounded-xl bg-surface">{children}</ul>
      {footer && <p className="mt-1.5 px-4 text-[13px] text-muted">{footer}</p>}
    </section>
  );
}

export const TINTS = {
  blue: "bg-brand", green: "bg-ok", orange: "bg-warn", red: "bg-danger",
  purple: "bg-accent", indigo: "bg-indigo", teal: "bg-teal", pink: "bg-pink", gray: "bg-muted",
} as const;
export type Tint = keyof typeof TINTS;

export function IconTile({ icon: Icon, tint = "blue", size = 29 }: { icon: LucideIcon; tint?: Tint; size?: number }) {
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-[7px] text-white", TINTS[tint])} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.6)} strokeWidth={2.25} aria-hidden />
    </span>
  );
}

type RowProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  tint?: Tint;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

/** Fila de lista. El separador empieza después del icono, igual que en iOS. */
export function Row({ title, subtitle, icon, tint, leading, trailing, href, onClick, ariaLabel }: RowProps) {
  const inner = (
    <>
      {leading ?? (icon && <IconTile icon={icon} tint={tint} />)}
      <span className="flex min-h-11 flex-1 items-center gap-3 border-b border-border/70 py-2.5 pr-4 group-last:border-b-0">
        <span className="min-w-0 flex-1">
          <span className="block truncate">{title}</span>
          {subtitle && <span className="mt-0.5 block text-[15px] leading-snug text-muted">{subtitle}</span>}
        </span>
        {trailing && <span className="shrink-0 text-[17px] text-muted">{trailing}</span>}
        {href && <ChevronRight size={18} className="shrink-0 text-muted/60" aria-hidden />}
      </span>
    </>
  );
  const cls = "flex w-full items-center gap-3 pl-4 text-left";
  if (href) return <li className="group"><Link href={href} aria-label={ariaLabel} className={clsx(cls, "hover:bg-fill active:bg-fill")}>{inner}</Link></li>;
  if (onClick) return <li className="group"><button onClick={onClick} aria-label={ariaLabel} className={clsx(cls, "hover:bg-fill active:bg-fill")}>{inner}</button></li>;
  return <li className={clsx("group", cls)}>{inner}</li>;
}

export function Button({ variant = "filled", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "filled" | "tinted" | "plain" }) {
  return (
    <button
      {...props}
      className={clsx(
        "pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[17px] font-semibold disabled:opacity-40",
        variant === "filled" && "bg-brand text-brand-fg",
        variant === "tinted" && "bg-brand/15 text-brand",
        variant === "plain" && "text-brand",
        className,
      )}
    />
  );
}

export function ProgressRing({ value, size = 44, stroke = 5, tint = "var(--brand)" }: { value: number; size?: number; stroke?: number; tint?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(v * 100)}% completado`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tint} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - v)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.32,0.72,0,1)" }}
      />
    </svg>
  );
}
