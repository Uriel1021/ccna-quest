import { LargeTitle } from "@/components/ui/apple";
import { ModuleList } from "@/components/learn/ModuleList";
export const metadata = { title: "Aprender" };
export default function Page() {
  return (
    <>
      <LargeTitle title="Aprender" subtitle="Introducción a redes (CCNA 1) · 17 módulos. Cada uno se apoya en el anterior." />
      <ModuleList />
    </>
  );
}
