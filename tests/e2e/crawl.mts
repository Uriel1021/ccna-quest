/**
 * Prueba dinámica 1: recorre TODAS las rutas en Chrome (móvil y escritorio) y reporta
 *  - respuestas HTTP ≠ 200, errores de JS, errores de consola, imágenes rotas,
 *  - desbordamiento horizontal (scroll lateral), páginas sin <h1>,
 *  - operaciones de sincronización que el servidor rechazaría.
 * /api/sync se simula en el navegador: no escribe nada en la BD real.
 * Uso: BASE=http://localhost:3100 npx tsx tests/e2e/crawl.mts
 */
import { chromium, type Page } from "playwright-core";
import { syllabus } from "../../src/content/syllabus";
import { lessonSlug } from "../../src/content/lessons";
import { EXAMS } from "../../src/content/exams";
import { GAME_SLUGS } from "../../src/content/game-slugs";
import { SyncRequest } from "../../src/lib/sync-protocol";

const BASE = process.env.BASE ?? "http://localhost:3100";
const routes = [
  "/", "/aprender", "/examenes", "/juegos", "/enfoque", "/recordatorios", "/cuenta", "/instalar", "/~offline",
  ...syllabus.flatMap((m) => [`/aprender/modulo-${m.id}`, `/aprender/modulo-${m.id}/reto`, ...m.lessons.map(([id]) => `/aprender/modulo-${m.id}/${lessonSlug(id)}`)]),
  ...EXAMS.map((e) => `/examenes/${e.id}`),
  ...GAME_SLUGS.map((s) => `/juegos/${s}`),
];

const problems: string[] = [];
export const syncProblems: string[] = [];

export async function mockSync(page: Page) {
  await page.route("**/api/sync", async (route) => {
    const body = route.request().postDataJSON();
    const parsed = SyncRequest.safeParse(body);
    if (!parsed.success) syncProblems.push(`sync inválido: ${JSON.stringify(parsed.error.issues.slice(0, 2))} ← ${JSON.stringify(body).slice(0, 300)}`);
    const seqs = (body?.ops ?? []).map((o: { seq: number }) => o.seq);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ applied: seqs, rejected: [] }) });
  });
}

async function check(page: Page, path: string, tag: string) {
  const errs: string[] = [];
  const onConsole = (m: import("playwright-core").ConsoleMessage) => { if (m.type() === "error") errs.push(`console: ${m.text().slice(0, 200)}`); };
  // Falso positivo de Playwright: con serviceWorkers:"block", register() devuelve undefined (en un navegador real nunca).
  const onPageErr = (e: Error) => { if (!e.message.includes("reading 'waiting'")) errs.push(`pageerror: ${e.message.slice(0, 200)}`); };
  page.on("console", onConsole); page.on("pageerror", onPageErr);
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  if (!res || res.status() !== 200) errs.push(`HTTP ${res?.status()}`);
  await page.waitForTimeout(150);
  const info = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    wide: [...document.querySelectorAll("body *")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > window.innerWidth + 1 && getComputedStyle(el).position !== "fixed"; })
      .slice(0, 3).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`),
    h1: document.querySelectorAll("h1").length,
    brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
    title: document.title,
  }));
  if (info.overflow > 1) errs.push(`scroll horizontal de ${info.overflow}px (${info.wide.join(", ")})`);
  if (info.h1 !== 1 && path !== "/~offline") errs.push(`${info.h1} <h1>`);
  if (info.brokenImgs.length) errs.push(`imágenes rotas: ${info.brokenImgs.join(", ")}`);
  if (!info.title) errs.push("sin <title>");
  page.off("console", onConsole); page.off("pageerror", onPageErr);
  for (const e of errs) problems.push(`[${tag}] ${path} → ${e}`);
}

const isMain = import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (isMain) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  for (const [tag, opts] of [
    ["móvil", { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
    ["escritorio", { viewport: { width: 1280, height: 860 } }],
  ] as const) {
    const ctx = await browser.newContext({ ...opts, serviceWorkers: process.env.SW === "allow" ? "allow" : "block", locale: "es-MX" });
    const page = await ctx.newPage();
    await mockSync(page);
    for (const r of routes) await check(page, r, tag);
    // 404
    const nf = await page.goto(BASE + "/no-existe-esta-ruta");
    if (nf?.status() !== 404) problems.push(`[${tag}] /no-existe → HTTP ${nf?.status()} (se esperaba 404)`);
    await ctx.close();
  }
  await browser.close();
  console.log(`Rutas revisadas: ${routes.length} × 2 vistas`);
  console.log([...problems, ...syncProblems].join("\n") || "SIN PROBLEMAS");
  process.exit(problems.length + syncProblems.length ? 1 : 0);
}
