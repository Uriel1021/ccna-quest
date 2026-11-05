import { notFound } from "next/navigation";
import { syllabus } from "@/content/syllabus";
import { lessonContent, lessonIdFromSlug, lessonSlug } from "@/content/lessons";
import { LessonView } from "@/components/learn/LessonView";
import { lessonFigures } from "@/content/lessons/figures";

export const dynamicParams = false;
export function generateStaticParams() {
  return syllabus.flatMap((m) => m.lessons.map(([id]) => ({ modulo: `modulo-${m.id}`, leccion: lessonSlug(id) })));
}
type Props = { params: Promise<{ modulo: string; leccion: string }> };

function resolve(modulo: string, leccion: string) {
  const m = syllabus.find((x) => `modulo-${x.id}` === modulo);
  const id = lessonIdFromSlug(leccion);
  const entry = m?.lessons.find(([lid]) => lid === id);
  const content = lessonContent(id);
  return m && entry && content ? { m, id, title: entry[1], content } : null;
}
export async function generateMetadata({ params }: Props) {
  const p = await params;
  const r = resolve(p.modulo, p.leccion);
  return { title: r ? `${r.id} ${r.title}` : "Lección" };
}
export default async function Page({ params }: Props) {
  const p = await params;
  const r = resolve(p.modulo, p.leccion);
  if (!r) notFound();
  return <LessonView module={r.m} lessonId={r.id} title={r.title} content={r.content} figures={lessonFigures(r.id)} />;
}
