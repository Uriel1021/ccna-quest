import { WifiOff } from "lucide-react";
export const metadata = { title: "Sin conexión" };
export default function Offline() {
  return (
    <section className="mx-auto max-w-md py-16 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-fill text-muted"><WifiOff size={30} aria-hidden /></span>
      <h1 className="mt-5 font-display text-2xl font-bold">Esta página aún no está guardada</h1>
      <p className="mt-2 text-muted">No tienes conexión y aún no habías abierto esta sección. Lo que ya visitaste sí funciona, y tu progreso se sigue guardando en el dispositivo.</p>
    </section>
  );
}
