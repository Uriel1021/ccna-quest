import { LargeTitle, Group, Row } from "./apple";
import { BookOpen } from "lucide-react";
export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <>
      <LargeTitle title={title} subtitle={text} />
      <Group footer="Esta sección se construye en el siguiente paso.">
        <Row icon={BookOpen} tint="orange" title="Mientras tanto, explora el temario" href="/aprender" />
      </Group>
    </>
  );
}
