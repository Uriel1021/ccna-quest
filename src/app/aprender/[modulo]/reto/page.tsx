import { syllabus } from "@/content/syllabus";
import { ChallengeRunner } from "@/components/games/ChallengeRunner";

export const dynamicParams = false;
export function generateStaticParams() {
  return syllabus.map((m) => ({ modulo: `modulo-${m.id}` }));
}
type Props = { params: Promise<{ modulo: string }> };
export async function generateMetadata({ params }: Props) {
  return { title: `Reto del ${(await params).modulo.replace("modulo-", "módulo ")}` };
}
export default async function Page({ params }: Props) {
  const id = Number((await params).modulo.replace("modulo-", ""));
  return <ChallengeRunner moduleId={id} />;
}
