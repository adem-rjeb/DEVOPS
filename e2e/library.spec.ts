import { expect, test } from "@playwright/test";

test("inscription, connexion, emprunt et retour", async ({ page }) => {
  const suffix = Date.now();
  const email = `e2e-${suffix}@example.com`;
  const password = "Motdepasse1!";

  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Nom").fill("Membre E2E");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer le compte" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("button", { name: "Déconnexion" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const duneCard = page.locator("article").filter({ hasText: "Dune" }).first();
  await expect(duneCard).toBeVisible();
  await duneCard.getByRole("button", { name: "Emprunter" }).click();

  const duneRow = page
    .locator("#emprunts tbody tr")
    .filter({ hasText: "Dune" });
  await expect(duneRow).toBeVisible();
  await duneRow.getByRole("button", { name: "Retourner" }).click();
  await expect(duneRow).not.toContainText("En cours");
});
