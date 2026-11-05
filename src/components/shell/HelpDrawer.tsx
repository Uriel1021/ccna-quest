"use client";
import { useEffect, useRef } from "react";
import { BookOpen, CloudOff, ClipboardCheck, Timer, Keyboard } from "lucide-react";
import { Group, Row } from "@/components/ui/apple";

/* H10 Ayuda y documentación: hoja estilo iOS, breve y orientada a tareas. */
const FAQ = [
  { icon: BookOpen, tint: "orange", q: "¿Por dónde empiezo?", a: "Entra a Aprender → Módulo 1. Cada lección dura unos 5 minutos y termina con un minijuego." },
  { icon: CloudOff, tint: "teal", q: "¿Se pierde mi avance sin internet?", a: "No. Todo se guarda en tu dispositivo y se envía solo cuando vuelve la conexión. Lo ves en el indicador de arriba." },
  { icon: ClipboardCheck, tint: "green", q: "¿Cómo funcionan los exámenes?", a: "Cada intento sortea preguntas distintas. Al terminar ves qué fallaste y por qué." },
  { icon: Timer, tint: "indigo", q: "¿Qué es el Modo Enfoque?", a: "Una sesión de 60 minutos sin distracciones. En Android la pantalla queda fijada." },
  { icon: Keyboard, tint: "gray", q: "Atajos de teclado", a: "? abre esta ayuda · Esc la cierra · Tab recorre los controles." },
] as const;

export function HelpDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const doneRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) doneRef.current?.focus(); }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <button aria-label="Cerrar ayuda" tabIndex={-1} className="animate-fade absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="animate-sheet relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[14px] bg-bg pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl md:max-w-lg md:rounded-[14px]">
        <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur">
          <div className="mx-auto mt-2 h-[5px] w-9 rounded-full bg-muted/40 md:hidden" aria-hidden />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3">
            <span />
            <h2 id="help-title" className="text-[17px] font-semibold">Ayuda</h2>
            <button ref={doneRef} onClick={onClose} className="justify-self-end font-semibold text-brand">Listo</button>
          </div>
        </div>
        <div className="px-4 pt-2">
          <Group footer="¿Tienes otra duda? Pregúntale a tu profesor o revisa la lección del tema.">
            {FAQ.map(({ icon, tint, q, a }) => <Row key={q} icon={icon} tint={tint} title={q} subtitle={a} />)}
          </Group>
        </div>
      </div>
    </div>
  );
}
