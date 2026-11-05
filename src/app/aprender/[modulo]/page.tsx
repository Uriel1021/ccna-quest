import { notFound } from "next/navigation";
import { syllabus } from "@/content/syllabus";
import { LargeTitle, Group, Row } from "@/components/ui/apple";
import { gamesForModule } from "@/content/games";
import { examsForModule } from "@/content/exams";
import { ClipboardCheck } from "lucide-react";
import { LessonChecklist } from "@/components/learn/LessonChecklist";

export const dynamicParams = false;
export function generateStaticParams() {
  return syllabus.map((m) => ({ modulo: `modulo-${m.id}` }));
}

type Props = { params: Promise<{ modulo: string }> };

export async function generateMetadata({ params }: Props) {
  const id = Number((await params).modulo.replace("modulo-", ""));
  return { title: `Módulo ${id}` };
}

export default async function ModulePage({ params }: Props) {
  const id = Number((await params).modulo.replace("modulo-", ""));
  const m = syllabus.find((x) => x.id === id);
  if (!m) notFound();
  return (
    <>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-brand">Módulo {m.id}</p>
      <LargeTitle title={m.title} subtitle={m.plain} />
      {gamesForModule(m.id).length > 0 && (
        <Group header="Practica jugando">
          {gamesForModule(m.id).map((g) => (
            <Row key={g.slug} href={`/juegos/${g.slug}`} icon={g.icon} tint={g.tint} title={g.title} subtitle={g.tagline} />
          ))}
        </Group>
      )}
      <LessonChecklist module={m} />
      <Group header="Evalúate">
        {examsForModule(m.id).map((e) => (
          <Row key={e.id} href={`/examenes/${e.id}`} icon={ClipboardCheck} tint="green" title={`Examen ${e.title}`} subtitle={e.subtitle} />
        ))}
      </Group>
    </>
  );
}
