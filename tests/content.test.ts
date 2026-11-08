/**
 * Pruebas estáticas de integridad del contenido (temario, lecciones, figuras, preguntas, exámenes, juegos, insignias).
 * Ejecutar: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { syllabus } from "../src/content/syllabus";
import { lessonContent, lessonSlug, lessonIdFromSlug, LESSON_LIST, neighbors, readingMinutes } from "../src/content/lessons";
import { FIGURES_A } from "../src/content/lessons/figures-a";
import { FIGURES_B } from "../src/content/lessons/figures-b";
import { questionsForModules } from "../src/content/questions";
import { EXAMS, drawQuestions, examById } from "../src/content/exams";
import { GAMES } from "../src/content/games";
import { GAME_SLUGS } from "../src/content/game-slugs";
import { BADGES } from "../src/content/badges";

const ALL_Q = questionsForModules(syllabus.map((m) => m.id));

test("temario: 17 módulos con ids consecutivos y lecciones con prefijo correcto", () => {
  assert.equal(syllabus.length, 17);
  syllabus.forEach((m, i) => {
    assert.equal(m.id, i + 1);
    assert.ok(m.lessons.length > 0, `módulo ${m.id} sin lecciones`);
    for (const [id] of m.lessons) assert.match(id, new RegExp(`^${m.id}\\.\\d+$`), `lección ${id} fuera de su módulo ${m.id}`);
  });
  const ids = LESSON_LIST.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length, "ids de lección duplicados");
});

test("lecciones: cada lección del temario tiene contenido completo", () => {
  for (const { id } of LESSON_LIST) {
    const c = lessonContent(id);
    assert.ok(c, `falta contenido de la lección ${id}`);
    assert.ok(c.body.length >= 1 && c.body.every((p) => p.trim().length > 40), `cuerpo pobre en ${id}`);
    assert.ok(c.keys.length >= 2 && c.keys.every((k) => k.trim()), `puntos clave insuficientes en ${id}`);
    assert.ok(readingMinutes(c) >= 1);
    // Marcado **negritas** y `código` balanceado
    for (const t of [...c.body, ...c.keys, c.example ?? ""]) {
      assert.equal((t.match(/\*\*/g) ?? []).length % 2, 0, `** desbalanceado en ${id}: ${t.slice(0, 60)}`);
      assert.equal((t.match(/`/g) ?? []).length % 2, 0, `\` desbalanceado en ${id}: ${t.slice(0, 60)}`);
    }
  }
});

test("lecciones: slug ida y vuelta, y vecinas coherentes", () => {
  for (const { id } of LESSON_LIST) {
    assert.equal(lessonIdFromSlug(lessonSlug(id)), id);
    assert.doesNotMatch(lessonSlug(id), /\./);
  }
  assert.equal(neighbors(LESSON_LIST[0].id).prev, undefined);
  assert.equal(neighbors(LESSON_LIST.at(-1)!.id).next, undefined);
});

test("figuras: solo para lecciones existentes, sin duplicar entre archivos y con texto alternativo", () => {
  const valid = new Set(LESSON_LIST.map((l) => l.id));
  for (const id of Object.keys(FIGURES_A)) assert.ok(!(id in FIGURES_B), `figura ${id} definida en A y B`);
  let total = 0;
  for (const [id, defs] of [...Object.entries(FIGURES_A), ...Object.entries(FIGURES_B)]) {
    assert.ok(valid.has(id), `figura para lección inexistente ${id}`);
    assert.ok(defs.length >= 1 && defs.length <= 4, `cantidad de figuras inválida en ${id}`);
    for (const d of defs) {
      assert.ok(d.caption.trim() && d.alt.trim().length > 10, `figura de ${id} sin pie o alt`);
      assert.ok(d.el, `figura de ${id} sin elemento`);
    }
    total += defs.length;
  }
  assert.ok(total >= 90, `se esperaban ~98 figuras, hay ${total}`);
});

test("preguntas: ids únicos, opciones válidas y respuestas dentro de rango", () => {
  const ids = ALL_Q.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "ids de pregunta duplicados");
  for (const q of ALL_Q) {
    assert.ok(q.module >= 1 && q.module <= 17, `${q.id}: módulo inválido`);
    assert.ok(q.prompt.trim() && q.explain.trim(), `${q.id}: sin enunciado o explicación`);
    assert.ok(q.options.length >= 2, `${q.id}: menos de 2 opciones`);
    assert.equal(new Set(q.options.map((o) => o.trim().toLowerCase())).size, q.options.length, `${q.id}: opciones repetidas`);
    assert.ok(q.correct.length >= 1, `${q.id}: sin respuesta correcta`);
    assert.equal(new Set(q.correct).size, q.correct.length, `${q.id}: respuesta correcta repetida`);
    for (const c of q.correct) assert.ok(Number.isInteger(c) && c >= 0 && c < q.options.length, `${q.id}: índice ${c} fuera de rango`);
    const m = q.prompt.match(/Elige (dos|tres)/i);
    const want = m ? (m[1].toLowerCase() === "dos" ? 2 : 3) : 1;
    assert.equal(q.correct.length, want, `${q.id}: dice elegir ${want} pero tiene ${q.correct.length} correctas`);
  }
  for (const m of syllabus) assert.ok(questionsForModules([m.id]).length >= 5, `módulo ${m.id} con pocas preguntas`);
});

test("exámenes: ids únicos, parámetros válidos y sorteo sin duplicados", () => {
  assert.equal(new Set(EXAMS.map((e) => e.id)).size, EXAMS.length);
  const qIds = new Set(ALL_Q.map((q) => q.id));
  for (const e of EXAMS) {
    assert.equal(examById(e.id), e);
    assert.ok(e.pass > 0 && e.pass <= 100 && e.minutes >= 0 && e.count > 0);
    const pool = questionsForModules(e.modules).length;
    assert.ok(pool >= e.count, `${e.id}: pide ${e.count} preguntas pero el banco tiene ${pool}`);
    for (const seed of ["a", "b", "c"]) {
      const drawn = drawQuestions(e, seed);
      assert.equal(drawn.length, e.count, `${e.id}: sorteo de ${drawn.length}/${e.count}`);
      assert.equal(new Set(drawn).size, drawn.length, `${e.id}: preguntas repetidas en un intento`);
      for (const id of drawn) assert.ok(qIds.has(id));
      const mods = new Set(drawn.map((id) => Number(id.split("-")[0].slice(1))));
      if (e.count >= e.modules.length) for (const m of e.modules) assert.ok(mods.has(m), `${e.id}: el módulo ${m} quedó fuera`);
      else assert.equal(mods.size, e.count, `${e.id}: debería tomar ${e.count} módulos distintos`);
    }
    assert.deepEqual(drawQuestions(e, "fija"), drawQuestions(e, "fija"), `${e.id}: sorteo no reproducible`);
  }
});

test("juegos: catálogo y lista de slugs coinciden; metadatos completos", () => {
  assert.deepEqual(GAMES.map((g) => g.slug).sort(), [...GAME_SLUGS].sort());
  for (const g of GAMES) {
    assert.ok(g.module >= 1 && g.module <= 17, `${g.slug}: módulo inválido`);
    assert.ok(g.title && g.tagline && g.learn && g.howTo.length > 0 && g.minutes > 0, `${g.slug}: metadatos incompletos`);
  }
});

test("insignias: ids únicos", () => {
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
});
