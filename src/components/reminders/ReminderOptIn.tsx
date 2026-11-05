"use client";
/** Invitación amable (solo en la APK) para activar los recordatorios. Aparece una vez; nunca se activan solos. */
import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/apple";
import { haptic } from "@/lib/feedback";
import { declineReminders, enableReminders, getReminderSettings, remindersSupported } from "@/lib/reminders";

export function ReminderOptIn() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  useEffect(() => { if (remindersSupported()) void getReminderSettings().then((s) => setShow(!s.decided)); }, []);
  if (!show) return null;
  if (done) return <p className="mb-8 rounded-2xl bg-ok/12 p-4 text-[15px]" role="status">{done}</p>;
  return (
    <section className="mb-8 rounded-2xl bg-surface p-5 shadow-sm" aria-labelledby="optin">
      <div className="flex gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand"><BellRing aria-hidden /></span>
        <div>
          <h2 id="optin" className="text-[17px] font-semibold">¿Te recordamos estudiar?</h2>
          <p className="mt-1 text-[15px] text-muted">Dos avisos cortos al día: a las <b className="text-fg">8:00</b> y a las <b className="text-fg">19:30</b>. Puedes cambiar las horas o apagarlos cuando quieras.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={async () => { const ok = await enableReminders(); void haptic(ok ? "success" : "error"); setDone(ok ? "¡Listo! Te avisaremos a las 8:00 y a las 19:30. Cámbialo en Recordatorios." : "Sin permiso de notificaciones. Puedes activarlo después en Recordatorios."); }}>Sí, activar</Button>
        <Button variant="tinted" onClick={async () => { await declineReminders(); setShow(false); }}>Ahora no</Button>
      </div>
      <p className="mt-3 text-center text-[13px] text-muted"><Link href="/recordatorios" className="text-brand">Ver cómo se verán</Link></p>
    </section>
  );
}
