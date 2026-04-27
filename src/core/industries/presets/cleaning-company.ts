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

export const cleaningCompanyPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "cleaning_company",
  label: "Reinigungsfirma",
  pluralLabel: "Reinigungsfirmen",
  description:
    "Reinigungsdienstleister für Büros, Praxen, Treppenhäuser und " +
    "Privathaushalte. Fokus auf zuverlässige Termine und klare Angebote.",
  targetAudience: ["Hausverwaltungen", "Büros", "Praxen", "Privatkund:innen", "Bauunternehmen"],
  defaultTagline: "Verlässliche Reinigung – seriös, gründlich, pünktlich in {{city}}.",
  defaultHeroTitle: "Sauber, zuverlässig, pünktlich.",
  defaultHeroSubtitle:
    "Büro, Treppenhaus, Praxis oder Bauendreinigung – wir liefern faire Angebote und halten Termine.",
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
      key: "office",
      title: "Büroreinigung",
      shortDescription: "Regelmäßige Pflege Ihrer Büroräume.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "stairwell",
      title: "Treppenhausreinigung",
      shortDescription: "Wöchentlich oder monatlich, mit Nachweis.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "windows",
      title: "Fensterreinigung",
      shortDescription: "Sauber, streifenfrei, auch Rahmen und Fensterbank.",
      defaultPriceLabel: "ab 89 €",
      defaultDurationLabel: "je nach Fläche",
    },
    {
      key: "deep_clean",
      title: "Grundreinigung",
      shortDescription: "Einmalige Tiefenreinigung nach Umzug oder Renovierung.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "practice",
      title: "Praxisreinigung",
      shortDescription: "Hygiene-konform, mit Dokumentation der Reinigungsschritte.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "maintenance",
      title: "Unterhaltsreinigung",
      shortDescription: "Regelmäßiger Service nach festem Plan.",
      defaultPriceLabel: "Pauschalvertrag",
    },
    {
      key: "construction_clean",
      title: "Bauendreinigung",
      shortDescription: "Übergabefähig sauber nach Bau- oder Renovierungsphase.",
      defaultPriceLabel: "auf Anfrage",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie schnell bekomme ich ein Angebot?",
      answer:
        "Nach Ihrer Anfrage melden wir uns innerhalb von 1–2 Werktagen. Bei größeren Objekten kommen wir gerne zur Besichtigung.",
    },
    {
      question: "Sind Sie versichert?",
      answer:
        "Ja, wir verfügen über eine Betriebshaftpflicht für Schäden, die im Rahmen unserer Tätigkeit entstehen können.",
    },
    {
      question: "Wer stellt Reinigungsmittel und Geräte?",
      answer:
        "Wir bringen alles mit – auf Wunsch verwenden wir auch Ihre Produkte (z. B. wegen Allergien oder Vorgaben).",
    },
    {
      question: "Können Sie auch außerhalb der Geschäftszeiten reinigen?",
      answer:
        "Ja. Büros und Praxen reinigen wir oft früh morgens oder abends, damit Ihr Betrieb nicht gestört wird.",
    },
  ],
  defaultBenefits: [
    {
      title: "Zuverlässig",
      text: "Termine werden eingehalten, Krankheitsausfälle abgedeckt.",
    },
    {
      title: "Faire Angebote",
      text: "Klare Preise nach Fläche, Frequenz und Aufwand.",
    },
    {
      title: "Versichert",
      text: "Betriebshaftpflicht inklusive.",
    },
    {
      title: "Individuell",
      text: "Reinigungsplan passend zu Ihrem Objekt und Rhythmus.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Objekt beschreiben",
      text: "Art, Fläche und gewünschte Frequenz angeben.",
    },
    {
      step: 2,
      title: "Angebot erhalten",
      text: "Schriftliches Angebot inkl. Reinigungsplan.",
    },
    {
      step: 3,
      title: "Start nach Termin",
      text: "Übernahme, Einweisung und sauberer erster Einsatz.",
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
        { value: "office", label: "Büro" },
        { value: "stairwell", label: "Treppenhaus" },
        { value: "practice", label: "Praxis" },
        { value: "private", label: "Privat" },
        { value: "construction", label: "Bauendreinigung" },
        { value: "other", label: "Sonstiges" },
      ],
    },
    {
      key: "areaSqm",
      label: "Fläche (m²)",
      type: "number",
      required: false,
      placeholder: "Optional",
    },
    {
      key: "frequency",
      label: "Gewünschte Frequenz",
      type: "select",
      required: false,
      options: [
        { value: "once", label: "Einmalig" },
        { value: "weekly", label: "Wöchentlich" },
        { value: "biweekly", label: "Alle 2 Wochen" },
        { value: "monthly", label: "Monatlich" },
      ],
    },
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "email_short",
      channel: "email",
      tone: "short",
      body: "Hallo {{customerName}},\n\nvielen Dank für Ihr Vertrauen. Wenn Sie zufrieden waren, freuen wir uns sehr über eine kurze Google-Bewertung: {{reviewLink}}",
    },
    {
      key: "email_friendly",
      channel: "email",
      tone: "friendly",
      body: "Hallo {{customerName}},\n\nwir hoffen, alles ist sauber und passend abgeliefert. Falls Sie zufrieden waren, würde uns eine kurze Bewertung sehr helfen:\n{{reviewLink}}\n\nFalls etwas nicht ok war, melden Sie sich bitte direkt bei uns.",
    },
  ],
  socialPostPrompts: [
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["facebook", "google_business"],
      tone: "seriös",
      ideaShort: "Vorher/Nachher einer Grundreinigung – mit Erlaubnis.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["google_business"],
      tone: "sachlich",
      ideaShort: "Frühlingsaktion: Fensterreinigung im April.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Schreibe eine sachliche, vertrauenserweckende Headline für eine Reinigungsfirma in {{city}}. Max. 8 Wörter, ohne Buzzwords.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 90 Wörter) für eine Reinigungsfirma. Tonalität: seriös, freundlich. Keine Übertreibungen, keine Garantien.",
    },
  ],
  recommendedThemes: ["clean_light", "craftsman_solid", "medical_clean"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "on_request", label: "auf Anfrage" },
    { key: "package", label: "Pauschal" },
  ],
  imageGuidance: {
    primaryStyle:
      "Helle, klare Räume nach Reinigung. Keine inszenierten Stockfotos.",
    recommendedSubjects: [
      "Aufgeräumte Büroflächen",
      "Saubere Treppenhäuser, Fensterfronten",
      "Reinigungsteam in Aktion",
    ],
    avoid: [
      "Übertriebene Sauberkeitsversprechen",
      "Vorher/Nachher-Bilder ohne Einverständnis",
    ],
  },
  toneOfVoice: ["seriös", "zuverlässig", "klar", "freundlich"],
  complianceNotes: [],
});
