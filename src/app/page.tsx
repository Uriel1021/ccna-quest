import { LargeTitle } from "@/components/ui/apple";
import { HomeDashboard } from "@/components/learn/HomeDashboard";
import { ReminderOptIn } from "@/components/reminders/ReminderOptIn";

export default function Home() {
  return (
    <>
      <LargeTitle title="¡Hola! 👋" subtitle="Aprendamos redes paso a paso. No necesitas saber nada antes." />
      <ReminderOptIn />
      <HomeDashboard />
    </>
  );
}
