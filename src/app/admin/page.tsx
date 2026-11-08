import { Inbox } from "lucide-react";
import { Group, LargeTitle, Row } from "@/components/ui/apple";
export const metadata = { title: "Autor", robots: { index: false } };
export default function Page() {
  return (
    <div className="mx-auto max-w-2xl">
      <LargeTitle title="Autor" subtitle="Herramientas para quien mantiene la app." />
      <Group footer="Solo las cuentas autorizadas (ADMIN_EMAILS) pueden ver el contenido de la bandeja.">
        <Row icon={Inbox} tint="purple" title="Bandeja de comentarios" href="/admin/comentarios" />
      </Group>
    </div>
  );
}
