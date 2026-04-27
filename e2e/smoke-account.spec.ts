import { expect, test } from "@playwright/test";

/**
 * Smoke-Test: Account-Page ohne Backend (Code-Session 71).
 *
 * Ohne `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * fällt die Page auf den `unconfigured`-Zustand zurück
 * (Demo-Modus-Card mit Link zur Demo). Sessions 72+ testen
 * dann den authed Pfad mit gemockter Session.
 */

test.describe("Account-Page (Demo-Modus)", () => {
  test("Heading + Demo-Modus-Card erscheinen", async ({ page }) => {
    await page.goto("/account");

    // Heading „Dein Account"
    await expect(page.getByRole("heading", { name: /dein account/i })).toBeVisible();

    // Entweder Demo-Modus-Card (kein Backend) ODER Guest-Card
    // (Backend da, aber nicht eingeloggt). Beide sind in der
    // Test-Umgebung valide.
    const demoOrGuest = page.locator("text=/demo-modus|nicht eingeloggt/i");
    await expect(demoOrGuest).toBeVisible({ timeout: 5_000 });
  });
});
