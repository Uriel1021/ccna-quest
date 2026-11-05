import { notFound } from "next/navigation";
import { EXAMS, examById } from "@/content/exams";
import { ExamRunner } from "@/components/exams/ExamRunner";

export const dynamicParams = false;
export function generateStaticParams() {
  return EXAMS.map((e) => ({ id: e.id }));
}
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  return { title: examById((await params).id)?.title ?? "Examen" };
}
export default async function ExamPage({ params }: Props) {
  const e = examById((await params).id);
  if (!e) notFound();
  return <ExamRunner examId={e.id} />;
}
