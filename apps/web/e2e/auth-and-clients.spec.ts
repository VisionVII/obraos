import { expect, test } from "@playwright/test";

/**
 * Esqueleto E2E da Fase 0 (item 0.11 do plano): registo → login → criar cliente.
 * Cobre o caminho crítico de ponta a ponta contra api + web + Postgres + Redis reais.
 */
test("registo → login → criar cliente", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "password12345";

  await page.goto("/register");
  await page.fill("#name", "E2E Tester");
  await page.fill("#organizationName", "E2E Org");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button:has-text("Criar conta")');
  await page.waitForURL("**/app");

  await page.click('button:has-text("Sair")');
  await page.waitForURL("**/login");

  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button:has-text("Entrar")');
  await page.waitForURL("**/app");

  await page.click('a:has-text("Clientes")');
  await page.waitForURL("**/app/clientes");
  await expect(page.getByText("Ainda não tem clientes")).toBeVisible();

  await page.click('a:has-text("+ Novo cliente")');
  await page.waitForURL("**/app/clientes/novo");
  await page.fill("#name", "Cliente E2E");
  await page.click('button:has-text("Guardar")');
  await page.waitForURL("**/app/clientes");

  await expect(page.getByText("Cliente E2E")).toBeVisible();
});
