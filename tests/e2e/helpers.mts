/** Utilidades compartidas por las pruebas e2e. */
import type { Page } from "playwright-core";

let n = 0;
export const newEmail = (tag = "alumno") => `${tag}${Date.now()}${n++}@ejemplo.com`;
export const PASSWORD = "contraseña-de-prueba";

/**
 * Crea una cuenta desde la pantalla de bienvenida (la app exige cuenta) y entra.
 * Requiere el servidor con BD local (PGLITE_DIR) o una API que acepte registros.
 */
export async function signup(page: Page, base: string, opts: { email?: string; name?: string; path?: string } = {}) {
  const email = opts.email ?? newEmail();
  await page.goto(base + (opts.path ?? "/"), { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Bienvenido a CCNA Quest" }).waitFor({ timeout: 15000 });
  await page.getByLabel("Tu nombre").fill(opts.name ?? "Alumno de prueba");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Repite la contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await page.getByText("Guarda tu código de recuperación").waitFor({ timeout: 20000 });
  const code = (await page.locator("p.font-mono").innerText()).trim();
  await page.getByText("Ya guardé mi código").click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("navigation", { name: "Principal" }).first().waitFor({ state: "attached", timeout: 15000 });
  return { email, code };
}
