/**
 * Prueba dinámica 3: la APK real en un emulador/teléfono, conectada al WebView por DevTools.
 * Requisitos: emulador o teléfono conectado por adb, con la APK debug instalada y abierta.
 * Se recomienda modo avión: así no se envían datos de prueba al servidor real y se valida el modo offline.
 * Uso: npx tsx tests/e2e/android.mts
 */
import { _android, type Page } from "playwright-core";
import { syllabus } from "../../src/content/syllabus";
import { lessonSlug } from "../../src/content/lessons";
import { EXAMS } from "../../src/content/exams";
import { GAME_SLUGS } from "../../src/content/game-slugs";
import { QUESTIONS } from "../../src/content/questions";

const ORIGIN = "https://localhost";
const routes = [
  "/", "/aprender", "/examenes", "/juegos", "/enfoque", "/recordatorios",
  ...syllabus.flatMap((m) => [`/aprender/modulo-${m.id}`, `/aprender/modulo-${m.id}/reto`, ...m.lessons.map(([id]) => `/aprender/modulo-${m.id}/${lessonSlug(id)}`)]),
  ...EXAMS.map((e) => `/examenes/${e.id}`),
  ...GAME_SLUGS.map((s) => `/juegos/${s}`),
];

const problems: string[] = [];
const ok: string[] = [];
const [device] = await _android.devices();
if (!device) throw new Error("No hay dispositivo Android conectado (adb devices)");
const webview = await device.webView({ pkg: "app.ccnaquest.mobile" });
const page: Page = await webview.page();
let current = "";
page.on("pageerror", (e) => problems.push(`${current} → pageerror: ${e.message.slice(0, 180)}`));
page.on("console", (m) => { if (m.type() === "error") problems.push(`${current} → console: ${m.text().slice(0, 180)}`); });

page.on("response", (r) => { if (r.status() >= 400) problems.push(`${current} → HTTP ${r.status()} ${r.url()}`); });
const go = async (path: string) => {
  current = path;
  await page.goto(ORIGIN + path + (path.endsWith("/") ? "" : "/"), { waitUntil: "load", timeout: 20000 });
  await page.waitForTimeout(350);
};
const expect = (c: unknown, m: string) => { if (!c) throw new Error(m); };
async function step(name: string, fn: () => Promise<void>) {
  const before = problems.length;
  try { await fn(); if (problems.length === before) ok.push(name); else problems.push(`  ↑ durante: ${name}`); }
  catch (e) { problems.push(`${name} → ${(e as Error).message.split("\n")[0]}`); }
}

await step(`Recorrido de ${routes.length} pantallas en el WebView`, async () => {
  for (const r of routes) {
    await go(r);
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll("h1").length,
      notFound: /no encontramos|404/i.test(document.title + document.body.innerText.slice(0, 200)),
    }));
    if (info.overflow > 1) problems.push(`${r} → scroll horizontal ${info.overflow}px`);
    if (info.h1 !== 1) problems.push(`${r} → ${info.h1} <h1>`);
    if (info.notFound) problems.push(`${r} → muestra página 404`);
  }
});

await step("Sin red: indicador 'Sin conexión' visible", async () => {
  await go("/");
  await page.getByText(/Sin conexión/).first().waitFor({ timeout: 5000 });
});

await step("Lección offline: marcar estudiada avanza y queda en cola", async () => {
  await go("/aprender/modulo-3/leccion-3-1");
  const btn = page.getByRole("button", { name: /Marcar como estudiada y continuar|Siguiente lección/ });
  await btn.click();
  await page.waitForURL(/leccion-3-2/, { timeout: 8000 });
  await page.getByText(/Sin conexión · \d+/).first().waitFor({ timeout: 5000 });
});

await step("Examen offline M1–3 todo correcto → 100 %", async () => {
  await go("/examenes/itn-m1-3");
  await page.getByRole("button", { name: /Comenzar examen|Empezar uno nuevo/ }).click();
  await page.getByText(/^Pregunta 1 de/).waitFor({ timeout: 5000 });
  for (let i = 0; i < 15; i++) {
    const h2s = (await page.locator("h2").allInnerTexts()).map((t) => t.trim());
    const q = QUESTIONS.find((x) => h2s.includes(x.prompt));
    expect(q, `pregunta no encontrada: ${h2s.join(" / ")}`);
    for (const c of q!.correct) await page.getByRole(q!.correct.length > 1 ? "checkbox" : "radio", { name: q!.options[c], exact: true }).click();
    const next = page.getByRole("button", { name: /^Siguiente/ });
    if (await next.count()) await next.click();
  }
  await page.getByRole("button", { name: "Entregar", exact: true }).click();
  await page.getByRole("button", { name: "Entregar ahora" }).click();
  await page.getByText("¡Aprobado!").waitFor({ timeout: 5000 });
  expect(await page.getByText("100%", { exact: true }).count(), "no muestra 100%");
});

for (const slug of ["subnet-sprint", "binario-relampago", "memorama-protocolos", "terminal-ios"]) {
  await step(`Juego ${slug} en la APK (toques al azar 60 s)`, async () => {
    await go(`/juegos/${slug}`);
    await page.getByRole("button", { name: "Jugar" }).click();
    const end = Date.now() + 60_000;
    while (Date.now() < end) {
      if (await page.getByRole("button", { name: /Jugar otra vez/ }).count()) break;
      const btns = page.locator("main button:visible:not([disabled])").filter({ hasNotText: /^(Salir|Sí, salir)$/ });
      const n = await btns.count();
      if (n) await btns.nth(Math.floor(Math.random() * n)).click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(150);
    }
  });
}

await step("Recordatorios: la pantalla carga en la app nativa", async () => {
  await go("/recordatorios");
  await page.locator("h1").waitFor();
});

await device.close().catch(() => {});
console.log(ok.map((n) => `✔ ${n}`).join("\n"));
console.log(problems.length ? problems.map((p) => `✖ ${p}`).join("\n") : "TODO CORRECTO EN ANDROID");
process.exit(problems.length ? 1 : 0);
