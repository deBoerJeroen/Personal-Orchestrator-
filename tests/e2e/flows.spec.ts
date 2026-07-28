import { expect, test, type Page } from "@playwright/test";

/**
 * De drie kritieke flows. Meer e2e-tests dan dit willen we niet: ze zijn traag
 * en breken bij elke tekstwijziging.
 *
 * Vereist: draaiende app, database, en een geseede gebruiker via
 * E2E_EMAIL / E2E_PASSWORD.
 */

const EMAIL = process.env.E2E_EMAIL ?? "";
const PASSWORD = process.env.E2E_PASSWORD ?? "";

test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL en E2E_PASSWORD ontbreken");

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(EMAIL);
  await page.getByLabel("Wachtwoord").fill(PASSWORD);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await expect(page).toHaveURL(/\/nu/);
}

async function capture(page: Page, text: string) {
  await page.getByRole("button", { name: "Vastleggen" }).click();
  await page.getByPlaceholder("Wat komt er in je op?").fill(text);
  await page.getByRole("button", { name: "Bewaren" }).click();
  await expect(page.getByText("In inbox.")).toBeVisible();
}

test("A+B: vastleggen, verwerken tot één actie en afvinken", async ({ page }) => {
  await login(page);

  const titel = `Bel de tandarts ${Date.now()}`;
  await capture(page, titel);

  await page.getByRole("link", { name: /Inbox/ }).click();
  await expect(page.getByText(titel)).toBeVisible();

  // Clarify: uitkomst → uitvoerbaar → één actie → geen motion → niet in 2 min → privé
  await page.getByLabel("Wat wil je dat dit oplevert?").fill("Afspraak staat in de agenda");
  await page.getByRole("button", { name: "Verder" }).click();
  await page.getByRole("button", { name: "Ja", exact: true }).click();
  await page.getByRole("button", { name: "Nee, één actie" }).click();
  await page.getByLabel("Wat is de eerstvolgende fysieke actie?").fill(titel);
  await page.getByRole("button", { name: "Verder" }).click();
  await page.getByRole("button", { name: "Nee", exact: true }).click();
  await page.getByRole("button", { name: "Privé" }).click();

  await expect(page.getByText("Inbox leeg.")).toBeVisible();

  // De actie staat nu op Nu en is met één tap af te vinken.
  await page.getByRole("link", { name: "Nu" }).click();
  await expect(page.getByRole("heading", { name: titel })).toBeVisible();
  await page.getByRole("button", { name: "Klaar" }).first().click();
  await expect(page.getByRole("heading", { name: titel })).toBeHidden();
});

test("C: een vage taak wordt een project met een concrete eerstvolgende actie", async ({ page }) => {
  await login(page);

  await capture(page, "Presentatie voorbereiden");

  await page.getByRole("link", { name: /Inbox/ }).click();
  await page.getByLabel("Wat wil je dat dit oplevert?").fill("Teampresentatie klaar en gedeeld");
  await page.getByRole("button", { name: "Verder" }).click();
  await page.getByRole("button", { name: "Ja", exact: true }).click();

  // De app herkent dat dit meer dan één stap is en zegt dat als suggestie.
  await expect(page.getByText(/meer dan één stap/i)).toBeVisible();
  await page.getByRole("button", { name: "Ja", exact: true }).click();

  await page
    .getByLabel("Wat is de eerstvolgende fysieke actie?")
    .fill("Open de presentatie en schrijf de drie kernboodschappen");
  await page.getByRole("button", { name: "Verder" }).click();
  await page.getByRole("button", { name: "Nee", exact: true }).click();
  await page.getByRole("button", { name: "Werk" }).click();

  await page.getByRole("link", { name: "Overzicht" }).click();
  await expect(page.getByText("Teampresentatie klaar en gedeeld")).toBeVisible();
  await expect(page.getByText("Open de presentatie en schrijf de drie kernboodschappen")).toBeVisible();
});

test("de ochtendcheck-in is in drie taps klaar en de avondcheck-in mag leeg blijven", async ({ page }) => {
  await login(page);

  await page.goto("/checkin/ochtend");
  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.getByRole("button", { name: "Allebei" }).click();
  await page.getByRole("button", { name: "Klaar" }).click();
  await expect(page).toHaveURL(/\/nu/);

  // Avond: helemaal overslaan mag, zonder enig gevolg.
  await page.goto("/checkin/avond");
  await page.getByRole("button", { name: "Overslaan" }).click();
  await expect(page).toHaveURL(/\/nu/);
});

test("motion wordt herkend en vraagt waar het toe leidt", async ({ page }) => {
  await login(page);

  await capture(page, "Uitzoeken hoe ouderschapsverlof werkt");

  await page.getByRole("link", { name: /Inbox/ }).click();
  await page.getByLabel("Wat wil je dat dit oplevert?").fill("Verlof aangevraagd");
  await page.getByRole("button", { name: "Verder" }).click();
  await page.getByRole("button", { name: "Ja", exact: true }).click();
  await page.getByRole("button", { name: "Nee, één actie" }).click();
  await page
    .getByLabel("Wat is de eerstvolgende fysieke actie?")
    .fill("Uitzoeken wat het personeelshandboek zegt");
  await page.getByRole("button", { name: "Verder" }).click();

  await expect(page.getByText("Dit lijkt voorbereiding. Klopt dat?")).toBeVisible();
  await expect(page.getByText(/suggestie/i)).toBeVisible();
});
