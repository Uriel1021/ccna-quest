import { notFound } from "next/navigation";
import { syllabus } from "@/content/syllabus";
import { LargeTitle } from "@/components/ui/apple";
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
      <LessonChecklist module={m} />
    </>
  );
}
