"use client";
import { syllabus } from "@/content/syllabus";
import { Group, Row, ProgressRing } from "@/components/ui/apple";
import { useLessonStats } from "./useLessonStats";

export function ModuleList() {
  const { perModule } = useLessonStats();
  const sections: [string, number[]][] = [
    ["Fundamentos", [1, 2, 3, 4, 5]],
    ["Ethernet y capa de red", [6, 7, 8, 9, 10]],
    ["Direccionamiento IP", [11, 12, 13]],
    ["Transporte, aplicaciones y seguridad", [14, 15, 16, 17]],
  ];
  return (
    <>
      {sections.map(([header, ids]) => (
        <Group key={header} header={header}>
          {ids.map((id) => {
            const m = syllabus[id - 1];
            const s = perModule[id - 1];
            return (
              <Row
                key={id}
                href={`/aprender/modulo-${id}`}
                ariaLabel={`Módulo ${id}: ${m.title}. ${s.done} de ${s.total} lecciones.`}
                leading={
                  <span className="relative grid size-11 shrink-0 place-items-center">
                    <ProgressRing value={s.ratio} size={44} stroke={3.5} tint={s.ratio === 1 ? "var(--ok)" : "var(--brand)"} />
                    <span className="absolute text-[15px] font-semibold">{id}</span>
                  </span>
                }
                title={m.title}
                subtitle={m.plain}
                trailing={<span className="text-[15px]">{s.done}/{s.total}</span>}
              />
            );
          })}
        </Group>
      ))}
    </>
  );
}
