/**
 * Prueba dinámica 5: comentarios de punta a punta (alumna + autor).
 * Servidor con BD local y autor configurado:
 *   PGLITE_DIR=.pglite-e2e DATABASE_URL= ADMIN_EMAILS=autor-e2e@ejemplo.com npx next start -p 3100
 */
import { chromium, type Page } from "playwright-core";
import { signup, newEmail } from "./helpers.mts";

const BASE = process.env.BASE ?? "http://localhost:3100";
const ADMIN_EMAIL = process.env.E2E_ADMIN ?? "autor-e2e@ejemplo.com";
const results: { name: string; ok: boolean; detail?: string }[] = [];
const errors: string[] = [];
async function step(name: string, fn: () => Promise<void>) {
  const before = errors.length;
  try { await fn(); results.push({ name, ok: errors.length === before, detail: errors.slice(before).join(" | ") || undefined }); }
  catch (e) { results.push({ name, ok: false, detail: (e as Error).message.split("\n")[0] + (errors.length > before ? " | " + errors.slice(before).join(" | ") : "") }); }
}
const expect = (c: unknown, m: string) => { if (!c) throw new Error(m); };
const watch = (p: Page, tag: string) => {
  p.on("pageerror", (e) => !e.message.includes("reading 'waiting'") && errors.push(`[${tag}] ${e.message.slice(0, 160)}`));
  p.on("console", (m) => { if (m.type() === "error" && !/status of 40[0139]|ERR_INTERNET_DISCONNECTED|Failed to fetch RSC|net::ERR_FAILED/.test(m.text())) errors.push(`[${tag}] console: ${m.text().slice(0, 160)}`); });
};
const go = (p: Page, path: string) => p.goto(BASE + path, { waitUntil: "networkidle" });
const resetPull = (p: Page) => p.evaluate(() => new Promise<void>((ok) => {
  const r = indexedDB.open("ccna-quest");
  r.onsuccess = () => { const tx = r.result.transaction("meta", "readwrite"); tx.objectStore("meta").delete("lastPullAt"); tx.oncomplete = () => { r.result.close(); ok(); }; };
}));
const MSG = "En la lección 11.5 dice que un /26 tiene 64 hosts utilizables, pero deberían ser 62.";
const REPLY = "¡Gracias por avisar! Ya lo corregí para la próxima versión.";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const mk = async (tag: string, mobile = true) => {
  const ctx = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block", locale: "es-MX" }
    : { viewport: { width: 1280, height: 860 }, serviceWorkers: "block", locale: "es-MX" });
  const p = await ctx.newPage(); watch(p, tag); return [ctx, p] as const;
};
const [ctxA, A] = await mk("alumna");
const [, B] = await mk("autor", false);

await step("Desde una lección: '¿Viste un error?' abre el formulario con la lección y 'Contenido incorrecto'", async () => {
  await signup(A, BASE, { name: "Ana", email: newEmail("ana") });
  await go(A, "/aprender/modulo-11/leccion-11-5");
  await A.getByRole("link", { name: /Viste un error en esta lección/ }).click();
  await A.waitForURL(/\/comentarios\?/);
  await A.getByRole("radio", { name: "Contenido incorrecto", checked: true }).waitFor({ timeout: 5000 });
  await A.getByText("/aprender/modulo-11/leccion-11-5").first().waitFor();
});

await step("Validación: mensaje demasiado corto", async () => {
  await A.getByLabel("Tu comentario").fill("mal");
  await A.getByRole("button", { name: "Enviar comentario" }).click();
  await A.getByRole("alert").filter({ hasText: /al menos 5/ }).waitFor({ timeout: 4000 });
});

await step("Enviar: aparece en 'Mis comentarios' como Recibido", async () => {
  await A.getByLabel("Tu comentario").fill(MSG);
  await A.getByRole("button", { name: "Enviar comentario" }).click();
  await A.getByText(/Gracias! Tu comentario llegó/).waitFor({ timeout: 5000 });
  const item = A.locator("li", { hasText: MSG });
  await item.getByText("Recibido").waitFor({ timeout: 15000 });
});

await step("Sin conexión: queda 'Por enviar' y se envía al volver la red", async () => {
  await ctxA.setOffline(true);
  try {
    await A.getByRole("radio", { name: "Sugerencia" }).click();
    await A.getByLabel("Tu comentario").fill("Me gustaría un juego de VLANs para practicar.");
    await A.getByRole("button", { name: "Enviar comentario" }).click();
    await A.getByText(/se enviará solo cuando vuelvas/).waitFor({ timeout: 5000 });
    await A.locator("li", { hasText: "juego de VLANs" }).getByText("Por enviar").waitFor({ timeout: 5000 });
  } finally { await ctxA.setOffline(false); }
  await A.locator("li", { hasText: "juego de VLANs" }).getByText("Recibido").waitFor({ timeout: 20000 });
});

await step("Un alumno no puede abrir la bandeja del autor", async () => {
  await go(A, "/admin/comentarios");
  await A.getByRole("alert").filter({ hasText: "solo para el autor" }).waitFor({ timeout: 8000 });
  await go(A, "/cuenta");
  expect(!(await A.getByText("Bandeja de comentarios").count()), "el alumno ve el acceso a la bandeja");
});

await step("Autor: ve el acceso en 'Tu cuenta' y el comentario con alumna, pantalla y versión", async () => {
  await signup(B, BASE, { name: "Autor", email: ADMIN_EMAIL });
  await go(B, "/cuenta");
  await B.getByRole("link", { name: /Bandeja de comentarios/ }).click();
  await B.waitForURL(/\/admin\/comentarios/);
  const card = B.locator("li", { hasText: MSG });
  await card.waitFor({ timeout: 8000 });
  await card.getByText("Ana").first().waitFor();
  await card.getByText("/aprender/modulo-11/leccion-11-5").waitFor();
  expect(await card.getByText(/web · v\d/).count(), "falta plataforma/versión");
});

await step("Autor responde y marca Resuelto; desaparece de 'Nuevos' y aparece en 'Resueltos'", async () => {
  const card = B.locator("li", { hasText: MSG });
  await card.getByRole("textbox").fill(REPLY);
  await card.getByRole("button", { name: "Guardar respuesta" }).click();
  await B.locator("li", { hasText: MSG }).getByRole("button", { name: /Marcar “Resuelto”/ }).click();
  await B.waitForTimeout(1200);
  expect(!(await B.locator("li", { hasText: MSG }).count()), "sigue en Nuevos");
  await B.getByRole("tab", { name: "Resueltos" }).click();
  await B.locator("li", { hasText: MSG }).getByText(REPLY).first().waitFor({ state: "attached", timeout: 8000 }).catch(async () => {
    expect((await B.locator("li", { hasText: MSG }).getByRole("textbox").inputValue()) === REPLY, "la respuesta no se guardó");
  });
});

await step("La alumna ve 'Resuelto' y la respuesta del autor", async () => {
  await resetPull(A);
  await go(A, "/cuenta");
  await A.getByRole("button", { name: "Sincronizar ahora" }).click();
  await A.waitForTimeout(2500);
  await go(A, "/comentarios");
  const item = A.locator("li", { hasText: MSG });
  await item.getByText("Resuelto").waitFor({ timeout: 8000 });
  await item.getByText("Respuesta del autor").waitFor();
  await item.getByText(REPLY).waitFor();
});

await step("Acceso a comentarios desde Inicio y desde la Ayuda", async () => {
  await go(A, "/");
  await A.getByRole("link", { name: /Comentarios/ }).first().waitFor();
  await A.getByRole("button", { name: /Abrir ayuda/ }).click();
  await A.getByRole("link", { name: /Enviar un comentario/ }).click();
  await A.waitForURL(/\/comentarios/);
});

await browser.close();
for (const r of results) console.log(`${r.ok ? "✔" : "✖"} ${r.name}${r.detail ? `\n    ${r.detail}` : ""}`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `${failed} FALLAS` : "TODO CORRECTO");
process.exit(failed ? 1 : 0);
