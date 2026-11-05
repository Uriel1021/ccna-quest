import { LargeTitle } from "@/components/ui/apple";
import { HomeDashboard } from "@/components/learn/HomeDashboard";

export default function Home() {
  return (
    <>
      <LargeTitle title="¡Hola! 👋" subtitle="Aprendamos redes paso a paso. No necesitas saber nada antes." />
      <HomeDashboard />
    </>
  );
}
