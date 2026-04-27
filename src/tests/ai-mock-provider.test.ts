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

  // 7. improveServiceDescription (Code-Session 15)
  // -----------------------------------------------------------------------
  // 7a. 2 Branchen × 3 targetLength → vollständige Outputs, jeweils mit
  //     Kurz- (≤ 240) und Langversion (≤ 2000).
  // -----------------------------------------------------------------------

  const TARGET_LENGTHS = ["short", "medium", "long"] as const;

  async function checkServiceLengths(
    context: AIBusinessContext,
    serviceTitle: string,
    label: string,
  ): Promise<void> {
    for (const targetLength of TARGET_LENGTHS) {
      const out = await mockProvider.improveServiceDescription({
        context,
        serviceTitle,
        currentDescription: "",
        targetLength,
      });
      assert(
        out.shortDescription.length >= 2 && out.shortDescription.length <= 240,
        `${label}/${targetLength}: shortDescription im Limit`,
      );
      assert(
        out.longDescription.length >= 2 && out.longDescription.length <= 2000,
        `${label}/${targetLength}: longDescription im Limit`,
      );
    }
  }

  await checkServiceLengths(
    baseContextHairdresser,
    "Damenhaarschnitt",
    "hairdresser/Damenhaarschnitt",
  );
  await checkServiceLengths(
    baseContextAutoWorkshop,
    "Inspektion",
    "auto_workshop/Inspektion",
  );

  // 7b. „long" produziert mehr Inhalt als „short" (in der Regel mehr
  //     Absätze, mindestens aber mehr Zeichen).
  const sShort = await mockProvider.improveServiceDescription({
    context: baseContextHairdresser,
    serviceTitle: "Damenhaarschnitt",
    currentDescription: "",
    targetLength: "short",
  });
  const sLong = await mockProvider.improveServiceDescription({
    context: baseContextHairdresser,
    serviceTitle: "Damenhaarschnitt",
    currentDescription: "",
    targetLength: "long",
  });
  assert(
    sLong.longDescription.length > sShort.longDescription.length,
    "long > short bei longDescription",
  );

  // 7c. Preset-Match: bekannter Service-Titel taucht in der Kurzversion
  //     mit der Preset-Saatzeile auf (Friseur-Preset hat Damenhaarschnitt
  //     mit "Schnitt inkl. Beratung und Styling.").
  const sMatch = await mockProvider.improveServiceDescription({
    context: baseContextHairdresser,
    serviceTitle: "Damenhaarschnitt",
    currentDescription: "",
    targetLength: "medium",
  });
  assert(
    sMatch.shortDescription.toLowerCase().includes("schnitt"),
    "Preset-Match: Saatzeile aus Preset im shortDescription",
  );
  assert(
    sMatch.shortDescription.includes("Bremen"),
    "shortDescription nennt die Stadt",
  );

  // 7d. currentDescription hat Vorrang als Saatzeile.
  const sCurrent = await mockProvider.improveServiceDescription({
    context: baseContextHairdresser,
    serviceTitle: "Damenhaarschnitt",
    currentDescription: "Ein Damenhaarschnitt mit Tiefenpflege und Föhn-Finish.",
    targetLength: "medium",
  });
  assert(
    sCurrent.shortDescription.includes("Tiefenpflege"),
    "currentDescription wird als Saatzeile übernommen",
  );

  // 7e. Process-Steps des Presets erscheinen in der long-Variante
  //     (Friseur-Preset Schritt 1 = „Termin anfragen").
  const sLongHair = await mockProvider.improveServiceDescription({
    context: baseContextHairdresser,
    serviceTitle: "Damenhaarschnitt",
    currentDescription: "",
    targetLength: "long",
  });
  assert(
    sLongHair.longDescription.includes("So läuft es ab"),
    "long-Variante hat Ablauf-Block",
  );
  assert(
    sLongHair.longDescription.includes("Termin"),
    "long-Variante zeigt Preset-Process-Step (Termin)",
  );

  // 7f. USPs landen im Trust-Block der long-Variante.
  assert(
    sLongHair.longDescription.includes("Termine auch samstags"),
    "long-Variante zeigt USP im Trust-Block",
  );

  // 7g. Determinismus: zweimal identisch.
  const a1 = await mockProvider.improveServiceDescription({
    context: baseContextAutoWorkshop,
    serviceTitle: "Inspektion",
    currentDescription: "",
    targetLength: "medium",
  });
  const a2 = await mockProvider.improveServiceDescription({
    context: baseContextAutoWorkshop,
    serviceTitle: "Inspektion",
    currentDescription: "",
    targetLength: "medium",
  });
  assert(
    a1.shortDescription === a2.shortDescription &&
      a1.longDescription === a2.longDescription,
    "improveServiceDescription deterministisch",
  );

  // 7h. Defensive: zu kurzer serviceTitle → invalid_input.
  let sCaught: unknown = null;
  try {
    await mockProvider.improveServiceDescription({
      context: baseContextHairdresser,
      serviceTitle: "X",
      currentDescription: "",
      targetLength: "medium",
    });
  } catch (err) {
    sCaught = err;
  }
  assert(
    sCaught instanceof AIProviderError && sCaught.code === "invalid_input",
    "serviceTitle zu kurz → invalid_input",
  );

  // -----------------------------------------------------------------------
  // 8. generateFaqs (Code-Session 16)
  // -----------------------------------------------------------------------
  // 8a. 2 Branchen × 2 count-Werte → vollständige Outputs, jeweils
  //     im Schema-Limit (≥ 1, ≤ count).
  // -----------------------------------------------------------------------

  async function checkFaqShape(
    context: AIBusinessContext,
    label: string,
    count: number,
  ): Promise<void> {
    const out = await mockProvider.generateFaqs({
      context,
      topics: [],
      count,
    });
    assert(
      out.faqs.length >= 1 && out.faqs.length <= count,
      `${label}/count=${count}: faqs.length zwischen 1 und count`,
    );
    for (const f of out.faqs) {
      assert(
        f.question.length >= 3 && f.question.length <= 240,
        `${label}/count=${count}: question im Limit`,
      );
      assert(
        f.answer.length >= 3 && f.answer.length <= 2000,
        `${label}/count=${count}: answer im Limit`,
      );
    }
  }

  await checkFaqShape(baseContextHairdresser, "hairdresser", 3);
  await checkFaqShape(baseContextHairdresser, "hairdresser", 6);
  await checkFaqShape(baseContextAutoWorkshop, "auto_workshop", 4);

  // 8b. Preset-Saatfragen erscheinen in der Ausgabe (Friseur-Preset hat
  //     z. B. „Wie buche ich einen Termin?", Werkstatt-Preset hat
  //     „Wie schnell bekomme ich einen Termin?").
  const fHair = await mockProvider.generateFaqs({
    context: baseContextHairdresser,
    topics: [],
    count: 4,
  });
  assert(
    fHair.faqs.some((f) => f.question.toLowerCase().includes("termin")),
    "hairdresser: Preset-Saatfrage zu Termin enthalten",
  );

  // 8c. Topic „Stornierung" landet als spezialisierte Q/A in der Ausgabe.
  const fTopic = await mockProvider.generateFaqs({
    context: baseContextHairdresser,
    topics: ["Stornierung"],
    count: 8,
  });
  assert(
    fTopic.faqs.some(
      (f) => f.question.toLowerCase().includes("absag") ||
        f.question.toLowerCase().includes("stornier"),
    ),
    "topic 'Stornierung' → eigene Q/A im Ergebnis",
  );

  // 8d. Topic „Preise" → Preis-Template wird gewählt (Frage enthält
  //     „Was kostet").
  const fPrice = await mockProvider.generateFaqs({
    context: baseContextHairdresser,
    topics: ["Preise"],
    count: 8,
  });
  assert(
    fPrice.faqs.some((f) => f.question.toLowerCase().includes("kostet")),
    "topic 'Preise' → 'Was kostet'-Frage erzeugt",
  );

  // 8e. Lokale Frage: bei gesetztem city und genug count taucht
  //     „Sind Sie auch in <city>" auf.
  const fLocal = await mockProvider.generateFaqs({
    context: baseContextHairdresser,
    topics: [],
    count: 20,
  });
  assert(
    fLocal.faqs.some((f) => f.question.includes("Bremen")),
    "Lokale Frage mit city erscheint bei genug Platz",
  );

  // 8f. Ohne city wird die lokale Frage nicht erzeugt.
  const fNoCity = await mockProvider.generateFaqs({
    context: { ...baseContextHairdresser, city: undefined },
    topics: [],
    count: 20,
  });
  assert(
    fNoCity.faqs.every((f) => !/sind sie auch in/i.test(f.question)),
    "Ohne city: keine lokale Frage",
  );

  // 8g. Deduplizierung: doppelte Topics führen nicht zu doppelten Q/As.
  const fDedup = await mockProvider.generateFaqs({
    context: baseContextAutoWorkshop,
    topics: ["Preise", "Preise", "preise"],
    count: 10,
  });
  const dedupKeys = fDedup.faqs.map((f) =>
    f.question.toLowerCase().replace(/[^a-z0-9]+/g, ""),
  );
  assert(
    new Set(dedupKeys).size === dedupKeys.length,
    "Deduplizierung: keine doppelten Fragen-Schlüssel",
  );

  // 8h. count = 1 liefert genau 1 Q/A.
  const fOne = await mockProvider.generateFaqs({
    context: baseContextHairdresser,
    topics: [],
    count: 1,
  });
  assert(fOne.faqs.length === 1, "count=1 → genau 1 Q/A");

  // 8i. Determinismus: zweimal identisch.
  const f1 = await mockProvider.generateFaqs({
    context: baseContextHairdresser,
    topics: ["Preise", "Stornierung"],
    count: 5,
  });
  const f2 = await mockProvider.generateFaqs({
    context: baseContextHairdresser,
    topics: ["Preise", "Stornierung"],
    count: 5,
  });
  assert(
    JSON.stringify(f1.faqs) === JSON.stringify(f2.faqs),
    "generateFaqs deterministisch",
  );

  // 8j. Defensive: count = 0 → invalid_input (Schema verlangt ≥ 1).
  let fCaught: unknown = null;
  try {
    await mockProvider.generateFaqs({
      context: baseContextHairdresser,
      topics: [],
      count: 0,
    });
  } catch (err) {
    fCaught = err;
  }
  assert(
    fCaught instanceof AIProviderError && fCaught.code === "invalid_input",
    "count=0 → invalid_input",
  );

  // -----------------------------------------------------------------------
  // 9. generateCustomerReply (Code-Session 17)
  // -----------------------------------------------------------------------
  // 9a. 3 Tonalitäten × 2 Branchen → vollständige Outputs im Limit
  //     (≥ 2, ≤ 2000 Zeichen).
  // -----------------------------------------------------------------------

  const TONES = ["short", "friendly", "professional"] as const;

  async function checkReplyLengths(
    context: AIBusinessContext,
    label: string,
  ): Promise<void> {
    for (const tone of TONES) {
      const out = await mockProvider.generateCustomerReply({
        context,
        customerMessage:
          "Hallo, ich hätte gerne einen Termin in der nächsten Woche. Ist da etwas frei?",
        tone,
      });
      assert(
        out.reply.length >= 2 && out.reply.length <= 2000,
        `${label}/${tone}: reply im Limit`,
      );
    }
  }

  await checkReplyLengths(baseContextHairdresser, "hairdresser");
  await checkReplyLengths(baseContextAutoWorkshop, "auto_workshop");

  // 9b. Anrede passt zur Tonalität.
  const rShort = await mockProvider.generateCustomerReply({
    context: baseContextHairdresser,
    customerMessage: "Was kostet ein Damenhaarschnitt bei Ihnen?",
    tone: "short",
  });
  assert(rShort.reply.startsWith("Guten Tag"), "short startet mit 'Guten Tag'");

  const rFriendly = await mockProvider.generateCustomerReply({
    context: baseContextHairdresser,
    customerMessage: "Was kostet ein Damenhaarschnitt bei Ihnen?",
    tone: "friendly",
  });
  assert(rFriendly.reply.startsWith("Hallo"), "friendly startet mit 'Hallo'");

  const rProfessional = await mockProvider.generateCustomerReply({
    context: baseContextHairdresser,
    customerMessage: "Was kostet ein Damenhaarschnitt bei Ihnen?",
    tone: "professional",
  });
  assert(
    rProfessional.reply.startsWith("Sehr geehrte"),
    "professional startet mit 'Sehr geehrte'",
  );

  // 9c. Themen-Erkennung: Preis-Anfrage spiegelt Preis-Mirror und
  //     löst die Preis-Antwort aus.
  assert(
    rShort.reply.includes("Frage zu den Preisen") &&
      rShort.reply.includes("Preisübersicht"),
    "Preis-Topic erkannt: Mirror + nächster Schritt",
  );

  // 9d. Termin-Anfrage löst Termin-Antwort aus.
  const rAppt = await mockProvider.generateCustomerReply({
    context: baseContextAutoWorkshop,
    customerMessage:
      "Bekomme ich kommende Woche einen Termin für eine Inspektion?",
    tone: "short",
  });
  assert(
    rAppt.reply.includes("Terminanfrage") && rAppt.reply.includes("Slots"),
    "Termin-Topic erkannt",
  );

  // 9e. Reklamation hat Vorrang vor allgemeinem „Problem".
  const rComplaint = await mockProvider.generateCustomerReply({
    context: baseContextAutoWorkshop,
    customerMessage:
      "Ich bin mit der Reparatur leider unzufrieden, da ist nach wie vor ein Geräusch.",
    tone: "friendly",
  });
  assert(
    rComplaint.reply.includes("Rückmeldung") &&
      rComplaint.reply.includes("faire Lösung"),
    "Reklamations-Topic erkannt",
  );

  // 9f. Stornierung greift vor Termin-Regex.
  const rCancel = await mockProvider.generateCustomerReply({
    context: baseContextHairdresser,
    customerMessage:
      "Ich muss meinen Termin am Donnerstag leider absagen oder verschieben.",
    tone: "short",
  });
  assert(
    rCancel.reply.includes("Terminänderung"),
    "Stornierungs-Topic vor Termin-Topic",
  );

  // 9g. Generischer Fallback bei nicht-erkanntem Anliegen.
  const rGeneric = await mockProvider.generateCustomerReply({
    context: baseContextHairdresser,
    customerMessage: "Wie ist Ihr Vertragspartner für Geschenkgutscheine?",
    tone: "short",
  });
  assert(
    rGeneric.reply.includes("Ihre Nachricht") &&
      rGeneric.reply.includes("innerhalb eines Werktags"),
    "Generischer Fallback greift",
  );

  // 9h. Friendly nutzt city im Anschreiben, professional zeigt
  //     Branchenlabel.
  assert(
    rFriendly.reply.includes("Bremen"),
    "friendly: city erscheint im Anschreiben",
  );
  assert(
    rProfessional.reply.toLowerCase().includes("friseur"),
    "professional: industryLabel im Text",
  );

  // 9i. Signatur enthält den businessName.
  assert(
    rShort.reply.includes("Salon Sophia") &&
      rFriendly.reply.includes("Salon Sophia") &&
      rProfessional.reply.includes("Salon Sophia"),
    "Signatur enthält businessName",
  );

  // 9j. Determinismus.
  const r1 = await mockProvider.generateCustomerReply({
    context: baseContextHairdresser,
    customerMessage: "Wann haben Sie geöffnet?",
    tone: "friendly",
  });
  const r2 = await mockProvider.generateCustomerReply({
    context: baseContextHairdresser,
    customerMessage: "Wann haben Sie geöffnet?",
    tone: "friendly",
  });
  assert(r1.reply === r2.reply, "generateCustomerReply deterministisch");

  // 9k. Defensive: leere customerMessage → invalid_input.
  let rCaught: unknown = null;
  try {
    await mockProvider.generateCustomerReply({
      context: baseContextHairdresser,
      customerMessage: "",
      tone: "short",
    });
  } catch (err) {
    rCaught = err;
  }
  assert(
    rCaught instanceof AIProviderError && rCaught.code === "invalid_input",
    "leere customerMessage → invalid_input",
  );

  // -----------------------------------------------------------------------
  // 10. Übrige 3 Methoden müssen weiterhin provider_unavailable werfen.
  // -----------------------------------------------------------------------
  const placeholderContext = baseContextHairdresser;
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
  await expectUnavailable("generateOfferCampaign", () =>
    mockProvider.generateOfferCampaign({
      context: placeholderContext,
      offerTitle: "Sommer-Aktion",
      details: "",
    }),
  );

  // 11. Provider-Key
  assert(mockProvider.key === "mock", "mockProvider.key === 'mock'");
}

void run();

export const __AI_MOCK_PROVIDER_SMOKETEST__ = {
  industries: 2,
  variants: VARIANTS.length,
  serviceLengths: 3,
  faqCounts: 3,
  replyTones: 3,
  totalAssertions: 78,
};
