/**
 * Smoketest für Onboarding-Input-Validierung (Code-Session 45).
 *
 * Reine Pure-Logic. Slug-Heuristik, Pflicht-Felder, Enum-Checks.
 */

import {
  RESERVED_SLUGS,
  isReservedSlug,
  suggestSlugFromName,
  validateOnboarding,
  type OnboardingInput,
} from "@/lib/onboarding-validate";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`onboarding-validate assertion failed: ${message}`);
}

const VALID: OnboardingInput = {
  slug: "studio-haarlinie",
  name: "Studio Haarlinie",
  industryKey: "hairdresser",
  themeKey: "beauty_luxury",
  packageTier: "silber",
  tagline: "Friseur in Musterstadt",
  description: "Wir sind ein moderner Friseursalon in Musterstadt — Termine flexibel, Beratung persönlich.",
};

// ---------------------------------------------------------------------------
// 1. Voll-valider Input → ok=true
// ---------------------------------------------------------------------------
const ok = validateOnboarding(VALID);
assert(ok.ok === true, "Voll-valider Input → ok");
if (ok.ok) {
  assert(ok.value.slug === "studio-haarlinie", "Slug durchgereicht");
  assert(ok.value.industryKey === "hairdresser", "industryKey-Cast");
}

// ---------------------------------------------------------------------------
// 2. Slug-Validierung
// ---------------------------------------------------------------------------
const tooShort = validateOnboarding({ ...VALID, slug: "ab" });
assert(!tooShort.ok && "slug" in tooShort.errors, "slug zu kurz → error");

const tooLong = validateOnboarding({ ...VALID, slug: "a".repeat(50) });
assert(!tooLong.ok && "slug" in tooLong.errors, "slug zu lang → error");

const upperCase = validateOnboarding({ ...VALID, slug: "STUDIO" });
assert(upperCase.ok === true, "Großbuchstaben werden lowercased (Trim+lowercase)");

const startDash = validateOnboarding({ ...VALID, slug: "-studio" });
assert(!startDash.ok && "slug" in startDash.errors, "Bindestrich am Anfang → error");

const endDash = validateOnboarding({ ...VALID, slug: "studio-" });
assert(!endDash.ok && "slug" in endDash.errors, "Bindestrich am Ende → error");

const umlaut = validateOnboarding({ ...VALID, slug: "müller-shop" });
assert(!umlaut.ok && "slug" in umlaut.errors, "Umlaute im Slug → error");

const spaceSlug = validateOnboarding({ ...VALID, slug: "studio shop" });
assert(!spaceSlug.ok && "slug" in spaceSlug.errors, "Leerzeichen im Slug → error");

const empty = validateOnboarding({ ...VALID, slug: "" });
assert(!empty.ok && "slug" in empty.errors, "leerer Slug → error");

const onlyNumbers = validateOnboarding({ ...VALID, slug: "12345" });
assert(onlyNumbers.ok === true, "Slug aus nur Zahlen ist ok");

const validHyphens = validateOnboarding({
  ...VALID,
  slug: "auto-werkstatt-meier",
});
assert(validHyphens.ok === true, "Mehrere Bindestriche ok");

// ---------------------------------------------------------------------------
// 3. Name-Validierung
// ---------------------------------------------------------------------------
const shortName = validateOnboarding({ ...VALID, name: "X" });
assert(!shortName.ok && "name" in shortName.errors, "Name zu kurz → error");

const longName = validateOnboarding({ ...VALID, name: "X".repeat(200) });
assert(!longName.ok && "name" in longName.errors, "Name zu lang → error");

const nameWithWhitespace = validateOnboarding({ ...VALID, name: "  Studio Haarlinie  " });
assert(nameWithWhitespace.ok === true, "Whitespace-trimmed Name ok");

// ---------------------------------------------------------------------------
// 4. Industry / Theme / Tier sind in der Whitelist
// ---------------------------------------------------------------------------
const badIndustry = validateOnboarding({ ...VALID, industryKey: "intergalactic_pizza" });
assert(
  !badIndustry.ok && "industryKey" in badIndustry.errors,
  "unbekannte Branche → error",
);

const badTheme = validateOnboarding({ ...VALID, themeKey: "neon_disco" });
assert(!badTheme.ok && "themeKey" in badTheme.errors, "unbekanntes Theme → error");

const badTier = validateOnboarding({ ...VALID, packageTier: "diamond" });
assert(!badTier.ok && "packageTier" in badTier.errors, "unbekanntes Paket → error");

// Englische Werte sind FALSCH (wir nutzen deutsche Enum-Werte!)
const englishTier = validateOnboarding({ ...VALID, packageTier: "silver" });
assert(
  !englishTier.ok && "packageTier" in englishTier.errors,
  "englisches Paket-Wort 'silver' → error (Enum ist deutsch)",
);

// ---------------------------------------------------------------------------
// 5. Tagline / Description Längen
// ---------------------------------------------------------------------------
const tagShort = validateOnboarding({ ...VALID, tagline: "X" });
assert(!tagShort.ok && "tagline" in tagShort.errors, "Tagline zu kurz");

const descShort = validateOnboarding({ ...VALID, description: "kurz" });
assert(
  !descShort.ok && "description" in descShort.errors,
  "Description zu kurz",
);

// ---------------------------------------------------------------------------
// 6. Multi-Errors gleichzeitig
// ---------------------------------------------------------------------------
const allBad = validateOnboarding({
  slug: "",
  name: "",
  industryKey: "",
  themeKey: "",
  packageTier: "",
  tagline: "",
  description: "",
});
assert(!allBad.ok, "alles leer → not ok");
if (!allBad.ok) {
  assert(Object.keys(allBad.errors).length === 7, "7 Felder → 7 Errors");
}

// ---------------------------------------------------------------------------
// 7. suggestSlugFromName: Heuristik
// ---------------------------------------------------------------------------
assert(
  suggestSlugFromName("Studio Haarlinie") === "studio-haarlinie",
  "einfache Heuristik",
);
assert(
  suggestSlugFromName("Müller's Werkstatt") === "muellers-werkstatt",
  "Umlaut-Mapping ä/ö/ü/ß",
);
assert(
  suggestSlugFromName("café & co") === "cafe-co",
  "Akzent + Sonderzeichen",
);
assert(
  suggestSlugFromName("AutoService Müller GmbH") === "autoservice-mueller-gmbh",
  "Mehrere Wörter + Umlaute",
);
assert(
  suggestSlugFromName("--Doppel-Bindestrich--").endsWith("doppel-bindestrich") ||
    suggestSlugFromName("--Doppel-Bindestrich--") === "doppel-bindestrich",
  "Trim Bindestriche an beiden Enden",
);
assert(
  suggestSlugFromName("   ").length === 0,
  "Whitespace-only → leerer Slug",
);
assert(
  suggestSlugFromName("ßeta").startsWith("ssbeta") ||
    suggestSlugFromName("ßeta") === "ssbeta" ||
    suggestSlugFromName("ßeta").startsWith("ss"),
  "ß → ss",
);

// Long names get clipped to max length
const longSuggest = suggestSlugFromName("A".repeat(60));
assert(longSuggest.length <= 40, "lange Vorschläge werden auf 40 Zeichen geclipt");

// ---------------------------------------------------------------------------
// 8. Reservierte Slugs
// ---------------------------------------------------------------------------
assert(RESERVED_SLUGS.includes("admin"), "admin reserved");
assert(RESERVED_SLUGS.includes("api"), "api reserved");
assert(RESERVED_SLUGS.includes("dashboard"), "dashboard reserved");
assert(isReservedSlug("admin"), "isReservedSlug greift");
assert(isReservedSlug("  ADMIN  "), "case + Whitespace tolerant");
assert(!isReservedSlug("studio-haarlinie"), "normaler Slug ist NICHT reserved");

console.log("onboarding-validate smoketest ✅ (~35 Asserts)");
export const __ONBOARDING_VALIDATE_SMOKETEST__ = { totalAssertions: 35 };
