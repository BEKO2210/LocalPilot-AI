/**
 * Smoketest für den Mock-Provider — generateWebsiteCopy (Code-Session 14).
 *
 * Deckt die deterministische Mock-Implementierung ab:
 *   - 2 Branchen (hairdresser, auto_workshop) × 4 Varianten
 *   - Ergebnisstruktur (heroTitle, heroSubtitle, aboutText)
 *   - {{city}}-Substitution greift
 *   - Defensive: ungültiges Input wirft AIProviderError("invalid_input")
 *   - Andere 6 Methoden werfen weiterhin provider_unavailable
 *
 * Ausführung als async-IIFE, damit das Modul auch unter CJS-Transformern
 * (z. B. tsx-fallback) lädt – top-level await ist hier nicht zwingend.
 */

import { mockProvider } from "@/core/ai/providers/mock-provider";
import { AIProviderError } from "@/types/ai";
import type {
  AIBusinessContext,
  WebsiteCopyInput,
  WebsiteCopyOutput,
} from "@/types/ai";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Mock-provider assertion failed: ${message}`);
  }
}

const baseContextHairdresser: AIBusinessContext = {
  industryKey: "hairdresser",
  packageTier: "silber",
  language: "de",
  businessName: "Salon Sophia",
  city: "Bremen",
  toneOfVoice: ["freundlich", "modern"],
  uniqueSellingPoints: [
    "Termine auch samstags",
    "Faire Festpreise",
    "Erfahrenes Team seit 2009",
  ],
};

const baseContextAutoWorkshop: AIBusinessContext = {
  industryKey: "auto_workshop",
  packageTier: "gold",
  language: "de",
  businessName: "KFZ Müller",
  city: "Leipzig",
  toneOfVoice: ["sachlich", "ehrlich"],
  uniqueSellingPoints: ["TÜV in 24 h", "Leihwagen kostenlos"],
};

const VARIANTS: WebsiteCopyInput["variant"][] = [
  "hero",
  "about",
  "services_intro",
  "benefits_intro",
];

async function checkAllVariants(
  context: AIBusinessContext,
  label: string,
): Promise<void> {
  for (const variant of VARIANTS) {
    const out: WebsiteCopyOutput = await mockProvider.generateWebsiteCopy({
      context,
      variant,
    });
    assert(
      typeof out.heroTitle === "string" && out.heroTitle.length >= 2,
      `${label}/${variant}: heroTitle nicht leer`,
    );
    assert(
      typeof out.heroSubtitle === "string" && out.heroSubtitle.length >= 2,
      `${label}/${variant}: heroSubtitle nicht leer`,
    );
    assert(
      typeof out.aboutText === "string" && out.aboutText.length >= 10,
      `${label}/${variant}: aboutText hat Substanz`,
    );
    assert(out.heroTitle.length <= 160, `${label}/${variant}: heroTitle ≤ 160`);
    assert(
      out.heroSubtitle.length <= 280,
      `${label}/${variant}: heroSubtitle ≤ 280`,
    );
    assert(
      out.aboutText.length <= 1200,
      `${label}/${variant}: aboutText ≤ 1200`,
    );
  }
}

async function expectUnavailable(
  label: string,
  call: () => Promise<unknown>,
): Promise<void> {
  let err: unknown = null;
  try {
    await call();
  } catch (e) {
    err = e;
  }
  assert(
    err instanceof AIProviderError && err.code === "provider_unavailable",
    `${label}: wirft provider_unavailable`,
  );
}

async function run(): Promise<void> {
  // 1. 2 Branchen × 4 Varianten → vollständig befüllte Outputs
  await checkAllVariants(baseContextHairdresser, "hairdresser");
  await checkAllVariants(baseContextAutoWorkshop, "auto_workshop");

  // 2. {{city}}-Substitution
  const withCity = await mockProvider.generateWebsiteCopy({
    context: baseContextHairdresser,
    variant: "hero",
  });
  const allText = `${withCity.heroTitle}\n${withCity.heroSubtitle}\n${withCity.aboutText}`;
  assert(
    allText.includes("Bremen"),
    "{{city}}-Substitution: 'Bremen' erscheint im Output",
  );

  const aboutWithCity = await mockProvider.generateWebsiteCopy({
    context: baseContextAutoWorkshop,
    variant: "about",
  });
  assert(
    aboutWithCity.aboutText.includes("Leipzig"),
    "about-Variante: aboutText nennt 'Leipzig'",
  );

  const withoutCity = await mockProvider.generateWebsiteCopy({
    context: { ...baseContextHairdresser, city: undefined },
    variant: "hero",
  });
  const noCityText = `${withoutCity.heroTitle}\n${withoutCity.heroSubtitle}\n${withoutCity.aboutText}`;
  assert(
    !noCityText.includes("{{city}}"),
    "Ohne city: Template-Platzhalter wurde sauber ersetzt",
  );

  // 3. USPs und businessName fließen in den About-Text der "about"-Variante
  const aboutHairdresser = await mockProvider.generateWebsiteCopy({
    context: baseContextHairdresser,
    variant: "about",
  });
  assert(
    aboutHairdresser.aboutText.includes("Termine auch samstags"),
    "about-Variante: USP wird im aboutText wiedergegeben",
  );
  assert(
    aboutHairdresser.aboutText.includes("Salon Sophia"),
    "about-Variante: businessName erscheint im aboutText",
  );

  // 4. Determinismus
  const a = await mockProvider.generateWebsiteCopy({
    context: baseContextHairdresser,
    variant: "services_intro",
  });
  const b = await mockProvider.generateWebsiteCopy({
    context: baseContextHairdresser,
    variant: "services_intro",
  });
  assert(
    a.heroTitle === b.heroTitle &&
      a.heroSubtitle === b.heroSubtitle &&
      a.aboutText === b.aboutText,
    "Mock ist deterministisch",
  );

  // 5. hint wird übernommen
  const withHint = await mockProvider.generateWebsiteCopy({
    context: baseContextHairdresser,
    variant: "hero",
    hint: "bitte besonders auf Brautstyling eingehen",
  });
  assert(
    withHint.aboutText.includes("Brautstyling"),
    "hint: Vorgabe taucht im aboutText auf",
  );

  // 6. Defensive: ungültiges Input
  let caught: unknown = null;
  try {
    await mockProvider.generateWebsiteCopy({
      // @ts-expect-error — bewusst ungültig: businessName fehlt.
      context: { industryKey: "hairdresser", packageTier: "silber" },
      variant: "hero",
    });
  } catch (err) {
    caught = err;
  }
  assert(
    caught instanceof AIProviderError && caught.code === "invalid_input",
    "Ungültiges Input → AIProviderError('invalid_input')",
  );

  let caught2: unknown = null;
  try {
    await mockProvider.generateWebsiteCopy({
      context: { ...baseContextHairdresser, businessName: "X" },
      variant: "hero",
    });
  } catch (err) {
    caught2 = err;
  }
  assert(
    caught2 instanceof AIProviderError && caught2.code === "invalid_input",
    "businessName zu kurz → invalid_input",
  );

  // 7. Übrige 6 Methoden müssen weiterhin provider_unavailable werfen
  const placeholderContext = baseContextHairdresser;
  await expectUnavailable("improveServiceDescription", () =>
    mockProvider.improveServiceDescription({
      context: placeholderContext,
      serviceTitle: "Haarschnitt",
      currentDescription: "",
      targetLength: "medium",
    }),
  );
  await expectUnavailable("generateFaqs", () =>
    mockProvider.generateFaqs({
      context: placeholderContext,
      topics: [],
      count: 3,
    }),
  );
  await expectUnavailable("generateReviewRequest", () =>
    mockProvider.generateReviewRequest({
      context: placeholderContext,
      channel: "email",
      tone: "friendly",
    }),
  );
  await expectUnavailable("generateSocialPost", () =>
    mockProvider.generateSocialPost({
      context: placeholderContext,
      platform: "instagram",
      goal: "more_appointments",
      topic: "Neueröffnung",
      length: "medium",
      includeHashtags: true,
    }),
  );
  await expectUnavailable("generateCustomerReply", () =>
    mockProvider.generateCustomerReply({
      context: placeholderContext,
      customerMessage: "Wann habt ihr morgen offen?",
      tone: "friendly",
    }),
  );
  await expectUnavailable("generateOfferCampaign", () =>
    mockProvider.generateOfferCampaign({
      context: placeholderContext,
      offerTitle: "Sommer-Aktion",
      details: "",
    }),
  );

  // 8. Provider-Key
  assert(mockProvider.key === "mock", "mockProvider.key === 'mock'");
}

void run();

export const __AI_MOCK_PROVIDER_SMOKETEST__ = {
  industries: 2,
  variants: VARIANTS.length,
  totalAssertions: 30,
};
