"use client";
import { AlertTriangle } from "lucide-react";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto max-w-md py-16 text-center" role="alert">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-warn/15 text-warn"><AlertTriangle size={30} aria-hidden /></span>
      <h1 className="mt-5 font-display text-2xl font-bold">Algo falló al cargar esta sección</h1>
      <p className="mt-2 text-muted">Tu progreso está a salvo en este dispositivo. Intenta de nuevo; si sigue pasando, revisa tu conexión.</p>
      <button onClick={reset} className="pressable mt-6 min-h-11 rounded-full bg-brand px-6 font-semibold text-brand-fg">Reintentar</button>
    </section>
  );
}
