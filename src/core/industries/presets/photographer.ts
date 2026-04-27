import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  CTA_APPOINTMENT_PRIMARY,
  CTA_CALL,
  CTA_QUOTE,
  EMAIL_FIELD,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
  PREFERRED_DATE_FIELD,
} from "../preset-helpers";

export const photographerPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "photographer",
  label: "Fotograf",
  pluralLabel: "Fotograf:innen",
  description:
    "Fotograf:innen für Familien, Hochzeiten, Business und kreative Auftragsarbeiten. " +
    "Klare Pakete, Beratung vor dem Shooting, transparente Lieferzeiten.",
  targetAudience: ["Familien", "Brautpaare", "Selbstständige", "Unternehmen"],
  defaultTagline: "Bilder, die bleiben. Persönlich begleitet in {{city}}.",
  defaultHeroTitle: "Bilder, die zu Ihnen passen.",
  defaultHeroSubtitle:
    "Familie, Hochzeit, Portrait und Business – mit klarer Vorbereitung und persönlicher Begleitung.",
  defaultCtas: [CTA_APPOINTMENT_PRIMARY, CTA_QUOTE, CTA_CALL],
  recommendedSections: [
    "hero",
    "services",
    "benefits",
    "process",
    "reviews",
    "faq",
    "contact",
    "gallery",
  ],
  defaultServices: [
    {
      key: "family",
      title: "Familienfotos",
      shortDescription: "Drinnen oder draußen, ruhig und ungezwungen.",
      defaultPriceLabel: "ab 199 €",
      defaultDurationLabel: "60–90 Min.",
    },
    {
      key: "portrait",
      title: "Portrait",
      shortDescription: "Klassisch oder modern, einzeln oder zu zweit.",
      defaultPriceLabel: "ab 149 €",
      defaultDurationLabel: "60 Min.",
    },
    {
      key: "wedding",
      title: "Hochzeit",
      shortDescription: "Begleitung des Tages mit klarer Auswahl.",
      defaultPriceLabel: "ab 1.290 €",
    },
    {
      key: "business",
      title: "Business-Bilder",
      shortDescription: "Headshots, Team, Räume.",
      defaultPriceLabel: "ab 290 €",
    },
    {
      key: "products",
      title: "Produktfotos",
      shortDescription: "Klare Aufnahmen für Shop und Social Media.",
      defaultPriceLabel: "auf Anfrage",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie lange dauert die Lieferung?",
      answer:
        "Familien- und Portrait-Shootings liefern wir innerhalb von 1–2 Wochen. Hochzeiten je nach Umfang in 4–6 Wochen.",
    },
    {
      question: "Wie viele Bilder erhalte ich?",
      answer:
        "Das hängt vom Paket ab. Eine grobe Anzahl steht im Angebot, oft sind es 30–80 bearbeitete Bilder.",
    },
    {
      question: "Erhalte ich auch Originale (RAW)?",
      answer:
        "Standardmäßig nicht – wir geben bearbeitete Bilder weiter, damit der Bildlook konsistent bleibt.",
    },
    {
      question: "Können Sie auch unterwegs arbeiten?",
      answer:
        "Ja, Locations in der Region sind kein Problem. Größere Strecken besprechen wir vorab.",
    },
  ],
  defaultBenefits: [
    {
      title: "Persönliche Beratung",
      text: "Vor dem Shooting kurze Abstimmung zu Stil und Ort.",
    },
    {
      title: "Klare Pakete",
      text: "Schriftliches Angebot mit Lieferumfang.",
    },
    {
      title: "Ruhige Begleitung",
      text: "Wir nehmen uns Zeit, ohne Stress am Set.",
    },
    {
      title: "Sichere Datenübergabe",
      text: "Bilder über geschützten Online-Zugang.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Anfrage",
      text: "Anlass, Wunschtermin und Stilrichtung beschreiben.",
    },
    {
      step: 2,
      title: "Briefing",
      text: "Kurzes Vorgespräch zu Erwartung und Ablauf.",
    },
    {
      step: 3,
      title: "Shooting",
      text: "Ruhig begleitet, mit klarer Kommunikation.",
    },
    {
      step: 4,
      title: "Auswahl & Lieferung",
      text: "Bearbeitete Bilder in vereinbarter Frist.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    EMAIL_FIELD,
    {
      key: "shootType",
      label: "Anlass",
      type: "select",
      required: true,
      options: [
        { value: "family", label: "Familie" },
        { value: "portrait", label: "Portrait" },
        { value: "wedding", label: "Hochzeit" },
        { value: "business", label: "Business" },
        { value: "products", label: "Produkte" },
        { value: "other", label: "Sonstiges" },
      ],
    },
    PREFERRED_DATE_FIELD,
    {
      key: "location",
      label: "Wunschort",
      type: "text",
      required: false,
      placeholder: "z. B. draußen, Studio, bei Ihnen zu Hause",
    },
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "email_friendly",
      channel: "email",
      tone: "friendly",
      body: "Hallo {{customerName}},\n\ndie Bilder sind unterwegs. Wenn Sie zufrieden waren, freuen wir uns sehr über eine kurze Google-Bewertung:\n{{reviewLink}}\n\nDanke fürs Vertrauen!",
    },
    {
      key: "whatsapp_short",
      channel: "whatsapp",
      tone: "short",
      body: "Hallo {{customerName}}, alles bei Ihnen angekommen? Eine kurze Google-Bewertung würde sehr helfen → {{reviewLink}}",
    },
  ],
  socialPostPrompts: [
    {
      key: "new_service",
      goal: "new_service",
      platforms: ["instagram"],
      tone: "kreativ",
      ideaShort: "Neues Paket vorstellen mit klarem Bild und Pakettext.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["instagram", "facebook"],
      tone: "freundlich",
      ideaShort: "Saison-Aktion (z. B. Familie im Herbst).",
    },
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["instagram"],
      tone: "persönlich",
      ideaShort: "Hinter-den-Kulissen einer Auswahl, mit Erlaubnis.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für eine:n Fotograf:in in {{city}}. Persönlich, ruhig, max. 8 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für eine:n Fotograf:in. Tonalität: persönlich, ruhig, professionell.",
    },
  ],
  recommendedThemes: ["creative_studio", "premium_dark", "clean_light"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "package", label: "Paket" },
    { key: "individual", label: "individuell" },
  ],
  imageGuidance: {
    primaryStyle:
      "Eigene Arbeiten als Hauptbildmaterial – konsistent in Farbe und Lichtstimmung.",
    recommendedSubjects: [
      "Beste eigene Bilder pro Genre",
      "Setup-Detail aus dem Studio",
    ],
    avoid: [
      "Stockfotos statt eigener Werke",
      "Bilder ohne Einverständnis der Abgebildeten",
    ],
  },
  toneOfVoice: ["persönlich", "ruhig", "kreativ", "professionell"],
  complianceNotes: [],
});
