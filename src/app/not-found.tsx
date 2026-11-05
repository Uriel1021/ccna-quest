import Link from "next/link";
import { MapPinOff } from "lucide-react";
export default function NotFound() {
  return (
    <section className="mx-auto max-w-md py-16 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-fill text-muted"><MapPinOff size={30} aria-hidden /></span>
      <h1 className="mt-5 font-display text-2xl font-bold">No encontramos esa página</h1>
      <p className="mt-2 text-muted">Como un paquete con la dirección equivocada: no llegó a ningún lado. Puede que el enlace esté mal escrito.</p>
      <Link href="/" className="pressable mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-6 font-semibold text-brand-fg">Ir al inicio</Link>
    </section>
  );
}
