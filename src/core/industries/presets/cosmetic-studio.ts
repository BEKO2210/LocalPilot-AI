import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  COMPLIANCE_NO_AGE_RESTRICTED_PROMISE,
  COMPLIANCE_NO_MEDICAL_PROMISE,
  CTA_APPOINTMENT_PRIMARY,
  CTA_CALL,
  CTA_WHATSAPP,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
  PREFERRED_DATE_FIELD,
} from "../preset-helpers";

export const cosmeticStudioPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "cosmetic_studio",
  label: "Kosmetikstudio",
  pluralLabel: "Kosmetikstudios",
  description:
    "Kosmetikbetriebe mit Fokus auf Hautpflege, Wimpern, Wellness-Behandlungen. " +
    "Texte bleiben sachlich – keine Heilversprechen.",
  targetAudience: ["Stammkundschaft", "Wellness-Interessierte", "Bridal-Kund:innen", "Männer", "Geschenksuchende"],
  defaultTagline: "Kleine Pause für die Haut – mitten in {{city}}.",
  defaultHeroTitle: "Hautpflege, mit Zeit und Sorgfalt.",
  defaultHeroSubtitle:
    "Behandlungen rund um Gesicht, Wimpern und Wohlbefinden – ruhig, sauber und individuell beraten.",
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
  ],
  defaultServices: [
    {
      key: "facial_basic",
      title: "Klassische Gesichtsbehandlung",
      shortDescription: "Reinigung, Peeling, Maske, Pflege.",
      defaultPriceLabel: "ab 59 €",
      defaultDurationLabel: "60 Min.",
    },
    {
      key: "facial_deluxe",
      title: "Premium-Gesichtsbehandlung",
      shortDescription: "Erweiterte Pflege mit individueller Beratung.",
      defaultPriceLabel: "ab 89 €",
      defaultDurationLabel: "90 Min.",
    },
    {
      key: "lash_extensions",
      title: "Wimpernverlängerung",
      shortDescription: "Naturlook oder Volumen, sauber gesetzt.",
      defaultPriceLabel: "ab 99 €",
      defaultDurationLabel: "120 Min.",
    },
    {
      key: "brows",
      title: "Augenbrauen-Styling",
      shortDescription: "Form, Färbung und Pflege.",
      defaultPriceLabel: "ab 25 €",
      defaultDurationLabel: "30 Min.",
    },
    {
      key: "waxing",
      title: "Waxing",
      shortDescription: "Sanfte Haarentfernung mit Pflege.",
      defaultPriceLabel: "ab 19 €",
      defaultDurationLabel: "ab 20 Min.",
    },
    {
      key: "makeup",
      title: "Make-up für Anlässe",
      shortDescription: "Hochzeit, Foto, Feier – auf den Punkt.",
      defaultPriceLabel: "ab 69 €",
      defaultDurationLabel: "60 Min.",
    },
  ],
  defaultFaqs: [
    {
      question: "Welche Produkte verwenden Sie?",
      answer:
        "Wir arbeiten mit ausgesuchten Produkten und passen die Pflege an Ihre Haut an. Allergien sagen Sie uns bitte vor der Behandlung.",
    },
    {
      question: "Kann ich vorher beraten werden?",
      answer:
        "Ja, gerne. Eine kurze Hautanalyse oder Gespräch ist Teil jeder Erstbehandlung – kostenfrei.",
    },
    {
      question: "Was, wenn ich empfindliche Haut habe?",
      answer:
        "Sagen Sie es uns rechtzeitig – wir wählen Produkte und Schritte entsprechend behutsam.",
    },
    {
      question: "Wie kurzfristig kann ich kommen?",
      answer:
        "Oft noch in derselben oder darauffolgenden Woche. Für Wunschtermine am Wochenende empfehlen wir Anfrage 1–2 Wochen im Voraus.",
    },
  ],
  defaultBenefits: [
    {
      title: "Ruhige Atmosphäre",
      text: "Studio fern von Hektik, Zeit zum Durchatmen.",
    },
    {
      title: "Individuelle Beratung",
      text: "Behandlung wird an Ihre Haut und Ihren Anlass angepasst.",
    },
    {
      title: "Hochwertige Produkte",
      text: "Sorgfältig ausgewählt, gut verträglich.",
    },
    {
      title: "Geschenkgutscheine",
      text: "Gerne als Aufmerksamkeit – persönlich oder digital.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Termin anfragen",
      text: "Wunsch und Behandlungsart kurz beschreiben.",
    },
    {
      step: 2,
      title: "Hautanalyse",
      text: "Kurze Beratung vor Beginn der Behandlung.",
    },
    {
      step: 3,
      title: "Behandlung & Pflegehinweis",
      text: "Anschließende Empfehlungen für die Pflege zu Hause.",
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
        { value: "facial_basic", label: "Klassische Gesichtsbehandlung" },
        { value: "facial_deluxe", label: "Premium-Gesichtsbehandlung" },
        { value: "lash_extensions", label: "Wimpernverlängerung" },
        { value: "brows", label: "Augenbrauen-Styling" },
        { value: "waxing", label: "Waxing" },
        { value: "makeup", label: "Make-up" },
      ],
    },
    PREFERRED_DATE_FIELD,
    {
      key: "skinNotes",
      label: "Hautempfindlichkeiten / Allergien",
      type: "textarea",
      required: false,
      helperText: "Optional, hilft uns bei der Vorbereitung.",
    },
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "whatsapp_friendly",
      channel: "whatsapp",
      tone: "friendly",
      body: "Hallo {{customerName}}, vielen Dank für Ihren Termin! Wenn die Pflege gefallen hat, würden wir uns sehr über eine kurze Google-Bewertung freuen: {{reviewLink}}",
    },
    {
      key: "email_followup",
      channel: "email",
      tone: "follow_up",
      body: "Hallo {{customerName}},\n\nwie hat Ihre Haut auf die Behandlung reagiert? Wenn alles gut war, hilft uns eine kurze Google-Bewertung sehr:\n{{reviewLink}}\n\nFalls etwas unangenehm war, antworten Sie bitte direkt – wir kümmern uns.",
    },
  ],
  socialPostPrompts: [
    {
      key: "new_service",
      goal: "new_service",
      platforms: ["instagram", "facebook"],
      tone: "ruhig",
      ideaShort: "Neue Behandlung kurz vorstellen, mit Pflegehinweis.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["instagram"],
      tone: "freundlich",
      ideaShort: "Saisonaktion vor dem Sommer mit klarer Kundenkommunikation.",
    },
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["instagram", "facebook"],
      tone: "persönlich",
      ideaShort: "Studio-Atmosphäre und Pflegeritual zeigen.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für ein Kosmetikstudio in {{city}}. Ruhig, einladend, ohne Heilversprechen. Max. 8 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 90 Wörter) für ein Kosmetikstudio. Tonalität: ruhig, persönlich. Keine medizinischen Aussagen oder Wirkversprechen.",
    },
  ],
  recommendedThemes: ["beauty_luxury", "clean_light", "warm_local"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "individual", label: "individuell" },
  ],
  imageGuidance: {
    primaryStyle:
      "Weiches Licht, ruhige Farben, Fokus auf Studio und Pflegeprodukte. Keine drastischen Vorher/Nachher-Bilder.",
    recommendedSubjects: [
      "Studio-Atmosphäre",
      "Pflegeprodukte und Werkzeuge",
      "Detail einer Behandlung mit Einverständnis",
    ],
    avoid: [
      "Stockfotos mit überstilisierten Modellen",
      "Vorher/Nachher mit dramatischen Versprechen",
      "Aussagen wie 'verschwindet sofort' oder 'verschwindet für immer'",
    ],
  },
  toneOfVoice: ["ruhig", "freundlich", "persönlich", "stilvoll"],
  complianceNotes: [
    COMPLIANCE_NO_MEDICAL_PROMISE,
    COMPLIANCE_NO_AGE_RESTRICTED_PROMISE,
  ],
});
