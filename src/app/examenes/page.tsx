import { LargeTitle } from "@/components/ui/apple";
import { ExamList } from "@/components/exams/ExamList";
export const metadata = { title: "Exámenes" };
export default function Page() {
  return (
    <>
      <LargeTitle title="Exámenes" subtitle="Simuladores con preguntas aleatorias. Funcionan sin internet y guardan cada respuesta al instante." />
      <ExamList />
    </>
  );
}
