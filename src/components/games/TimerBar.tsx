import { Timer } from "lucide-react";
import { ProgressBar } from "./GameFrame";

export function TimerBar({ left, total }: { left: number; total: number }) {
  const low = left < 10;
  return (
    <div className="flex items-center gap-3">
      <Timer size={18} className={low ? "text-danger" : "text-muted"} aria-hidden />
      <div className="flex-1"><ProgressBar value={left / total} tint={low ? "bg-danger" : "bg-ok"} /></div>
      <span className="w-10 text-right text-[15px] font-semibold tabular-nums" aria-label={`${Math.ceil(left)} segundos`}>{Math.ceil(left)}s</span>
    </div>
  );
}

export function Lives({ n, max = 3 }: { n: number; max?: number }) {
  return <span aria-label={`${n} vidas`} className="text-[17px] tracking-tight">{"❤️".repeat(Math.max(0, n))}<span className="opacity-25">{"🤍".repeat(Math.max(0, max - n))}</span></span>;
}
