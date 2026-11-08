/**
 * Prueba dinámica 2: flujos reales de un alumno en Chrome (vista móvil).
 * /api/sync se simula (no toca la BD real) y cada operación enviada se valida contra el contrato.
 * Uso: BASE=http://localhost:3100 npx tsx tests/e2e/flows.mts
 */
import { chromium, type Page, type BrowserContext } from "playwright-core";
import { QUESTIONS } from "../../src/content/questions";
import { GAME_SLUGS } from "../../src/content/game-slugs";
import { syllabus } from "../../src/content/syllabus";
import { lessonSlug } from "../../src/content/lessons";
import { SyncRequest } from "../../src/lib/sync-protocol";

const BASE = process.env.BASE ?? "http://localhost:3100";
const results: { name: string; ok: boolean; detail?: string }[] = [];
const pageErrors: string[] = [];
const syncErrors: string[] = [];
let syncOps = 0;
let syncDown = false;

async function step(name: string, fn: () => Promise<void>) {
  const before = pageErrors.length;
  try {
    await fn();
    const errs = pageErrors.slice(before);
    results.push({ name, ok: errs.length === 0, detail: errs.join(" | ") || undefined });
  } catch (e) {
    results.push({ name, ok: false, detail: (e as Error).message.split("\n")[0] + (pageErrors.slice(before).length ? " | " + pageErrors.slice(before).join(" | ") : "") });
  }
}
const expect = (cond: unknown, msg: string) => { if (!cond) throw new Error(msg); };

async function setup(ctx: BrowserContext) {
  await ctx.route("**/api/sync", async (route) => {
    if (syncDown) return route.abort("internetdisconnected");
    const body = route.request().postDataJSON();
    const parsed = SyncRequest.safeParse(body);
    if (!parsed.success) syncErrors.push(`${JSON.stringify(parsed.error.issues.slice(0, 2))} ← ${JSON.stringify(body).slice(0, 300)}`);
    syncOps += body?.ops?.length ?? 0;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ applied: (body?.ops ?? []).map((o: { seq: number }) => o.seq), rejected: [] }) });
  });
}
function watch(page: Page) {
  page.on("pageerror", (e) => { if (!e.message.includes("reading 'waiting'")) pageErrors.push(`${new URL(page.url()).pathname}: ${e.message.slice(0, 160)}`); });
  page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("internetdisconnected") && !m.text().includes("ERR_INTERNET_DISCONNECTED") && !m.text().includes("Failed to fetch RSC payload")) pageErrors.push(`${new URL(page.url()).pathname}: console ${m.text().slice(0, 160)}`); });
}
const go = (page: Page, path: string) => page.goto(BASE + path, { waitUntil: "networkidle" });
const xpText = (page: Page) => page.locator("header").getByText(/\d+ XP/).first().innerText();

/** Responde el examen en pantalla: correct=true elige las correctas, false elige una incorrecta. */
async function answerExam(page: Page, correct: boolean) {
  await page.getByText(/^Pregunta 1 de/).waitFor({ timeout: 5000 });
  for (let guard = 0; guard < 60; guard++) {
    const h2s = (await page.locator("h2").allInnerTexts()).map((t) => t.trim());
    const prompt = h2s.join(" / ");
    const q = QUESTIONS.find((x) => h2s.includes(x.prompt));
    expect(q, `pregunta no encontrada en el banco: ${prompt}`);
    const want = correct ? q!.correct.map((i) => q!.options[i]) : [q!.options.find((_, i) => !q!.correct.includes(i))!];
    for (const text of want) await page.getByRole(q!.correct.length > 1 ? "checkbox" : "radio", { name: text, exact: true }).click();
    const next = page.getByRole("button", { name: /^Siguiente/ });
    if (await next.count()) { await next.click(); continue; }
    await page.getByRole("button", { name: "Entregar", exact: true }).click();
    await page.getByRole("button", { name: "Entregar ahora" }).click();
    return;
  }
  throw new Error("el examen no terminó");
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block", locale: "es-MX" });
await setup(ctx);
const page = await ctx.newPage();
watch(page);

await step("Inicio carga con perfil nuevo (0 XP)", async () => {
  await go(page, "/");
  await page.waitForTimeout(500);
  expect((await xpText(page)) === "0 XP", `XP inicial = ${await xpText(page)}`);
});

await step("Lección: marcar como estudiada avanza a la siguiente y suma 10 XP", async () => {
  await go(page, "/aprender/modulo-1/leccion-1-1");
  await page.getByRole("button", { name: /Marcar como estudiada y continuar/ }).click();
  await page.waitForURL(/leccion-1-2/);
  await page.waitForTimeout(300);
  expect((await xpText(page)) === "10 XP", `XP = ${await xpText(page)}`);
});

await step("Lección: el progreso persiste al recargar y se puede desmarcar", async () => {
  await go(page, "/aprender/modulo-1/leccion-1-1");
  await page.getByRole("button", { name: /Siguiente lección/ }).waitFor({ timeout: 4000 });
  await page.getByRole("button", { name: "Marcar como no estudiada" }).click();
  await page.getByRole("button", { name: /Marcar como estudiada y continuar/ }).waitFor({ timeout: 4000 });
  await page.waitForTimeout(300);
  expect((await xpText(page)) === "0 XP", `XP tras desmarcar = ${await xpText(page)}`);
});

await step("Examen M1–3 todo correcto → 100 % y ¡Aprobado!", async () => {
  await go(page, "/examenes/itn-m1-3");
  await page.getByRole("button", { name: /Comenzar examen/ }).click();
  await answerExam(page, true);
  await page.getByText("¡Aprobado!").waitFor({ timeout: 5000 });
  expect(await page.getByText("100%", { exact: true }).count(), "no muestra 100%");
  expect(await page.getByText(/15 de 15 correctas/).count(), "no muestra 15 de 15");
});

await step("Examen: mejor calificación persiste al recargar", async () => {
  await go(page, "/examenes/itn-m1-3");
  await page.getByText(/Mejor calificación/).waitFor({ timeout: 4000 });
  expect((await page.getByText(/Mejor calificación/).innerText()).includes("100%"), "mejor calificación ≠ 100%");
});

await step("Examen todo incorrecto → 0 % y 'Aún no apruebas'", async () => {
  await page.getByRole("button", { name: /Comenzar examen|Empezar uno nuevo/ }).click();
  await answerExam(page, false);
  await page.getByText("Aún no apruebas").waitFor({ timeout: 5000 });
  expect(await page.getByText("0%", { exact: true }).count(), "no muestra 0%");
});

await step("Examen: reanudar un intento sin terminar conserva las respuestas", async () => {
  await go(page, "/examenes/itn-m4-7");
  await page.getByRole("button", { name: /Comenzar examen/ }).click();
  for (let i = 0; i < 2; i++) {
    await page.getByRole("radio").first().or(page.getByRole("checkbox").first()).first().click();
    await page.getByRole("button", { name: /^Siguiente/ }).click();
  }
  await go(page, "/examenes/itn-m4-7");
  await page.getByRole("button", { name: "Continuar intento" }).click();
  await page.getByText(/^\d+\/20$/).waitFor();
  const counter = await page.getByText(/^\d+\/20$/).innerText();
  expect(counter === "2/20", `contador al reanudar = ${counter}`);
});

await step("Examen final: 40 preguntas sin repetir", async () => {
  await go(page, "/examenes/itn-final");
  await page.getByRole("button", { name: /Comenzar examen/ }).click();
  const seen = new Set<string>();
  for (let i = 0; i < 40; i++) {
    seen.add((await page.locator("h2").allInnerTexts()).find((t) => QUESTIONS.some((x) => x.prompt === t.trim())) ?? "?");
    if (i < 39) await page.getByRole("button", { name: "Pregunta siguiente" }).or(page.getByRole("button", { name: /^Siguiente/ })).first().click();
  }
  expect(seen.size === 40, `preguntas distintas = ${seen.size}`);
});

await step("Sin conexión: el progreso se guarda local y se sube al volver la red", async () => {
  await go(page, "/aprender/modulo-2/leccion-2-1");
  syncDown = true;
  await ctx.setOffline(true);
  try {
    await page.getByText(/Sin conexión/).first().waitFor({ timeout: 4000 });
    await page.getByRole("button", { name: /Marcar como estudiada y continuar/ }).click();
    await page.waitForURL(/leccion-2-2/);
    await page.getByText(/Sin conexión · \d/).first().waitFor({ timeout: 4000 });
  } finally {
    syncDown = false;
    await ctx.setOffline(false);
  }
  const before = syncOps;
  await page.getByText("Guardado", { exact: true }).first().waitFor({ timeout: 15000 });
  expect(syncOps > before, "no se envió nada al volver la red");
});

await step("Reto del módulo 5: bloqueado hasta estudiar sus lecciones; luego se puede jugar", async () => {
  await go(page, "/aprender/modulo-5/reto");
  await page.getByText("Reto bloqueado").waitFor({ timeout: 4000 });
  for (const [id] of syllabus[4].lessons) {
    await go(page, `/aprender/modulo-5/${lessonSlug(id)}`);
    await page.getByRole("button", { name: /Marcar como estudiada/ }).click();
    await page.waitForTimeout(300);
  }
  await go(page, "/aprender/modulo-5/reto");
  await page.getByRole("button", { name: "Jugar" }).click();
  await page.waitForTimeout(500);
});

/* ── Juegos: clics aleatorios + reloj adelantado, hasta llegar a resultados ── */
const unfinished: string[] = [];
for (const slug of [...GAME_SLUGS, "../aprender/modulo-5/reto"]) {
  const name = slug.startsWith("..") ? "reto-modulo-5" : slug;
  await step(`Juego ${name}: se juega de principio a fin sin errores`, async () => {
    const gp = await ctx.newPage();
    watch(gp);
    await gp.clock.install();
    await gp.goto(`${BASE}/juegos/${slug}`, { waitUntil: "networkidle" });
    await gp.getByRole("button", { name: "Jugar" }).click();
    let finished = false;
    for (let i = 0; i < 400 && !finished; i++) {
      if (await gp.getByRole("button", { name: /Jugar otra vez/ }).count()) { finished = true; break; }
      const main = gp.locator("main");
      const inputs = main.locator("input:visible:not([disabled])");
      if (await inputs.count() && Math.random() < 0.3) {
        await inputs.first().fill(["enable", "configure terminal", "hostname S1", "show running-config", "exit", "192.168.1.1", "2001:db8::1", "?"][i % 8]).catch(() => {});
        await inputs.first().press("Enter").catch(() => {});
      }
      const btns = main.locator("button:visible:not([disabled])").filter({ hasNotText: /^(Salir|Sí, salir)$/ });
      const n = await btns.count();
      if (n) await btns.nth(Math.floor(Math.random() * n)).click({ timeout: 1500 }).catch(() => {});
      if (i % 15 === 14) await gp.clock.runFor(30_000);
      else await gp.clock.runFor(800);
    }
    if (!finished) unfinished.push(name);
    else await gp.waitForTimeout(400);
    await gp.close();
  });
}

await step("Progreso: los juegos jugados se reflejan en la lista de juegos", async () => {
  await go(page, "/juegos");
  await page.waitForTimeout(500);
});

await step("Enfoque y recordatorios cargan e interactúan", async () => {
  await go(page, "/enfoque");
  const startBtn = page.getByRole("button", { name: /Empezar|Comenzar|Iniciar/ }).first();
  if (await startBtn.count()) { await startBtn.click(); await page.waitForTimeout(800); }
  await go(page, "/recordatorios");
  await page.waitForTimeout(500);
});

/* ── Con datos reales en IndexedDB, recorrer de nuevo buscando desajustes de hidratación ── */
await step("Hidratación con progreso guardado (3 pasadas por páginas con datos)", async () => {
  const paths = ["/", "/aprender", "/aprender/modulo-1", "/aprender/modulo-5", "/aprender/modulo-1/leccion-1-1", "/examenes", "/examenes/itn-m1-3", "/juegos", "/juegos/torre-osi", "/enfoque", "/recordatorios", "/aprender/modulo-5/reto"];
  for (let pass = 0; pass < 3; pass++) for (const p of paths) { await go(page, p); await page.waitForTimeout(100); }
});

await browser.close();
for (const r of results) console.log(`${r.ok ? "✔" : "✖"} ${r.name}${r.detail ? `\n    ${r.detail}` : ""}`);
if (unfinished.length) console.log(`ℹ Juegos que no llegaron a resultados con clics aleatorios: ${unfinished.join(", ")}`);
console.log(`ℹ Operaciones de sincronización enviadas: ${syncOps}; inválidas: ${syncErrors.length}`);
for (const e of syncErrors) console.log(`✖ sync inválido: ${e}`);
const failed = results.filter((r) => !r.ok).length + syncErrors.length;
console.log(failed ? `${failed} FALLAS` : "TODO CORRECTO");
process.exit(failed ? 1 : 0);
