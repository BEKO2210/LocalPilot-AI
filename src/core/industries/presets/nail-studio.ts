import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  COMPLIANCE_NO_MEDICAL_PROMISE,
  CTA_APPOINTMENT_PRIMARY,
  CTA_CALL,
  CTA_WHATSAPP,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
  PREFERRED_DATE_FIELD,
} from "../preset-helpers";

export const nailStudioPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "nail_studio",
  label: "Nagelstudio",
  pluralLabel: "Nagelstudios",
  description:
    "Nagelstudios mit Modellage, Maniküre, Nail-Art und Pflege. Klare " +
    "Termine, saubere Arbeit, freundliche Beratung.",
  targetAudience: ["Stammkundschaft", "Bridal-Kund:innen", "Geschenksuchende", "Männer (Maniküre)"],
  defaultTagline: "Schöne Nägel, klare Termine, freundliche Beratung.",
  defaultHeroTitle: "Gepflegte Nägel, sauber gesetzt.",
  defaultHeroSubtitle:
    "Modellage, Maniküre und Nail-Art – ruhig, sauber und mit Zeit für Wünsche.",
  defaultCtas: [CTA_APPOINTMENT_PRIMARY, CTA_WHATSAPP, CTA_CALL],
  recommendedSections: [
    "hero",
    "services",
    "benefits",
    "reviews",
    "faq",
    "contact",
    "opening_hours",
    "gallery",
  ],
  defaultServices: [
    {
      key: "manicure",
      title: "Maniküre",
      shortDescription: "Pflege, Form, Lack oder Pflegelack.",
      defaultPriceLabel: "ab 25 €",
      defaultDurationLabel: "45 Min.",
    },
    {
      key: "modellage_new",
      title: "Modellage Neu",
      shortDescription: "Aufbau in Acryl oder Gel, individuell geformt.",
      defaultPriceLabel: "ab 49 €",
      defaultDurationLabel: "120 Min.",
    },
    {
      key: "modellage_refill",
      title: "Modellage Auffüllen",
      shortDescription: "Pflege und Auffüllen vorhandener Modellage.",
      defaultPriceLabel: "ab 35 €",
      defaultDurationLabel: "75 Min.",
    },
    {
      key: "shellac",
      title: "Shellac",
      shortDescription: "Lang haltender Lack mit Glanz.",
      defaultPriceLabel: "ab 29 €",
      defaultDurationLabel: "45 Min.",
    },
    {
      key: "nail_art",
      title: "Nail-Art",
      shortDescription: "Designs, Steinchen, Effekte – nach Wunsch.",
      defaultPriceLabel: "Aufpreis individuell",
      defaultDurationLabel: "+15–30 Min.",
    },
    {
      key: "pedicure",
      title: "Pediküre",
      shortDescription: "Sorgfältige Fußpflege mit Massage.",
      defaultPriceLabel: "ab 35 €",
      defaultDurationLabel: "60 Min.",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie lange hält eine Modellage?",
      answer:
        "In der Regel 3–4 Wochen. Auffüllen empfehlen wir nach 3 Wochen, damit alles gepflegt bleibt.",
    },
    {
      question: "Welches Material verwenden Sie?",
      answer:
        "Auf Wunsch Acryl oder Gel. Wir besprechen vor dem Termin, was zu Ihren Nägeln passt.",
    },
    {
      question: "Sind Allergien ein Problem?",
      answer:
        "Sagen Sie uns Bescheid, wenn Sie schon mal allergisch reagiert haben. Wir wählen die Materialien dann mit Rücksicht aus.",
    },
    {
      question: "Wie zahle ich?",
      answer: "Bar oder Karte. Trinkgeld geht beides.",
    },
  ],
  defaultBenefits: [
    {
      title: "Sauber und ruhig",
      text: "Studio mit klarer Hygiene, ruhige Atmosphäre.",
    },
    {
      title: "Individuelle Designs",
      text: "Vom Naturlook bis zu auffälligen Akzenten.",
    },
    {
      title: "Zeit zum Wohlfühlen",
      text: "Wir hetzen nicht – Pflege braucht Ruhe.",
    },
    {
      title: "Geschenkgutscheine",
      text: "Persönlich oder digital, einfach zu verschenken.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Termin anfragen",
      text: "Wunschdesign und Material kurz beschreiben.",
    },
    {
      step: 2,
      title: "Beratung",
      text: "Form, Länge und Stil gemeinsam festlegen.",
    },
    {
      step: 3,
      title: "Modellage & Pflegehinweis",
      text: "Sauber gesetzt, mit Tipps für die Pflege zu Hause.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    {
      key: "requestedService",
      label: "Gewünschte Behandlung",
      type: "select",
      required: false,
      options: [
        { value: "manicure", label: "Maniküre" },
        { value: "modellage_new", label: "Modellage Neu" },
        { value: "modellage_refill", label: "Modellage Auffüllen" },
        { value: "shellac", label: "Shellac" },
        { value: "nail_art", label: "Nail-Art" },
        { value: "pedicure", label: "Pediküre" },
      ],
    },
    PREFERRED_DATE_FIELD,
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "whatsapp_short",
      channel: "whatsapp",
      tone: "short",
      body: "Hallo {{customerName}}, danke! Wenn die Nägel gefallen, freuen wir uns über eine kurze Google-Bewertung → {{reviewLink}}",
    },
    {
      key: "whatsapp_friendly",
      channel: "whatsapp",
      tone: "friendly",
      body: "Hallo {{customerName}}, schön, dass Sie da waren. Eine kurze Bewertung hilft uns sehr und ist in 30 Sekunden erledigt → {{reviewLink}}",
    },
  ],
  socialPostPrompts: [
    {
      key: "new_service",
      goal: "new_service",
      platforms: ["instagram"],
      tone: "modern",
      ideaShort: "Neues Design in mehreren Ausführungen zeigen.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["instagram", "facebook"],
      tone: "freundlich",
      ideaShort: "Saisonale Aktion (z. B. Hochzeit, Sommer).",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für ein Nagelstudio in {{city}}. Modern, einladend, ohne Buzzwords. Max. 7 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 90 Wörter) für ein Nagelstudio. Tonalität: ruhig, freundlich, stilvoll.",
    },
  ],
  recommendedThemes: ["beauty_luxury", "clean_light", "warm_local"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "individual", label: "individuell" },
  ],
  imageGuidance: {
    primaryStyle:
      "Klare Detailaufnahmen, weiches Licht. Saubere Hände, neutraler Hintergrund.",
    recommendedSubjects: [
      "Detail eines fertigen Designs",
      "Werkzeuge und Materialien",
      "Studio-Atmosphäre",
    ],
    avoid: [
      "Übersättigte Filter",
      "Stockfotos mit künstlichen Händen",
    ],
  },
  toneOfVoice: ["freundlich", "stilvoll", "ruhig", "persönlich"],
  complianceNotes: [COMPLIANCE_NO_MEDICAL_PROMISE],
});
