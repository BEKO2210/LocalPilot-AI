import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  CTA_CALL,
  CTA_CALLBACK,
  CTA_QUOTE,
  EMAIL_FIELD,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
} from "../preset-helpers";

export const painterPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "painter",
  label: "Malerbetrieb",
  pluralLabel: "Malerbetriebe",
  description:
    "Maler- und Lackierbetriebe für Innen- und Außenarbeiten. Saubere " +
    "Vorbereitung, klare Termine, transparente Angebote.",
  targetAudience: ["Privatkund:innen", "Hausverwaltungen", "Vermieter:innen", "Gewerbekund:innen"],
  defaultTagline: "Frische Wände, saubere Übergabe – Malerarbeiten in {{city}}.",
  defaultHeroTitle: "Klare Linien. Saubere Wände.",
  defaultHeroSubtitle:
    "Innen, außen, Lackierung – wir liefern abgestimmte Farben, geschützte Böden und termintreue Arbeit.",
  defaultCtas: [CTA_QUOTE, CTA_CALLBACK, CTA_CALL],
  recommendedSections: [
    "hero",
    "services",
    "benefits",
    "process",
    "reviews",
    "faq",
    "contact",
    "location",
  ],
  defaultServices: [
    {
      key: "interior_painting",
      title: "Innenmalerarbeiten",
      shortDescription: "Wände, Decken, Türen – sauber gestrichen.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "exterior_painting",
      title: "Fassadenarbeiten",
      shortDescription: "Außenanstrich mit passender Vorbereitung.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "wallpapering",
      title: "Tapezieren",
      shortDescription: "Vlies, Raufaser, Designtapeten.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "lacquering",
      title: "Lackierung",
      shortDescription: "Türen, Heizkörper, Treppen.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "renovation",
      title: "Renovierung nach Auszug",
      shortDescription: "Wohnung übergabefähig vorbereiten.",
      defaultPriceLabel: "auf Anfrage",
    },
  ],
  defaultFaqs: [
    {
      question: "Was kostet ein Anstrich?",
      answer:
        "Das hängt von Fläche, Untergrund und gewünschter Farbe ab. Nach einer kurzen Aufnahme bekommen Sie ein schriftliches Angebot.",
    },
    {
      question: "Räumen Sie Möbel weg?",
      answer:
        "Wir decken Möbel und Böden sorgfältig ab. Größere Möbel verschieben wir auf Wunsch gegen Aufpreis.",
    },
    {
      question: "Bringen Sie die Farbe mit?",
      answer:
        "Ja. Auf Wunsch zeigen wir Farbmuster und ordern direkt. Eigene Farbe ist auch möglich.",
    },
    {
      question: "Wie lange dauert ein Wohnungsanstrich?",
      answer:
        "Eine Standard-Wohnung mit zwei Zimmern ist meist in 2–3 Werktagen fertig.",
    },
  ],
  defaultBenefits: [
    {
      title: "Saubere Vorbereitung",
      text: "Boden- und Möbelschutz, klare Abdeckungen.",
    },
    {
      title: "Klare Angebote",
      text: "Schriftlich mit Farbart und Stundensatz.",
    },
    {
      title: "Termintreu",
      text: "Wir halten zugesagte Slots ein.",
    },
    {
      title: "Beratung zu Farben",
      text: "Wir helfen bei der Auswahl, ohne zu überreden.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Anfrage",
      text: "Räume kurz beschreiben oder Fotos schicken.",
    },
    {
      step: 2,
      title: "Aufnahme & Angebot",
      text: "Vor Ort oder digital – schriftliches Angebot.",
    },
    {
      step: 3,
      title: "Ausführung",
      text: "Sauberes Arbeiten, abschließende Kontrolle, klare Übergabe.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    EMAIL_FIELD,
    {
      key: "objectType",
      label: "Art des Objekts",
      type: "select",
      required: true,
      options: [
        { value: "apartment", label: "Wohnung" },
        { value: "house", label: "Haus" },
        { value: "office", label: "Büro" },
        { value: "facade", label: "Fassade" },
      ],
    },
    {
      key: "areaSqm",
      label: "Fläche (m²) – falls bekannt",
      type: "number",
      required: false,
    },
    {
      key: "concern",
      label: "Anliegen",
      type: "textarea",
      required: true,
      placeholder: "z. B. Wohnzimmer + Schlafzimmer streichen, Wände weiß.",
    },
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "email_friendly",
      channel: "email",
      tone: "friendly",
      body: "Hallo {{customerName}},\n\nvielen Dank, dass wir für Sie streichen durften. Wenn alles passend ist, hilft uns eine kurze Google-Bewertung sehr:\n{{reviewLink}}",
    },
    {
      key: "whatsapp_short",
      channel: "whatsapp",
      tone: "short",
      body: "Hallo {{customerName}}, ist alles ok? Wenn ja: 30 Sekunden Bewertung → {{reviewLink}} Vielen Dank!",
    },
  ],
  socialPostPrompts: [
    {
      key: "before_after",
      goal: "before_after",
      platforms: ["facebook", "instagram"],
      tone: "klar",
      ideaShort: "Vorher/Nachher eines Raums – mit Erlaubnis.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["google_business"],
      tone: "sachlich",
      ideaShort: "Frühlings-Aktion: schnelle Termine für Wohnungsanstriche.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für einen Malerbetrieb in {{city}}. Klar, sachlich, max. 8 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für einen Malerbetrieb. Tonalität: sauber, ehrlich, sachlich.",
    },
  ],
  recommendedThemes: ["craftsman_solid", "clean_light", "warm_local"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "on_request", label: "auf Anfrage" },
  ],
  imageGuidance: {
    primaryStyle:
      "Helle, klare Räume mit frischer Farbe. Reale Baustellen statt Stockfotos.",
    recommendedSubjects: [
      "Vorbereitung (Abdeckungen, Tape)",
      "Wandfläche im Anstrich",
      "Übergabefähig fertiges Zimmer",
    ],
    avoid: [
      "Aufdringliche Filter",
      "Posierte Models statt echtem Team",
    ],
  },
  toneOfVoice: ["sauber", "ehrlich", "sachlich", "verlässlich"],
  complianceNotes: [],
});
