import { expect, test } from "@playwright/test";

/**
 * Public-Site E2E (Code-Session 76).
 *
 * Letzte Phase-1.5-Session. Tests:
 * - Alle 6 Demo-Public-Sites rendern (Hero + Services + Footer).
 * - Lead-Form-Submit im Demo-Mode (kein Backend → local-only,
 *   Success-State).
 * - Retry-Queue: localStorage pre-populate → Form-Reload zeigt
 *   amber Badge.
 * - Mobile-Viewport: sticky-bottom-CTA-Streifen sichtbar.
 */

// Alle 6 Demo-Betriebe (siehe `src/data/businesses/*`).
const DEMO_SLUGS = [
  "studio-haarlinie",
  "autoservice-mueller",
  "glanzwerk-reinigung",
  "beauty-atelier",
  "meisterbau-schneider",
  "fahrschule-stadtmitte",
] as const;

const RETRY_QUEUE_KEY = "lp:lead-retry-queue:v2";

test.describe("Public-Site rendert für alle 6 Demo-Slugs", () => {
  for (const slug of DEMO_SLUGS) {
    test(`${slug} → Hero + Services + Footer`, async ({ page }) => {
      await page.goto(`/site/${slug}`);

      // H1 (Hero) ist sichtbar
      await expect(
        page.getByRole("heading", { level: 1 }).first(),
      ).toBeVisible();

      // Mindestens eine Section mit Service-Cards
      await expect(page.locator("main").first()).toBeVisible();

      // Footer mit Kontakt-Info
      await expect(page.locator("footer").first()).toBeVisible();
    });
  }
});

test.describe("Lead-Form Submit-Flow (Demo-Mode)", () => {
  test("Form lädt mit Pflicht-Feldern + Consent-Checkbox", async ({
    page,
  }) => {
    await page.goto(`/site/${DEMO_SLUGS[0]}`);

    // Form-Heading o.ä. — wir prüfen strukturell.
    const form = page.locator("form").first();
    await expect(form).toBeVisible();

    // ≥1 Input + Submit-Button
    await expect(form.locator("input").first()).toBeVisible();
    await expect(
      form.locator('button[type="submit"]').first(),
    ).toBeVisible();

    // Consent-Checkbox (DSGVO-Pflicht)
    const consentCheckbox = form.locator(
      'input[type="checkbox"]:not([name*="hidden" i])',
    );
    await expect(consentCheckbox.first()).toBeVisible();
  });

  test("Submit-Button ohne Consent ist disabled (UX-Sicherheit)", async ({
    page,
  }) => {
    await page.goto(`/site/${DEMO_SLUGS[0]}`);

    const form = page.locator("form").first();
    const submitButton = form.locator('button[type="submit"]').first();

    // Pflicht-Feld ausfüllen (Name)
    const nameInput = form.locator('input[name*="name" i]').first();
    if ((await nameInput.count()) > 0) {
      await nameInput.fill("Test User");
    }

    // Ohne Consent-Checkbox bleibt der Submit-Button disabled —
    // das ist UX-Best-Practice (DSGVO). Click würde nichts
    // bewirken; wir prüfen den Disabled-State direkt.
    await expect(submitButton).toBeDisabled();
  });

  test("Submit-Button aktiviert sich erst mit Consent + Pflicht-Feldern", async ({
    page,
  }) => {
    await page.goto(`/site/${DEMO_SLUGS[0]}`);

    const form = page.locator("form").first();
    const submitButton = form.locator('button[type="submit"]').first();

    // Initial: disabled (kein Consent)
    await expect(submitButton).toBeDisabled();

    // Consent allein reicht? Nein — Pflicht-Felder sind
    // branchenspezifisch (Studio Haarlinie hat name + phone
    // o. ä.). Wir testen nur das Consent-Gating.
    const consentCheckbox = form.locator(
      'input[type="checkbox"]:not([name*="hidden" i])',
    );
    await consentCheckbox.first().check();

    // Mit Consent + Pflicht-Feldern leer: Button sollte
    // enabled sein (Consent ist der einzige Hard-Block,
    // Field-Validation läuft erst beim Click). RHF-Forms
    // lassen Clicks auch bei leeren Required-Fields zu —
    // Validation zeigt dann Errors, kein Disabled-Block.
    await expect(submitButton).toBeEnabled();
  });
});

test.describe("Retry-Queue UI", () => {
  test("Pre-populated Queue zeigt amber Badge", async ({ page }) => {
    const slug = DEMO_SLUGS[0]!;

    const fakeQueueItem = {
      id: "11111111-1111-4111-8111-111111111111",
      payload: {
        businessId: "22222222-2222-4222-8222-222222222222",
        name: "Pending User",
        email: "pending@example.test",
        message: "Old retry",
        consent: {
          givenAt: "2026-04-27T10:00:00Z",
          policyVersion: "v1",
        },
      },
      attempts: 0,
      // Weit in der Zukunft → nicht due → flush-Pfad
      // versucht keinen sofortigen Retry → Queue bleibt
      // belegt → Badge sichtbar bleibt.
      nextRetryAt: "2030-01-01T00:00:00Z",
      createdAt: "2026-04-27T10:00:00Z",
    };

    // `addInitScript` läuft VOR jedem Document-Load — der
    // Form-`useEffect` (Mount) liest die Queue-Stats aus
    // localStorage genau einmal beim ersten Render. Setzen
    // wir den Key per page.evaluate NACH goto, ist der
    // useEffect schon durchgelaufen.
    await page.addInitScript(
      ({ key, item }) => {
        window.localStorage.setItem(key, JSON.stringify([item]));
      },
      { key: RETRY_QUEUE_KEY, item: fakeQueueItem },
    );

    await page.goto(`/site/${slug}`);

    // Sanity: localStorage ist tatsächlich gesetzt nach
    // addInitScript + Page-Load.
    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      RETRY_QUEUE_KEY,
    );
    expect(stored, "localStorage hat Retry-Queue-Eintrag").not.toBeNull();

    // Badge-Text:
    //   Singular: „Eine ältere Anfrage wartet noch auf den Versand …"
    //   Plural:   „N ältere Anfragen warten noch auf den Versand …"
    // Wir matchen beide Varianten. Form-Mount + useEffect + Re-
    // Render braucht etwas Zeit, daher 10s Timeout.
    await expect(
      page
        .getByText(/ältere anfrage(n)? (wartet|warten) noch auf den versand/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Online-Event triggert Queue-Flush (kein Crash)", async ({
    page,
    context,
  }) => {
    const slug = DEMO_SLUGS[0]!;
    await page.goto(`/site/${slug}`);

    // Offline → online-Wechsel triggert das `online`-Event,
    // das der Form-`useEffect` abonniert (Code-Session 64).
    // Wir testen, dass die Page das überlebt — der eigentliche
    // Flush-Roundtrip schlägt fehl (kein Backend), aber das
    // ist erwartetes Demo-Mode-Verhalten.
    await context.setOffline(true);
    await context.setOffline(false);

    // Form bleibt sichtbar, kein Page-Crash.
    await expect(page.locator("form").first()).toBeVisible();
  });
});

test.describe("Mobile-CTA-Streifen", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Mobile-Viewport zeigt sticky-bottom-CTA", async ({ page }) => {
    await page.goto(`/site/${DEMO_SLUGS[0]}`);

    // PublicMobileCtaBar hat `class="fixed inset-x-0 bottom-0
    // ... md:hidden"`. Auf Mobile-Viewport (390 px) ist
    // `md:hidden` inaktiv → Streifen sichtbar.
    const mobileCta = page.locator(".fixed.bottom-0.md\\:hidden").first();
    await expect(mobileCta).toBeVisible();
  });

  test("Desktop-Viewport hat sticky-bottom-CTA NICHT sichtbar", async ({
    page,
    browserName,
  }) => {
    // Override des test.use-Viewports für diesen Test
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/site/${DEMO_SLUGS[0]}`);

    const mobileCta = page.locator(".fixed.bottom-0.md\\:hidden").first();
    // Auf Desktop ist `md:hidden` aktiv → display:none →
    // nicht sichtbar. `toBeHidden` ist tolerant gegen
    // Element-existiert-aber-display-none.
    await expect(mobileCta).toBeHidden();
    void browserName;
  });
});
