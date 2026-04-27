/**
 * Fallback-Preset für unbekannte oder noch nicht modellierte Branchen.
 *
 * Wird vom Registry zurückgegeben, wenn `getPresetOrFallback(key)` mit einem
 * Key aufgerufen wird, der (noch) nicht hinterlegt ist. Die Texte sind
 * branchenneutral und sicher – ein Betrieb kann damit sofort live gehen,
 * während der echte Preset noch ergänzt wird.
 *
 * Wichtig: Das Fallback-Preset behält den ursprünglich gewünschten `key`
 * NICHT bei – es nutzt einen festen Wert (`auto_workshop`), weil Zod das
 * Enum-Feld `key` zwingend braucht. Aufrufer sollten daher mit
 * `getFallbackPreset(originalKey)` arbeiten, der das `key`-Feld auf den
 * vom Aufrufer gewünschten Wert spiegelt.
 */

import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryKey } from "@/types/common";
import type { IndustryPreset } from "@/types/industry";
import {
  CTA_CALL,
  CTA_QUOTE,
  CTA_WHATSAPP,
  EMAIL_FIELD,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
} from "./preset-helpers";

const BASE_FALLBACK: IndustryPreset = IndustryPresetSchema.parse({
  // Wir wählen einen existierenden Key. Beim Cloning über
  // `getFallbackPreset()` wird das überschrieben.
  key: "auto_workshop",
  label: "Betrieb",
  pluralLabel: "Betriebe",
  description:
    "Universelles Preset für lokale Betriebe ohne spezifische Branchenvorlage. " +
    "Liefert eine sichere Basis mit Anfrage, Bewertung und Sichtbarkeit.",
  targetAudience: ["Privatkund:innen", "Stammkundschaft", "Geschäftskund:innen"],
  defaultTagline: "Verlässlicher Service direkt in {{city}}.",
  defaultHeroTitle: "Verlässlich. Persönlich. Vor Ort.",
  defaultHeroSubtitle:
    "Wir bieten unseren Service mit klarer Kommunikation und fairen Preisen. Schreiben Sie uns – wir melden uns zeitnah.",
  defaultCtas: [CTA_QUOTE, CTA_CALL, CTA_WHATSAPP],
  recommendedSections: [
    "hero",
    "services",
    "benefits",
    "reviews",
    "faq",
    "contact",
    "opening_hours",
    "location",
  ],
  defaultServices: [
    {
      key: "primary_service",
      title: "Hauptleistung",
      shortDescription: "Bitte mit Ihrer wichtigsten Leistung füllen.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "secondary_service",
      title: "Weitere Leistung",
      shortDescription: "Eine zweite typische Leistung Ihres Betriebs.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "consultation",
      title: "Beratung",
      shortDescription: "Erstgespräch oder unverbindliche Klärung.",
      defaultPriceLabel: "kostenfrei",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie kann ich Sie erreichen?",
      answer:
        "Telefonisch, per E-Mail oder über das Kontaktformular. Wir melden uns in der Regel innerhalb eines Werktags.",
    },
    {
      question: "Was kostet eine Anfrage?",
      answer:
        "Eine erste Anfrage und ein unverbindliches Angebot sind kostenfrei.",
    },
    {
      question: "Arbeiten Sie auch außerhalb von {{city}}?",
      answer:
        "Ja, im näheren Umkreis. Größere Strecken besprechen wir individuell.",
    },
  ],
  defaultBenefits: [
    {
      title: "Verlässlich",
      text: "Termine werden eingehalten, Rückmeldungen sind klar.",
    },
    {
      title: "Persönlich",
      text: "Direkter Ansprechpartner statt Hotline.",
    },
    {
      title: "Faire Preise",
      text: "Schriftliches Angebot vor der Arbeit.",
    },
    {
      title: "Lokal verwurzelt",
      text: "Kurze Wege, regionale Kundschaft.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Anfrage",
      text: "Beschreiben Sie Ihr Anliegen – wir melden uns zeitnah.",
    },
    {
      step: 2,
      title: "Klärung",
      text: "Kurze Abstimmung zu Aufwand, Kosten und Termin.",
    },
    {
      step: 3,
      title: "Umsetzung",
      text: "Saubere Ausführung mit klarer Übergabe.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    EMAIL_FIELD,
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "whatsapp_short",
      channel: "whatsapp",
      tone: "short",
      body: "Hallo {{customerName}}, vielen Dank! Eine kurze Google-Bewertung hilft uns sehr → {{reviewLink}}",
    },
    {
      key: "email_friendly",
      channel: "email",
      tone: "friendly",
      body: "Hallo {{customerName}},\n\nwir hoffen, alles war zu Ihrer Zufriedenheit. Wenn Sie 30 Sekunden Zeit haben, freuen wir uns über eine kurze Google-Bewertung:\n{{reviewLink}}\n\nFalls etwas nicht gepasst hat, antworten Sie bitte direkt auf diese E-Mail.",
    },
  ],
  socialPostPrompts: [
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["facebook", "google_business"],
      tone: "freundlich",
      ideaShort: "Kurze Vorstellung des Betriebs und seines Teams.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["facebook", "instagram"],
      tone: "klar",
      ideaShort: "Aktuelle Aktion oder Saisonhinweis vorstellen.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Schreibe eine sachliche, einladende Headline für einen lokalen Betrieb in {{city}}. Branche unspezifisch. Max. 8 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für einen lokalen Betrieb. Tonalität: freundlich, klar, ehrlich. Keine Buzzwords.",
    },
  ],
  recommendedThemes: ["clean_light", "warm_local", "craftsman_solid"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "on_request", label: "auf Anfrage" },
  ],
  imageGuidance: {
    primaryStyle:
      "Authentische Bilder aus dem Betrieb. Echte Mitarbeitende, klare Räume, kein generisches Stockmaterial.",
    recommendedSubjects: [
      "Außenansicht / Eingang",
      "Team in Aktion",
      "Detail aus dem Service",
    ],
    avoid: [
      "Generische Stockfotos ohne Bezug",
      "Versprechen oder Garantien als Bildunterschrift",
    ],
  },
  toneOfVoice: ["freundlich", "klar", "verlässlich"],
  complianceNotes: [],
});

/**
 * Liefert das Fallback-Preset, wobei das `key`-Feld auf den vom Aufrufer
 * angefragten Branchenschlüssel gespiegelt wird – damit nachgelagerte UI
 * konsistent über die Branche sprechen kann, auch wenn die Inhalte generisch
 * sind.
 */
export function getFallbackPreset(originalKey: IndustryKey): IndustryPreset {
  return { ...BASE_FALLBACK, key: originalKey };
}

export const FALLBACK_PRESET_BASE = BASE_FALLBACK;
