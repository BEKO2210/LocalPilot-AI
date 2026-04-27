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

export const craftsmanGeneralPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "craftsman_general",
  label: "Handwerker",
  pluralLabel: "Handwerksbetriebe",
  description:
    "Handwerksbetriebe für Renovierung, Sanierung und kleinere Bauarbeiten. " +
    "Fokus auf seriöse Anfragen, klare Angebote und verlässliche Termine.",
  targetAudience: ["Privatkund:innen", "Hausverwaltungen", "Mieter:innen", "Eigentümer:innen"],
  defaultTagline: "Handwerk in {{city}} – ehrlich, sauber, termintreu.",
  defaultHeroTitle: "Solide Arbeit. Saubere Ausführung.",
  defaultHeroSubtitle:
    "Renovierung, Reparatur und Umbau. Termine in absehbarer Zeit, verständliche Angebote.",
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
      key: "renovation",
      title: "Renovierung",
      shortDescription: "Wand, Boden, Decke – sauber abgeschlossen.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "small_repairs",
      title: "Kleine Reparaturen",
      shortDescription: "Schnell und unkompliziert für Wohnung oder Haus.",
      defaultPriceLabel: "ab 79 €",
      defaultDurationLabel: "ab 1 Std.",
    },
    {
      key: "drywall",
      title: "Trockenbau",
      shortDescription: "Wände, Decken, Dachausbau.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "tiling",
      title: "Fliesenarbeiten",
      shortDescription: "Bad, Küche, Boden – sauber verlegt.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "doors_windows",
      title: "Türen & Fenster",
      shortDescription: "Justieren, einbauen, abdichten.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "small_construction",
      title: "Kleinere Umbauten",
      shortDescription: "Durchbrüche, Anpassungen, Sondergrößen.",
      defaultPriceLabel: "auf Anfrage",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie lange dauert ein Angebot?",
      answer:
        "Nach einer Vor-Ort-Aufnahme oder mit Fotos und Maßen melden wir uns innerhalb weniger Werktage mit einem schriftlichen Angebot.",
    },
    {
      question: "Räumen Sie sauber auf?",
      answer:
        "Ja. Material, Werkzeug und Reste werden ordentlich entsorgt. Wir hinterlassen die Baustelle aufgeräumt.",
    },
    {
      question: "Übernehmen Sie auch kleine Aufträge?",
      answer:
        "Ja, auch eine einzelne Reparatur. Wir versuchen, kleinere Aufträge passend in den Werkstatttag einzubauen.",
    },
    {
      question: "Sind Sie versichert?",
      answer:
        "Ja, mit Betriebshaftpflicht. Bei Unklarheiten zeigen wir Ihnen gerne den Nachweis.",
    },
  ],
  defaultBenefits: [
    {
      title: "Klare Angebote",
      text: "Schriftlich, mit Stundensatz und Materialliste.",
    },
    {
      title: "Pünktlich",
      text: "Wir melden uns, falls sich etwas verschiebt.",
    },
    {
      title: "Saubere Übergabe",
      text: "Aufgeräumte Baustelle und kurze Einweisung.",
    },
    {
      title: "Versichert",
      text: "Betriebshaftpflicht inklusive.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Anfrage",
      text: "Beschreiben Sie das Vorhaben – gerne mit Fotos.",
    },
    {
      step: 2,
      title: "Aufnahme",
      text: "Vor Ort oder telefonisch, kurze Bestandsaufnahme.",
    },
    {
      step: 3,
      title: "Angebot & Termin",
      text: "Schriftliches Angebot, danach Terminvereinbarung.",
    },
    {
      step: 4,
      title: "Ausführung",
      text: "Saubere Arbeit, klare Kommunikation, finale Übergabe.",
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
        { value: "other", label: "Sonstiges" },
      ],
    },
    {
      key: "concern",
      label: "Anliegen",
      type: "textarea",
      required: true,
      placeholder: "z. B. Bad neu fliesen, ca. 8 m².",
    },
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "email_friendly",
      channel: "email",
      tone: "friendly",
      body: "Hallo {{customerName}},\n\nvielen Dank, dass wir für Sie arbeiten durften. Wenn Sie zufrieden waren, hilft uns eine kurze Google-Bewertung sehr:\n{{reviewLink}}\n\nFalls etwas nicht in Ordnung war, melden Sie sich bitte direkt bei uns.",
    },
    {
      key: "whatsapp_short",
      channel: "whatsapp",
      tone: "short",
      body: "Hallo {{customerName}}, alles passend bei Ihnen? Eine kurze Google-Bewertung wäre eine große Hilfe: {{reviewLink}}",
    },
  ],
  socialPostPrompts: [
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["facebook", "google_business"],
      tone: "sachlich",
      ideaShort: "Kurze Vorstellung des Teams und einer aktuellen Baustelle.",
    },
    {
      key: "before_after",
      goal: "before_after",
      platforms: ["facebook"],
      tone: "klar",
      ideaShort: "Vorher/Nachher einer Renovierung – mit Erlaubnis.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für einen Handwerksbetrieb in {{city}}. Sachlich, klar, ohne Marketingfloskeln. Max. 8 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für einen Handwerksbetrieb. Tonalität: bodenständig, ehrlich, sachlich.",
    },
  ],
  recommendedThemes: ["craftsman_solid", "clean_light", "automotive_strong"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "on_request", label: "auf Anfrage" },
  ],
  imageGuidance: {
    primaryStyle:
      "Authentische Baustellen- oder Werkstattfotos, klare Werkzeuge, saubere Ergebnisse.",
    recommendedSubjects: [
      "Werkzeug im Einsatz",
      "Vorher/Nachher einer Arbeit",
      "Team in Schutzkleidung",
    ],
    avoid: [
      "Stockfotos mit überstilisierten Handwerkern",
      "Fremde Marken-Logos",
    ],
  },
  toneOfVoice: ["bodenständig", "ehrlich", "sachlich", "verlässlich"],
  complianceNotes: [],
});
