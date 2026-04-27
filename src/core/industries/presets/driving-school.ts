import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  CTA_APPOINTMENT_PRIMARY,
  CTA_CALL,
  CTA_WHATSAPP,
  EMAIL_FIELD,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
} from "../preset-helpers";

export const drivingSchoolPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "driving_school",
  label: "Fahrschule",
  pluralLabel: "Fahrschulen",
  description:
    "Fahrschulen für PKW (Klasse B), Auffrischung und Sondererlaubnisse. " +
    "Klare Kursinfos, transparente Kosten.",
  targetAudience: ["Fahranfänger:innen", "Wiedereinsteiger:innen", "Eltern", "B197-Interessierte"],
  defaultTagline: "Sicher zum Führerschein – freundlich begleitet in {{city}}.",
  defaultHeroTitle: "Bereit für die Straße. Sicher zur Prüfung.",
  defaultHeroSubtitle:
    "Theorie, Praxis und Prüfungsvorbereitung – mit klarer Kursplanung und freundlichen Fahrlehrer:innen.",
  defaultCtas: [CTA_APPOINTMENT_PRIMARY, CTA_WHATSAPP, CTA_CALL],
  recommendedSections: [
    "hero",
    "services",
    "benefits",
    "process",
    "reviews",
    "faq",
    "contact",
    "opening_hours",
    "location",
  ],
  defaultServices: [
    {
      key: "class_b",
      title: "Klasse B (PKW)",
      shortDescription: "Standardführerschein für PKW.",
      defaultPriceLabel: "Grundbetrag + Fahrstunden",
    },
    {
      key: "class_b_automatic",
      title: "Klasse B mit Automatik",
      shortDescription: "Auf Wunsch ohne Schaltzwang.",
      defaultPriceLabel: "Grundbetrag + Fahrstunden",
    },
    {
      key: "class_be",
      title: "Klasse BE",
      shortDescription: "Anhänger über 750 kg.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "refresh_course",
      title: "Auffrischung",
      shortDescription: "Wiedereinsteiger oder unsichere Fahrer:innen.",
      defaultPriceLabel: "ab 49 € / Stunde",
    },
    {
      key: "intensive_course",
      title: "Intensivkurs",
      shortDescription: "Schnellere Theorie und Praxis im Block.",
      defaultPriceLabel: "auf Anfrage",
    },
  ],
  defaultFaqs: [
    {
      question: "Was kostet der Führerschein?",
      answer:
        "Die Kosten setzen sich aus Grundbetrag, Theorie, Fahrstunden und Prüfungsgebühren zusammen. Eine genaue Übersicht erhalten Sie bei der Anmeldung.",
    },
    {
      question: "Wann beginnt der nächste Theoriekurs?",
      answer:
        "Theoriekurse starten regelmäßig. Den nächsten Termin sehen Sie auf unserer Seite oder erfahren ihn telefonisch.",
    },
    {
      question: "Kann ich auf Automatik fahren lernen?",
      answer:
        "Ja. B197 erlaubt Lernen auf Automatik mit anschließendem Prüfungsumfang auf Schaltgetriebe.",
    },
    {
      question: "Wie melde ich mich an?",
      answer:
        "Persönlich im Büro oder über das Kontaktformular. Den nötigen Antragsbogen schicken wir Ihnen zu.",
    },
  ],
  defaultBenefits: [
    {
      title: "Klare Kursplanung",
      text: "Theorie- und Fahrtermine im Voraus sichtbar.",
    },
    {
      title: "Freundliche Begleitung",
      text: "Geduldige Fahrlehrer:innen, klare Rückmeldungen.",
    },
    {
      title: "Moderne Fahrzeuge",
      text: "Aktuelle Schalt- und Automatikfahrzeuge.",
    },
    {
      title: "Faire Preise",
      text: "Transparente Übersicht aller Posten.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Anmeldung",
      text: "Persönlich oder per Anfrage – wir senden Unterlagen.",
    },
    {
      step: 2,
      title: "Theorie",
      text: "Kurs nach festem Plan, mit Lernmaterial.",
    },
    {
      step: 3,
      title: "Praxis",
      text: "Fahrstunden bis zur Prüfungsreife.",
    },
    {
      step: 4,
      title: "Prüfung",
      text: "Theoretische und praktische Prüfung – wir begleiten.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    EMAIL_FIELD,
    {
      key: "drivingClass",
      label: "Gewünschte Klasse",
      type: "select",
      required: true,
      options: [
        { value: "B", label: "Klasse B (PKW)" },
        { value: "B197", label: "Klasse B mit Automatik (B197)" },
        { value: "BE", label: "Klasse BE (Anhänger)" },
        { value: "refresh", label: "Auffrischung" },
        { value: "other", label: "Sonstiges" },
      ],
    },
    {
      key: "preferredCourseStart",
      label: "Wunschstart",
      type: "select",
      required: false,
      options: [
        { value: "asap", label: "So schnell wie möglich" },
        { value: "next_month", label: "Nächster Monat" },
        { value: "later", label: "Später" },
      ],
    },
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "whatsapp_friendly",
      channel: "whatsapp",
      tone: "friendly",
      body: "Hallo {{customerName}}, herzlichen Glückwunsch zur bestandenen Prüfung! Eine kurze Google-Bewertung hilft uns sehr und ist in 30 Sekunden erledigt → {{reviewLink}}",
    },
    {
      key: "email_followup",
      channel: "email",
      tone: "follow_up",
      body: "Hallo {{customerName}},\n\nwir freuen uns, dass Sie es geschafft haben. Wenn Sie zufrieden mit unserer Begleitung waren, hilft eine kurze Google-Bewertung anderen Lernenden bei der Auswahl:\n{{reviewLink}}",
    },
  ],
  socialPostPrompts: [
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["instagram", "facebook"],
      tone: "freundlich",
      ideaShort: "Nächster Theoriestart in {{city}} bewerben.",
    },
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["instagram"],
      tone: "persönlich",
      ideaShort: "Fahrlehrer:in vorstellen mit kurzem Tipp für Lernende.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für eine Fahrschule in {{city}}. Klar, einladend, max. 8 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für eine Fahrschule. Tonalität: freundlich, geduldig, klar.",
    },
  ],
  recommendedThemes: ["education_calm", "clean_light", "fitness_energy"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "individual", label: "individuell" },
    { key: "package", label: "Pauschal" },
  ],
  imageGuidance: {
    primaryStyle:
      "Authentische Fahrzeuge, helle Schulungsräume, ruhige Lernsituationen.",
    recommendedSubjects: [
      "Schulfahrzeug von außen",
      "Innenraum mit Fahrlehrer und Fahrschüler:in",
      "Theorieraum mit Tafel oder Bildschirm",
    ],
    avoid: [
      "Heroische Tempo-Bilder",
      "Aussagen, die Prüfungserfolg garantieren",
    ],
  },
  toneOfVoice: ["freundlich", "geduldig", "klar", "vertrauenswürdig"],
  complianceNotes: [],
});
