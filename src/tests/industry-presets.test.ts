/**
 * Smoketest für die Branchen-Presets aus Session 4.
 *
 * Wie die anderen Smoketests in diesem Ordner: jede Assertion ist ein
 * direkter `if (...) throw`. Damit greifen sowohl `tsc --noEmit` als auch
 * ein späterer Vitest-Lauf, sobald wir den Runner in Session 20 ergänzen.
 */

import { z } from "zod";
import {
  PRESET_REGISTRY,
  UnknownIndustryError,
  getAllPresets,
  getPreset,
  getPresetOrFallback,
  getPresetsForTheme,
  hasPreset,
  listMissingPresetKeys,
  listPresetKeys,
} from "@/core/industries";
import { getFallbackPreset } from "@/core/industries/fallback-preset";
import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import { IndustryKeySchema } from "@/core/validation/common.schema";
import { INDUSTRY_KEYS, type IndustryKey } from "@/types/common";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Industry preset assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Mindestabdeckung: ≥ 10 Presets gemäß Akzeptanzkriterium
// ---------------------------------------------------------------------------

const presetKeys = listPresetKeys();
assert(presetKeys.length >= 10, `mindestens 10 Presets, aktuell: ${presetKeys.length}`);

// Jeder registrierte Schlüssel muss ein gültiger IndustryKey sein.
for (const key of presetKeys) {
  IndustryKeySchema.parse(key);
}

// ---------------------------------------------------------------------------
// Schema-Konsistenz: jedes Preset wird beim Laden zwar schon geparst,
// hier zur Sicherheit nochmals zentral.
// ---------------------------------------------------------------------------

const allPresets = getAllPresets();
assert(allPresets.length === presetKeys.length, "getAllPresets matcht presetKeys");

for (const preset of allPresets) {
  IndustryPresetSchema.parse(preset);
  assert(preset.label.length > 0, `${preset.key}: hat Label`);
  assert(preset.defaultServices.length >= 1, `${preset.key}: ≥1 Default-Service`);
  assert(preset.defaultFaqs.length >= 1, `${preset.key}: ≥1 Default-FAQ`);
  assert(preset.defaultBenefits.length >= 1, `${preset.key}: ≥1 Default-Benefit`);
  assert(preset.leadFormFields.length >= 2, `${preset.key}: ≥2 Lead-Felder`);
  assert(
    preset.reviewRequestTemplates.length >= 1,
    `${preset.key}: ≥1 Bewertungs-Vorlage`,
  );
  assert(
    preset.socialPostPrompts.length >= 1,
    `${preset.key}: ≥1 Social-Prompt`,
  );
  assert(
    preset.recommendedThemes.length >= 1,
    `${preset.key}: ≥1 empfohlenes Theme`,
  );
}

// ---------------------------------------------------------------------------
// Lead-Felder: jedes Preset enthält ein `name`- und ein `phone`-Feld
// ---------------------------------------------------------------------------

for (const preset of allPresets) {
  const fieldKeys = preset.leadFormFields.map((f) => f.key);
  assert(fieldKeys.includes("name"), `${preset.key}: hat name-Feld`);
  assert(fieldKeys.includes("phone"), `${preset.key}: hat phone-Feld`);
}

// ---------------------------------------------------------------------------
// Bewertungsvorlagen enthalten Platzhalter für Kunde/Link
// ---------------------------------------------------------------------------

for (const preset of allPresets) {
  for (const tpl of preset.reviewRequestTemplates) {
    assert(
      tpl.body.includes("{{customerName}}"),
      `${preset.key}/${tpl.key}: Vorlage nutzt customerName-Platzhalter`,
    );
    assert(
      tpl.body.includes("{{reviewLink}}"),
      `${preset.key}/${tpl.key}: Vorlage nutzt reviewLink-Platzhalter`,
    );
  }
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

assert(hasPreset("hairdreser" as IndustryKey) === false, "Tippfehler-Key wird nicht erkannt");
assert(hasPreset("hairdresser") === true, "Friseur ist hinterlegt");

const friseur = getPreset("hairdresser");
assert(friseur.key === "hairdresser", "getPreset liefert das passende Objekt");

// Unbekannter Key → Fehler
let threw = false;
try {
  // wir wählen bewusst einen nicht in INDUSTRY_KEYS enthaltenen Wert.
  // TypeScript verbietet das eigentlich – Cast ist hier in Ordnung,
  // weil wir das Laufzeitverhalten testen.
  getPreset("definitely_not_a_real_key" as IndustryKey);
} catch (error) {
  threw = error instanceof UnknownIndustryError;
}
assert(threw, "getPreset wirft UnknownIndustryError bei unbekannten Keys");

// Fallback liefert immer einen gültigen Datensatz, mit gespiegeltem Key.
// Der Key wird als „originalKey" gespiegelt, daher kann hier kein
// `IndustryKeySchema.parse` darauf laufen — stattdessen prüfen wir
// die übrigen Pflichtfelder direkt.
const unknown = getPresetOrFallback("definitely_not_a_real_key" as IndustryKey);
assert(
  unknown.key === ("definitely_not_a_real_key" as IndustryKey),
  "Fallback spiegelt den ursprünglichen Key",
);
assert(
  typeof unknown.label === "string" && unknown.label.length > 0,
  "Fallback hat ein Label",
);
assert(
  Array.isArray(unknown.defaultServices) && unknown.defaultServices.length > 0,
  "Fallback hat defaultServices",
);
assert(
  Array.isArray(unknown.toneOfVoice) && unknown.toneOfVoice.length > 0,
  "Fallback hat toneOfVoice",
);
assert(
  Array.isArray(unknown.defaultFaqs) && unknown.defaultFaqs.length > 0,
  "Fallback hat defaultFaqs",
);

// Auch der direkte Aufruf liefert ein valides Preset.
const fallbackDirect = getFallbackPreset("hairdresser");
IndustryPresetSchema.parse(fallbackDirect);
assert(fallbackDirect.key === "hairdresser", "getFallbackPreset spiegelt den Key");

// ---------------------------------------------------------------------------
// Theme-Filter
// ---------------------------------------------------------------------------

const cleanLightPresets = getPresetsForTheme("clean_light");
assert(cleanLightPresets.length > 0, "≥1 Preset empfiehlt clean_light");

// ---------------------------------------------------------------------------
// Lückenliste: alle in INDUSTRY_KEYS hinterlegten, aber nicht in
// PRESET_REGISTRY abgebildeten Schlüssel sind sichtbar.
// Damit erkennt das Team auf einen Blick, welche Branchen noch fehlen.
// ---------------------------------------------------------------------------

const missing = listMissingPresetKeys();
const expected = INDUSTRY_KEYS.filter((k) => !PRESET_REGISTRY[k]);
assert(
  missing.length === expected.length,
  "listMissingPresetKeys gleich groß wie erwartete Lücken",
);

// ---------------------------------------------------------------------------
// Compliance: medizin-/pflegenahe Branchen MÜSSEN einen "no medical promise"-
// Hinweis enthalten. Wir prüfen das explizit für Kosmetik/Nail/Trainer.
// ---------------------------------------------------------------------------

const medicalSchema = z.object({
  topic: z.literal("medical"),
  note: z.string().min(10),
});

for (const key of ["cosmetic_studio", "nail_studio", "personal_trainer"] as const) {
  const preset = getPreset(key);
  const hasMedicalNote = preset.complianceNotes.some(
    (note) => medicalSchema.safeParse(note).success,
  );
  assert(hasMedicalNote, `${key}: enthält medical-Compliance-Hinweis`);
}

export const __INDUSTRY_PRESETS_SMOKETEST__ = {
  presetCount: allPresets.length,
  missingCount: missing.length,
  cleanLightPresetCount: cleanLightPresets.length,
};
