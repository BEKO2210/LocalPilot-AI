import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  CTA_CALL,
  CTA_WHATSAPP,
  EMAIL_FIELD,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
  PREFERRED_DATE_FIELD,
} from "../preset-helpers";

export const restaurantPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "restaurant",
  label: "Restaurant",
  pluralLabel: "Restaurants",
  description:
    "Restaurants und kleine Gastronomie ohne Branchen-Pathos. Fokus auf " +
    "Reservierungen, Speisekarte, Öffnungszeiten und Bewertungen.",
  targetAudience: ["Stammgäste", "Familien", "Geschäftsessen", "Touristen"],
  defaultTagline: "Frisch zubereitet, freundlich serviert – mitten in {{city}}.",
  defaultHeroTitle: "Gut essen. In Ruhe.",
  defaultHeroSubtitle:
    "Saisonale Karte, ruhige Atmosphäre, freundliches Team. Reservierungen empfohlen.",
  defaultCtas: [
    { key: "reservation", label: "Tisch reservieren", intent: "appointment", primary: true },
    CTA_CALL,
    CTA_WHATSAPP,
  ],
  recommendedSections: [
    "hero",
    "services",
    "benefits",
    "reviews",
    "faq",
    "contact",
    "opening_hours",
    "location",
    "gallery",
  ],
  defaultServices: [
    {
      key: "dine_in",
      title: "Mittag- & Abendkarte",
      shortDescription: "Saisonale Gerichte mit klarer Karte.",
      defaultPriceLabel: "Preise siehe Karte",
    },
    {
      key: "reservation",
      title: "Tischreservierung",
      shortDescription: "Wir halten Ihnen einen Tisch frei.",
      defaultPriceLabel: "kostenfrei",
    },
    {
      key: "groups",
      title: "Gruppen & Feiern",
      shortDescription: "Geburtstage, Familienfeiern und kleinere Anlässe.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "takeaway",
      title: "Take-away",
      shortDescription: "Vorbestellung möglich, Abholung schnell.",
      defaultPriceLabel: "Preise siehe Karte",
    },
    {
      key: "catering",
      title: "Kleines Catering",
      shortDescription: "Für Büros und Familienanlässe in der Region.",
      defaultPriceLabel: "auf Anfrage",
    },
  ],
  defaultFaqs: [
    {
      question: "Brauche ich eine Reservierung?",
      answer:
        "Wir empfehlen es, vor allem freitags und samstags. Reservieren Sie online, per Telefon oder WhatsApp.",
    },
    {
      question: "Bieten Sie vegetarische / vegane Optionen?",
      answer:
        "Ja, mehrere Gerichte sind vegetarisch oder vegan – fragen Sie gerne nach saisonalen Empfehlungen.",
    },
    {
      question: "Können Sie Allergien berücksichtigen?",
      answer:
        "Sagen Sie uns vor der Bestellung Bescheid. Wir passen die Zubereitung im Rahmen der Möglichkeiten an.",
    },
    {
      question: "Habt ihr WLAN und kinderfreundliche Plätze?",
      answer:
        "Ja, WLAN ist verfügbar. Hochstühle und Wickelraum auf Anfrage.",
    },
  ],
  defaultBenefits: [
    {
      title: "Frische Karte",
      text: "Saisonale Gerichte, klar formuliert.",
    },
    {
      title: "Ruhige Atmosphäre",
      text: "Platz zum Reden, keine Hektik.",
    },
    {
      title: "Freundlicher Service",
      text: "Aufmerksam, ohne aufdringlich zu sein.",
    },
    {
      title: "Reservierung leicht gemacht",
      text: "Online, telefonisch oder per WhatsApp.",
    },
  ],
  defaultProcessSteps: [],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    EMAIL_FIELD,
    {
      key: "guests",
      label: "Personen",
      type: "number",
      required: true,
      placeholder: "z. B. 4",
    },
    PREFERRED_DATE_FIELD,
    {
      key: "preferredTime",
      label: "Uhrzeit",
      type: "time",
      required: false,
    },
    {
      key: "occasion",
      label: "Anlass",
      type: "text",
      required: false,
      placeholder: "Optional, z. B. Geburtstag",
    },
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "whatsapp_short",
      channel: "whatsapp",
      tone: "short",
      body: "Hallo {{customerName}}, schön, dass Sie da waren. Eine kurze Google-Bewertung hilft uns sehr → {{reviewLink}}",
    },
    {
      key: "email_friendly",
      channel: "email",
      tone: "friendly",
      body: "Hallo {{customerName}},\n\nvielen Dank für Ihren Besuch. Wenn es geschmeckt hat, freuen wir uns über eine kurze Google-Bewertung:\n{{reviewLink}}\n\nBis zum nächsten Mal!",
    },
  ],
  socialPostPrompts: [
    {
      key: "seasonal",
      goal: "seasonal",
      platforms: ["instagram", "facebook", "google_business"],
      tone: "freundlich",
      ideaShort: "Saisonkarte vorstellen, Gericht der Woche.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["instagram"],
      tone: "einladend",
      ideaShort: "Mittagsangebot oder Lunch-Special bewerben.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für ein Restaurant in {{city}}. Einladend, ruhig, ohne Marketingfloskeln. Max. 7 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für ein Restaurant. Tonalität: warm, freundlich, sachlich.",
    },
  ],
  recommendedThemes: ["warm_local", "clean_light", "creative_studio"],
  recommendedPricingLabels: [
    { key: "menu", label: "siehe Karte" },
    { key: "package", label: "Pauschal" },
    { key: "from", label: "ab" },
  ],
  imageGuidance: {
    primaryStyle:
      "Natürliches Licht, echte Gerichte, ruhige Tischsituationen. Keine inszenierten Stockbilder.",
    recommendedSubjects: [
      "Gericht von oben oder leicht schräg",
      "Tisch im Restaurant",
      "Detail aus der Küche",
      "Außenansicht / Eingang",
    ],
    avoid: [
      "Übertriebene Filter und Drama-Light",
      "Stockfotos generischer Gerichte ohne Bezug zum Restaurant",
    ],
  },
  toneOfVoice: ["warm", "freundlich", "einladend", "ruhig"],
  complianceNotes: [],
});
