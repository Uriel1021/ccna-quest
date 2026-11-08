"use client";
/** Todas las formas de instalar CCNA Quest, adaptadas al dispositivo del alumno. */
import { useState } from "react";
import { CheckCircle2, Download, MonitorSmartphone, Share, SquarePlus, WifiOff, RefreshCw, Smartphone, FolderGit2, Zap, EllipsisVertical } from "lucide-react";
import { Button, Group, LargeTitle, Row } from "@/components/ui/apple";
import { promptInstall, useInstallState } from "@/lib/pwa-install";
import { haptic } from "@/lib/feedback";

const APK_URL = "https://github.com/Uriel1021/ccna-quest/releases/latest/download/ccna-quest.apk";
const REPO_URL = "https://github.com/Uriel1021/ccna-quest";

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-[16px] leading-snug">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-[14px] font-bold text-brand-fg">{i + 1}</span>
          <span className="pt-0.5">{it}</span>
        </li>
      ))}
    </ol>
  );
}

function PwaSection() {
  const state = useInstallState();
  const [result, setResult] = useState<string | null>(null);

  if (state === "unknown") return <div className="mb-8 h-40 rounded-2xl bg-surface" aria-hidden />;
  if (state === "native") {
    return <p className="mb-8 flex items-center gap-3 rounded-2xl bg-ok/12 p-4 text-[16px]" role="status"><CheckCircle2 className="shrink-0 text-ok" aria-hidden /> Ya estás usando la app de Android. ¡No necesitas nada más!</p>;
  }
  if (state === "installed") {
    return <p className="mb-8 flex items-center gap-3 rounded-2xl bg-ok/12 p-4 text-[16px]" role="status"><CheckCircle2 className="shrink-0 text-ok" aria-hidden /> CCNA Quest ya está instalada en este dispositivo.</p>;
  }
  return (
    <section className="mb-8 rounded-2xl bg-surface p-5" aria-labelledby="pwa-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand"><MonitorSmartphone aria-hidden /></span>
        <div>
          <h2 id="pwa-title" className="text-[19px] font-bold">Instalar desde el navegador</h2>
          <p className="text-[14px] text-muted">Recomendado en iPhone, iPad y computadora. Ocupa muy poco espacio.</p>
        </div>
      </div>
      {state === "prompt" && (
        <>
          <Button className="w-full" onClick={async () => {
            const r = await promptInstall();
            void haptic(r === "accepted" ? "success" : "tap");
            setResult(r === "accepted" ? "¡Listo! Busca el ícono de CCNA Quest en tu pantalla de inicio o en tus apps." : r === "dismissed" ? "Sin problema. Puedes instalarla cuando quieras desde aquí." : null);
          }}><Download size={18} aria-hidden /> Instalar CCNA Quest</Button>
          {result && <p className="mt-3 text-[15px] text-muted" role="status">{result}</p>}
        </>
      )}
      {state === "ios" && (
        <Steps items={[
          <>Abre esta página en <b>Safari</b>.</>,
          <>Toca el botón <b>Compartir</b> <Share size={17} className="inline align-[-3px] text-brand" aria-label="(ícono de compartir)" /> en la barra de abajo (o arriba en iPad).</>,
          <>Desliza y elige <b>Agregar a pantalla de inicio</b> <SquarePlus size={17} className="inline align-[-3px]" aria-hidden />.</>,
          <>Toca <b>Agregar</b>. CCNA Quest aparecerá como una app más.</>,
        ]} />
      )}
      {state === "manual" && (
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[15px] font-semibold">Chrome o Edge (Android, Windows, Mac, Linux)</p>
            <Steps items={[
              <>Abre el menú <EllipsisVertical size={17} className="inline align-[-3px]" aria-label="(tres puntos)" /> del navegador.</>,
              <>Elige <b>Instalar app</b> o <b>Agregar a pantalla principal</b>.</>,
            ]} />
          </div>
          <div>
            <p className="mb-2 text-[15px] font-semibold">Safari en Mac</p>
            <Steps items={[<>Menú <b>Archivo → Agregar al Dock</b>.</>]} />
          </div>
          <p className="text-[14px] text-muted">Firefox en computadora no permite instalar apps web; usa Chrome o Edge.</p>
        </div>
      )}
    </section>
  );
}

export function InstallPage() {
  const state = useInstallState();
  return (
    <div className="mx-auto max-w-2xl">
      <LargeTitle title="Instalar la app" subtitle="Tenla en tu pantalla de inicio y estudia aunque no tengas internet." />
      <PwaSection />

      {state !== "native" && (
        <Group header="App de Android (APK)" footer="Android pedirá permitir la instalación desde tu navegador la primera vez. Es normal en apps que no vienen de la Play Store.">
          <Row icon={Smartphone} tint="green" title="Descargar la APK" subtitle="Incluye recordatorios diarios y el Modo Enfoque con bloqueo total." href={APK_URL} />
          <Row icon={RefreshCw} tint="teal" title="Actualizaciones automáticas con Obtainium" subtitle={<>Instala Obtainium y agrega <span className="break-all font-mono text-[13px]">{REPO_URL}</span></>} />
        </Group>
      )}

      <Group header="Ventajas de instalarla">
        <Row icon={WifiOff} tint="orange" title="Funciona sin conexión" subtitle="Lecciones, juegos y exámenes disponibles siempre." />
        <Row icon={Zap} tint="indigo" title="Abre al instante" subtitle="Pantalla completa, sin barra del navegador." />
        <Row icon={RefreshCw} tint="blue" title="Se actualiza sola" subtitle="Siempre tienes la versión más reciente." />
      </Group>

      <Group header="Código abierto">
        <Row icon={FolderGit2} tint="gray" title="Ver el código en GitHub" subtitle="Libre para usar, estudiar y mejorar." href={REPO_URL} />
      </Group>
    </div>
  );
}
