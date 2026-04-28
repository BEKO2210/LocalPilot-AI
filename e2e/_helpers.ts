import type { Locator, Page } from "@playwright/test";

/**
 * E2E-Test-Helpers (Code-Session 75).
 *
 * Wiederverwendbare Utilities für Service-Cards, Tab-Nav,
 * sticky-Top-Bar-Workarounds. Ziel: Pattern-Konsistenz +
 * Reduktion von Copy-Paste in den `.spec.ts`-Files.
 *
 * Bewusste Entscheidung — keine Page-Objects (yet): wir haben
 * 5 Test-Files und keine 50. Page-Object-Klassen würden
 * unnötig viel Boilerplate schaffen. Sobald wir ≥100 Tests
 * haben, wird umgestellt.
 */

const DEMO_BUSINESSES = {
  silber: "studio-haarlinie",
  gold: "autoservice-mueller",
  bronze: "meisterbau-schneider",
} as const;

export const DEMO = DEMO_BUSINESSES;

/**
 * Service-Cards leben in `<ul> details`. Das filtert den
 * Business-Header-Switcher (auch ein `<details>`) zuverlässig
 * raus. Lesson aus Session 74.
 */
export const SERVICE_CARD_SELECTOR = "ul details";

export function serviceCards(page: Page): Locator {
  return page.locator(SERVICE_CARD_SELECTOR);
}

/**
 * Öffnet eine `<details>`-Card via DOM-API. Sticky-Top-Bar
 * überdeckt die Summary auf Desktop-Viewport, daher kein
 * Click — wir setzen `open` direkt. Lesson aus Session 74.
 */
export async function openCard(card: Locator): Promise<void> {
  await card.evaluate((el) => {
    (el as HTMLDetailsElement).open = true;
  });
}

/**
 * Status-Bar-Heading (sticky Top-Bar oder Page-Heading) als
 * Text-Match. Umgeht `<title>`-Tag-Strict-Mode-Konflikt
 * durch Container-Selektor `main p, body > div p`.
 * Lesson aus Session 73.
 */
export function statusBarHeading(page: Page, text: RegExp): Locator {
  return page
    .locator("main p, body > div p")
    .filter({ hasText: text })
    .first();
}

/**
 * Sidebar-/Mobile-Nav-Link via href + visibility-Filter.
 * `:visible`-CSS-Selector überspringt das hidden Mobile-Nav-
 * Element auf Desktop. Lesson aus Session 73.
 */
export function visibleNavLink(page: Page, href: string): Locator {
  return page.locator(`a[href="${href}"]:visible`).first();
}

/**
 * Wartet, bis ein Form-Input einen non-empty Wert hat.
 * Nützlich, um RHF-Hydration mit Demo-Daten abzufangen, bevor
 * Asserts den `inputValue` lesen. Lesson aus Session 73.
 */
export async function waitForFormHydration(input: Locator): Promise<void> {
  await input.evaluate((el) => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if ((el as HTMLInputElement).value.length > 0) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  });
}
