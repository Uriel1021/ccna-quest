/**
 * Prueba dinámica 4: cuentas y PWA de punta a punta, con dos "dispositivos" (contextos de Chrome).
 * Requiere el servidor con BD local:  PGLITE_DIR=.pglite-e2e DATABASE_URL= npx next start -p 3100
 * (ver tests/e2e/pglite-setup.mts). NO usar contra la BD real.
 */
import { chromium, devices, type Page, type BrowserContext } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3100";
const EMAIL = `alumna${Date.now()}@ejemplo.com`;
const PASS = "contraseña-de-prueba";
const results: { name: string; ok: boolean; detail?: string }[] = [];
const errors: string[] = [];

async function step(name: string, fn: () => Promise<void>) {
  const before = errors.length;
  try { await fn(); results.push({ name, ok: errors.length === before, detail: errors.slice(before).join(" | ") || undefined }); }
  catch (e) { results.push({ name, ok: false, detail: (e as Error).message.split("\n")[0] + (errors.length > before ? " | " + errors.slice(before).join(" | ") : "") }); }
}
const expect = (c: unknown, m: string) => { if (!c) throw new Error(m); };
function watch(p: Page, tag: string) {
  p.on("pageerror", (e) => !e.message.includes("reading 'waiting'") && errors.push(`[${tag}] ${new URL(p.url()).pathname}: ${e.message.slice(0, 160)}`));
  p.on("console", (m) => { if (m.type() === "error" && !/status of 40[019]|Unauthorized/.test(m.text())) errors.push(`[${tag}] console: ${m.text().slice(0, 160)}`); });
}
const go = (p: Page, path: string) => p.goto(BASE + path, { waitUntil: "networkidle" });
const xp = (p: Page) => p.locator("header").getByText(/\d+ XP/).first().innerText();
/** Fuerza la descarga de la nube en el próximo ciclo (sin esperar los 2 minutos). */
const resetPull = (p: Page) => p.evaluate(() => new Promise<void>((ok) => {
  const r = indexedDB.open("ccna-quest");
  r.onsuccess = () => { const tx = r.result.transaction("meta", "readwrite"); tx.objectStore("meta").delete("lastPullAt"); tx.oncomplete = () => { r.result.close(); ok(); }; };
}));
async function studyLesson(p: Page, mod: number, id: string) {
  await go(p, `/aprender/modulo-${mod}/leccion-${id.replace(".", "-")}`);
  await p.getByRole("button", { name: /Marcar como estudiada/ }).click();
  await p.waitForTimeout(400);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const mk = async (tag: string, opts = {}): Promise<[BrowserContext, Page]> => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block", locale: "es-MX", ...opts });
  const p = await ctx.newPage(); watch(p, tag); return [ctx, p];
};
const [, A] = await mk("celular");
const [, B] = await mk("compu", { viewport: { width: 1280, height: 860 }, isMobile: false, hasTouch: false });
let code = "";

await step("Celular: estudia sin cuenta (10 XP)", async () => {
  await studyLesson(A, 1, "1.1");
  expect((await xp(A)) === "10 XP", `XP = ${await xp(A)}`);
});

await step("Crear cuenta: validaciones en pantalla", async () => {
  await go(A, "/cuenta");
  await A.getByRole("tab", { name: "Crear cuenta" }).click();
  await A.getByLabel("Tu nombre").fill("Ana");
  await A.getByLabel("Correo").fill(EMAIL);
  await A.getByLabel("Contraseña", { exact: true }).fill("corta");
  await A.getByLabel("Repite la contraseña").fill("corta");
  await A.getByRole("button", { name: "Crear mi cuenta" }).click();
  await A.getByRole("alert").filter({ hasText: /al menos 8/ }).waitFor({ timeout: 5000 });
  await A.getByLabel("Contraseña", { exact: true }).fill(PASS);
  await A.getByLabel("Repite la contraseña").fill(PASS + "x");
  await A.getByRole("button", { name: "Crear mi cuenta" }).click();
  await A.getByRole("alert").filter({ hasText: /no coinciden/ }).waitFor({ timeout: 5000 });
});

await step("Crear cuenta: muestra el código de recuperación y exige confirmarlo", async () => {
  await A.getByLabel("Repite la contraseña").fill(PASS);
  await A.getByRole("button", { name: "Crear mi cuenta" }).click();
  await A.getByText("Guarda tu código de recuperación").waitFor({ timeout: 10000 });
  code = (await A.locator("p.font-mono").innerText()).trim();
  expect(/^[2-9A-Z]{4}(-[2-9A-Z]{4}){3}$/.test(code), `código raro: ${code}`);
  expect(await A.getByRole("button", { name: "Continuar" }).isDisabled(), "Continuar debería estar deshabilitado");
  await A.getByText("Ya guardé mi código").click();
  await A.getByRole("button", { name: "Continuar" }).click();
  await A.getByText(EMAIL).waitFor();
  await A.getByText("Todo tu progreso está en la nube").waitFor({ timeout: 15000 });
  expect(await A.getByRole("link", { name: /Tu cuenta: Ana/ }).count(), "el encabezado no muestra la cuenta");
});

await step("Login con contraseña mala → mensaje claro", async () => {
  await go(B, "/cuenta");
  await B.getByLabel("Correo").fill(EMAIL);
  await B.getByLabel("Contraseña", { exact: true }).fill("mala-mala");
  await B.getByRole("button", { name: "Iniciar sesión" }).last().click();
  await B.getByRole("alert").filter({ hasText: "Correo o contraseña incorrectos" }).waitFor({ timeout: 8000 });
});

await step("Computadora: al iniciar sesión descarga el progreso del celular", async () => {
  await B.getByLabel("Contraseña", { exact: true }).fill(PASS);
  await B.getByRole("button", { name: "Iniciar sesión" }).last().click();
  await B.getByText(EMAIL).waitFor({ timeout: 10000 });
  await go(B, "/aprender/modulo-1/leccion-1-1");
  await B.getByRole("button", { name: /Siguiente lección/ }).waitFor({ timeout: 8000 });
  await go(B, "/");
  await B.getByText("10 XP").first().waitFor({ timeout: 5000 });
});

await step("Lo hecho en la computadora aparece en el celular", async () => {
  await studyLesson(B, 2, "2.1");
  await go(B, "/cuenta");
  await B.getByText("Todo tu progreso está en la nube").waitFor({ timeout: 15000 });
  await resetPull(A);
  await go(A, "/cuenta");
  await A.getByRole("button", { name: "Sincronizar ahora" }).click();
  await A.waitForTimeout(2500);
  await go(A, "/aprender/modulo-2/leccion-2-1");
  await A.getByRole("button", { name: /Siguiente lección/ }).waitFor({ timeout: 8000 });
  expect((await xp(A)) === "20 XP", `XP en celular = ${await xp(A)}`);
});

await step("Cerrar sesión borra el progreso del dispositivo; volver a entrar lo recupera", async () => {
  await go(B, "/cuenta");
  await B.getByRole("button", { name: /Cerrar sesión/ }).click();
  await B.getByRole("tab", { name: "Iniciar sesión" }).waitFor({ timeout: 8000 });
  await go(B, "/");
  await B.getByText("Nivel 1").first().waitFor();
  expect(await B.getByText("0 XP · faltan 250").count(), "el progreso no se borró");
  await go(B, "/cuenta");
  await B.getByLabel("Correo").fill(EMAIL);
  await B.getByLabel("Contraseña", { exact: true }).fill(PASS);
  await B.getByRole("button", { name: "Iniciar sesión" }).last().click();
  await B.getByText(EMAIL).waitFor({ timeout: 10000 });
  await go(B, "/");
  await B.getByText("20 XP").first().waitFor({ timeout: 5000 });
});

await step("Recuperar cuenta con el código: nueva contraseña y nuevo código", async () => {
  const [ctxC, C] = await mk("otro");
  await go(C, "/cuenta");
  await C.getByRole("button", { name: "¿Olvidaste tu contraseña?" }).click();
  await C.getByLabel("Correo").fill(EMAIL);
  await C.getByLabel("Código de recuperación").fill("AAAA-BBBB-CCCC-DDDD");
  await C.getByLabel("Contraseña nueva").fill("contraseña-nueva-1");
  await C.getByLabel("Repite la contraseña").fill("contraseña-nueva-1");
  await C.getByRole("button", { name: "Cambiar contraseña y entrar" }).click();
  await C.getByRole("alert").filter({ hasText: /no coinciden/ }).waitFor({ timeout: 8000 });
  await C.getByLabel("Código de recuperación").fill(code.toLowerCase());
  await C.getByRole("button", { name: "Cambiar contraseña y entrar" }).click();
  await C.getByText("Guarda tu código de recuperación").waitFor({ timeout: 10000 });
  const code2 = (await C.locator("p.font-mono").innerText()).trim();
  expect(code2 !== code, "el código no cambió");
  await C.getByText("Ya guardé mi código").click();
  await C.getByRole("button", { name: "Continuar" }).click();
  await go(C, "/");
  await C.waitForTimeout(500);
  expect((await xp(C)) === "20 XP", `XP tras recuperar = ${await xp(C)}`);
  await ctxC.close();
});

await step("Sesión cerrada por la recuperación: el celular avisa 'Vuelve a entrar' y conserva lo pendiente", async () => {
  await studyLesson(A, 3, "3.1");
  await go(A, "/");
  await A.getByRole("button", { name: /sesión expiró/ }).waitFor({ timeout: 15000 });
  await A.getByRole("button", { name: /sesión expiró/ }).click();
  await A.waitForURL(/\/cuenta/);
  await A.getByText("Tu sesión expiró").first().waitFor();
  await A.getByLabel("Contraseña", { exact: true }).fill("contraseña-nueva-1");
  await A.getByRole("button", { name: "Iniciar sesión" }).last().click();
  await A.getByText("Todo tu progreso está en la nube").waitFor({ timeout: 15000 });
  expect((await xp(A)) === "30 XP", `XP = ${await xp(A)}`);
});

/* ── PWA ── */
/** Simula el aviso de instalación de Chrome (en modo headless no se dispara solo). Texto plano: sin helpers de tsx. */
const FAKE_PROMPT = (outcome: string) => `window.__prompted=false;addEventListener("load",function(){setTimeout(function(){
  var e=new Event("beforeinstallprompt",{cancelable:true});e.prompt=function(){window.__prompted=true;return Promise.resolve()};
  e.userChoice=Promise.resolve({outcome:"${outcome}"});dispatchEvent(e)},300)});`;
await step("PWA: con aviso del navegador aparece 'Instala CCNA Quest' y el botón lo abre", async () => {
  const [ctx, P] = await mk("pwa");
  await P.addInitScript(FAKE_PROMPT("accepted"));
  await go(P, "/");
  await P.getByText("Instala CCNA Quest").waitFor({ timeout: 5000 });
  await P.getByRole("button", { name: "Instalar", exact: true }).click();
  await P.waitForTimeout(300);
  expect(await P.evaluate("window.__prompted"), "no se llamó a prompt()");
  expect(!(await P.getByText("Instala CCNA Quest").count()), "la tarjeta no se ocultó");
  await ctx.close();
});

await step("PWA: 'Ahora no' oculta la tarjeta y se recuerda", async () => {
  const [ctx, P] = await mk("pwa2");
  await P.addInitScript(FAKE_PROMPT("dismissed"));
  await go(P, "/");
  await P.getByRole("button", { name: "Ahora no" }).last().click();
  await go(P, "/");
  await P.waitForTimeout(800);
  expect(!(await P.getByText("Instala CCNA Quest").count()), "reapareció tras 'Ahora no'");
  await ctx.close();
});

await step("PWA en iPhone: instrucciones de Safari", async () => {
  const [ctx, P] = await mk("iphone", { ...devices["iPhone 13"], serviceWorkers: "block" });
  await go(P, "/instalar");
  await P.getByText("Agregar a pantalla de inicio").first().waitFor({ timeout: 5000 });
  await go(P, "/");
  await P.getByRole("link", { name: "Ver cómo" }).waitFor({ timeout: 5000 });
  await ctx.close();
});

await step("Manifiesto instalable: nombre, íconos 192/512, maskable, standalone", async () => {
  const m = await (await fetch(`${BASE}/manifest.webmanifest`)).json();
  expect(m.display === "standalone" && m.start_url === "/" && m.name, "campos básicos");
  const sizes = m.icons.map((i: { sizes: string }) => i.sizes);
  expect(sizes.includes("192x192") && sizes.includes("512x512") && m.icons.some((i: { purpose: string }) => i.purpose === "maskable"), "íconos");
  for (const i of m.icons) expect((await fetch(BASE + i.src)).ok, `ícono ${i.src}`);
});

await browser.close();
for (const r of results) console.log(`${r.ok ? "✔" : "✖"} ${r.name}${r.detail ? `\n    ${r.detail}` : ""}`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `${failed} FALLAS` : "TODO CORRECTO");
process.exit(failed ? 1 : 0);
