"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { haptic } from "@/lib/feedback";
import { Feedback, ProgressBar, type GameProps } from "./GameFrame";
import { makeSubnetQuiz } from "./subnet-questions";

const COUNT = 8;

export default function SubnetSprint({ onFinish }: GameProps) {
  const quiz = useMemo(() => makeSubnetQuiz(COUNT), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = quiz[i];

  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    const ok = o === q.answer;
    if (ok) setScore((s) => s + 1);
    void haptic(ok ? "success" : "error");
  };
  const next = () => {
    if (i + 1 >= COUNT) return onFinish({ score, max: COUNT, summary: `${score} de ${COUNT} cálculos correctos` });
    setI(i + 1);
    setPicked(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1"><ProgressBar value={(i + (picked ? 1 : 0)) / COUNT} tint="bg-indigo" /></div>
        <span className="text-[15px] font-semibold tabular-nums">{i + 1}/{COUNT}</span>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-sm">
        <p className="text-[19px] font-semibold leading-snug">{q.prompt}</p>
        {q.subject && <p className="mt-3 break-all rounded-xl bg-fill px-4 py-3 text-center font-mono text-[22px] font-bold sm:text-[26px]">{q.subject}</p>}
      </div>

      <div className={clsx("mt-4 grid gap-2", q.options.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {q.options.map((o) => {
          const isAns = picked != null && o === q.answer;
          const isBad = picked === o && o !== q.answer;
          return (
            <button
              key={o}
              onClick={() => choose(o)}
              disabled={picked != null}
              className={clsx(
                "pressable min-h-14 rounded-xl bg-surface px-4 font-mono text-[19px] font-semibold ring-1 ring-border/60",
                isAns && "!bg-ok text-white ring-0",
                isBad && "!bg-danger text-white ring-0",
                picked != null && !isAns && !isBad && "opacity-50",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>

      {picked && (
        <Feedback ok={picked === q.answer} title={picked === q.answer ? "¡Correcto!" : `La respuesta es ${q.answer}`} onNext={next} nextLabel={i + 1 >= COUNT ? "Ver resultados" : "Siguiente"}>
          {q.explain}
        </Feedback>
      )}
    </div>
  );
}
