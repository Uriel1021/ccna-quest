import { Figure } from "@/components/figures/kit";
import { FIGURES_A } from "./figures-a";
import { FIGURES_B } from "./figures-b";

/** Figuras de una lección, listas para insertar (se renderizan en el servidor como SVG/HTML estático). */
export function lessonFigures(id: string) {
  const defs = FIGURES_A[id] ?? FIGURES_B[id] ?? [];
  return defs.map((d, i) => (
    <Figure key={i} n={defs.length > 1 ? `${id}${"abcd"[i]}` : id} caption={d.caption} alt={d.alt}>{d.el}</Figure>
  ));
}
export const figureCount = (id: string) => (FIGURES_A[id] ?? FIGURES_B[id] ?? []).length;
