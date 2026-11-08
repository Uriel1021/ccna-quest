"use client";
/** Invitación discreta en Inicio para instalar la web como app. Solo aparece si el navegador lo permite. */
import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/apple";
import { dismissInstall, installDismissed, promptInstall, useInstallState } from "@/lib/pwa-install";
import { haptic } from "@/lib/feedback";

export function InstallCard() {
  const state = useInstallState();
  const [hidden, setHidden] = useState(false);
  if (hidden || (state !== "prompt" && state !== "ios") || installDismissed()) return null;
  return (
    <section className="mb-8 rounded-2xl bg-surface p-5 shadow-sm" aria-labelledby="install-title">
      <div className="flex gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ok/15 text-ok"><Download aria-hidden /></span>
        <div>
          <h2 id="install-title" className="text-[17px] font-semibold">Instala CCNA Quest</h2>
          <p className="mt-1 text-[15px] text-muted">Tenla en tu pantalla de inicio y estudia aunque no tengas internet.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {state === "prompt"
          ? <Button onClick={async () => { const r = await promptInstall(); void haptic(r === "accepted" ? "success" : "tap"); setHidden(true); }}>Instalar</Button>
          : <Link href="/instalar" className="pressable inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-[17px] font-semibold text-brand-fg">Ver cómo</Link>}
        <Button variant="tinted" onClick={() => { dismissInstall(); setHidden(true); }}>Ahora no</Button>
      </div>
    </section>
  );
}
