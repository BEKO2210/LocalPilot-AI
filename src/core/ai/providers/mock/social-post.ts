/**
 * Mock-Implementierung für `generateSocialPost` (Code-Session 19).
 *
 * Deterministisch, branchenneutral, ohne externen API-Call. Erzeugt
 * für jede Plattform/Goal/Length-Kombination einen vollständigen
 * `SocialPostOutput`:
 *   - `shortPost`  ≤ 280 Zeichen, eine knackige Variante.
 *   - `longPost`   ≤ 2000 Zeichen, je nach `length` 1–3 Absätze
 *                   plus CTA, mit optionalem USP-Block in der
 *                   "long"-Variante.
 *   - `hashtags`   plattform-bewusste Anzahl, nach 2026-Patterns
 *                   (Instagram 3–5, LinkedIn 3–5, Facebook 1–2,
 *                   Google Business 0, WhatsApp-Status 0). `[]`
 *                   wenn `includeHashtags === false`.
 *   - `imageIdea`  abgeleitet aus `preset.imageGuidance` plus Topic.
 *   - `cta`        goal-spezifischer deutscher Call-to-Action.
 *
 * Saatzeile:
 *   1. Preset-Match in `preset.socialPostPrompts` auf `goal`
 *      (Plattform-Match bevorzugt, wenn gegeben). `ideaShort` wird
 *      als Inhalts-Saatzeile verwendet.
 *   2. Fallback: ein goal-spezifisches Default-Pattern.
 *
 * Output wird defensiv durch `SocialPostOutputSchema` validiert.
 */

import {
  SocialPostInputSchema,
  SocialPostOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type { SocialPostInput, SocialPostOutput } from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";
import type { SocialPostPrompt } from "@/types/industry";
import type { SocialPlatform, SocialPostGoal } from "@/types/common";

function clamp(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

/** Macht einen Hashtag-tauglichen Slug aus einem freien String. */
function tagify(input: string): string {
  const cleaned = input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Za-z0-9]/g, "");
  return cleaned.length > 0 ? `#${cleaned}` : "";
}

/**
 * Plattform-spezifische Ziel-Anzahl an Hashtags. Werte folgen den
 * 2026-Patterns aus der Recherche:
 *   - Instagram: 3–5 fokussierte Tags.
 *   - LinkedIn: 3–5 Metadaten-Tags.
 *   - Facebook: 1–2 Tags, mehr unterdrückt Reach.
 *   - Google Business Profile: keine Hashtag-Kultur → 0.
 *   - WhatsApp-Status: keine Hashtag-Kultur → 0.
 */
function targetHashtagCount(platform: SocialPlatform): number {
  switch (platform) {
    case "instagram":
      return 5;
    case "linkedin":
      return 4;
    case "facebook":
      return 2;
    case "google_business":
    case "whatsapp_status":
    default:
      return 0;
  }
}

/**
 * Baut den Hashtag-Pool nach 2026-Pattern: Hyperlokal +
 * Branche + Betrieb + Community. Dedupliziert nach Slug.
 */
function buildHashtagPool(
  industryLabel: string,
  businessName: string,
  city: string | undefined,
  topic: string,
): string[] {
  const candidates = [
    tagify(industryLabel),
    city ? tagify(city) : "",
    city ? tagify(`Lokal${city}`) : "",
    tagify(businessName),
    tagify(topic.split(/\s+/)[0] ?? ""),
    "#KleineBetriebe",
    "#Empfehlung",
    "#Lokal",
  ].filter((t) => t.length >= 2 && t.length <= 40);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const tag of candidates) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(tag);
  }
  return unique;
}

/**
 * Sucht im Preset einen Prompt, der zu (goal, platform) passt.
 * Plattform-Match bevorzugt; ohne Plattform-Match reicht der
 * Goal-Match. Liefert `null`, wenn nichts greift.
 */
function findPresetPrompt(
  prompts: readonly SocialPostPrompt[],
  goal: SocialPostGoal,
  platform: SocialPlatform,
): SocialPostPrompt | null {
  const goalMatches = prompts.filter((p) => p.goal === goal);
  const platformAndGoal = goalMatches.find((p) =>
    p.platforms.includes(platform),
  );
  return platformAndGoal ?? goalMatches[0] ?? null;
}

/**
 * Goal-spezifische CTA-Texte. Bewusst deutsch, knapp, ohne
 * Superlative. Schema-Limit ist 160 Zeichen.
 */
function ctaFor(goal: SocialPostGoal): string {
  switch (goal) {
    case "more_appointments":
      return "Jetzt Termin sichern.";
    case "promote_offer":
      return "Aktion mitnehmen — solange verfügbar.";
    case "new_service":
      return "Mehr erfahren und ausprobieren.";
    case "collect_review":
      return "Kurz Bewertung schreiben — danke!";
    case "seasonal":
      return "Jetzt mitmachen.";
    case "before_after":
      return "Selbst erleben — Termin sichern.";
    case "trust_building":
      return "Ohne Druck Kontakt aufnehmen.";
    case "team_intro":
      return "Vorbeikommen und kennenlernen.";
    default:
      return "Jetzt Kontakt aufnehmen.";
  }
}

/**
 * Goal-Default-Saatzeile für den Inhalt, falls das Preset keinen
 * Match hat. Nutzt `topic` als Mittelpunkt.
 */
function goalSeed(goal: SocialPostGoal, topic: string): string {
  switch (goal) {
    case "more_appointments":
      return `Wir haben in den nächsten Wochen noch freie Termine für ${topic}.`;
    case "promote_offer":
      return `Aktion: ${topic}.`;
    case "new_service":
      return `Neu bei uns: ${topic}.`;
    case "collect_review":
      return `Sie waren zufrieden? Zwei Sätze über ${topic} helfen uns sehr.`;
    case "seasonal":
      return `Passend zur Saison: ${topic}.`;
    case "before_after":
      return `Vorher / Nachher: ${topic}.`;
    case "trust_building":
      return `Worauf wir Wert legen: ${topic}.`;
    case "team_intro":
      return `Unser Team kurz vorgestellt — heute: ${topic}.`;
    default:
      return `Heute geht es bei uns um ${topic}.`;
  }
}

/** Plattform-Stilhinweise für den Inhaltsabsatz. */
function platformFlavor(
  platform: SocialPlatform,
  city: string | undefined,
): string {
  const cityFragment = city ? ` aus ${city}` : "";
  switch (platform) {
    case "linkedin":
      return `Ein kurzer fachlicher Einblick${cityFragment}: warum dieses Thema im Alltag eines lokalen Betriebs eine Rolle spielt.`;
    case "google_business":
      return `Klar und sachlich${cityFragment} — die wichtigsten Eckdaten für Sie zusammengefasst.`;
    case "facebook":
      return `Ein Blick hinter die Kulissen${cityFragment}, ohne Marketing-Floskeln.`;
    case "instagram":
      return `Ein Moment aus dem Alltag${cityFragment} — visuell unterstützt vom Bild oben.`;
    case "whatsapp_status":
    default:
      return `Kurzes Update${cityFragment} für unsere Stammkund:innen.`;
  }
}

/** Bildidee aus `preset.imageGuidance.recommendedSubjects` + Topic. */
function buildImageIdea(
  recommendedSubjects: readonly string[],
  topic: string,
  industryLabel: string,
): string {
  const lead = recommendedSubjects[0] ?? `${industryLabel}-Alltag`;
  return clamp(
    `Nahaufnahme passend zu "${topic}" — ${lead}. Natürliches Licht, kein Stockfoto-Stil.`,
    280,
  );
}

export async function mockGenerateSocialPost(
  input: SocialPostInput,
): Promise<SocialPostOutput> {
  const parsed = SocialPostInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateSocialPost: ${parsed.error.message}`,
    );
  }
  const { context, platform, goal, topic, length, includeHashtags } =
    parsed.data;

  const preset = getPresetOrFallback(context.industryKey);
  const businessName = context.businessName;
  const city = context.city;
  const industryLabel = preset.label;

  // ---------------------------------------------------------------------
  // 1. Saatzeile (Preset-Match bevorzugt, sonst Goal-Default).
  // ---------------------------------------------------------------------
  const matched = findPresetPrompt(preset.socialPostPrompts, goal, platform);
  const seed = matched?.ideaShort ?? goalSeed(goal, topic);

  const cta = ctaFor(goal);
  const flavor = platformFlavor(platform, city);

  // ---------------------------------------------------------------------
  // 2. Kurz- und Lang-Variante bauen.
  // ---------------------------------------------------------------------
  const shortPost = clamp(`${seed} ${cta}`, 280);

  const usps = context.uniqueSellingPoints.slice(0, 3);
  const trustBlock =
    usps.length > 0
      ? `Was uns ausmacht:\n${usps.map((u) => `· ${u}`).join("\n")}`
      : "";

  const longParagraphs: string[] =
    length === "short"
      ? [seed, cta]
      : length === "long"
        ? [seed, flavor, trustBlock, cta].filter((p) => p.length > 0)
        : [seed, flavor, cta];

  const longPost = clamp(longParagraphs.join("\n\n"), 2000);

  // ---------------------------------------------------------------------
  // 3. Hashtags nach Plattform-Pattern.
  // ---------------------------------------------------------------------
  const hashtags = includeHashtags
    ? buildHashtagPool(industryLabel, businessName, city, topic).slice(
        0,
        targetHashtagCount(platform),
      )
    : [];

  // ---------------------------------------------------------------------
  // 4. Image-Idee.
  // ---------------------------------------------------------------------
  const imageIdea = buildImageIdea(
    preset.imageGuidance.recommendedSubjects,
    topic,
    industryLabel,
  );

  return SocialPostOutputSchema.parse({
    shortPost,
    longPost,
    hashtags,
    imageIdea,
    cta,
  });
}
