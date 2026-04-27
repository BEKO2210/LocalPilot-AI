import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  CTA_APPOINTMENT_PRIMARY,
  CTA_CALL,
  CTA_WHATSAPP,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
  PREFERRED_DATE_FIELD,
} from "../preset-helpers";

export const barbershopPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "barbershop",
  label: "Barbershop",
  pluralLabel: "Barbershops",
  description:
    "Barbershops mit Fokus auf Bart- und Herrenhaarpflege. Klare, " +
    "souveräne Ästhetik, schnelle Termine.",
  targetAudience: ["Männer 18–45", "Stammkundschaft", "Studenten", "Bart-Träger"],
  defaultTagline: "Saubere Schnitte, gepflegte Bärte – mitten in {{city}}.",
  defaultHeroTitle: "Cuts und Beard Care, made in {{city}}.",
  defaultHeroSubtitle:
    "Reservieren Sie schnell, kommen Sie pünktlich und gehen Sie frisch.",
  defaultCtas: [CTA_APPOINTMENT_PRIMARY, CTA_CALL, CTA_WHATSAPP],
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
      key: "haircut",
      title: "Haarschnitt",
      shortDescription: "Klassisch oder modern, sauber gefinisht.",
      defaultPriceLabel: "ab 25 €",
      defaultDurationLabel: "30 Min.",
    },
    {
      key: "beard_trim",
      title: "Bartpflege",
      shortDescription: "Konturen, Trimm und Pflegeöl.",
      defaultPriceLabel: "ab 18 €",
      defaultDurationLabel: "20 Min.",
    },
    {
      key: "haircut_beard",
      title: "Haar & Bart Kombi",
      shortDescription: "Komplettpaket, abgestimmt aufeinander.",
      defaultPriceLabel: "ab 39 €",
      defaultDurationLabel: "45 Min.",
    },
    {
      key: "shave",
      title: "Klassische Nassrasur",
      shortDescription: "Heiße Tücher, Klinge, sorgfältige Pflege.",
      defaultPriceLabel: "ab 29 €",
      defaultDurationLabel: "30 Min.",
    },
    {
      key: "kids",
      title: "Kinderhaarschnitt",
      shortDescription: "Geduldig und ruhig, auch beim ersten Mal.",
      defaultPriceLabel: "ab 18 €",
      defaultDurationLabel: "20 Min.",
    },
  ],
  defaultFaqs: [
    {
      question: "Brauche ich einen Termin?",
      answer:
        "Wir empfehlen einen Termin – Walk-ins nehmen wir, wenn ein Stuhl frei ist.",
    },
    {
      question: "Wie zahle ich?",
      answer:
        "Bar oder Karte. Trinkgeld geht beides – wir freuen uns auch über eine Bewertung.",
    },
    {
      question: "Habt ihr eine Treuekarte?",
      answer:
        "Ja, nach mehreren Besuchen gibt es einen kleinen Bonus. Fragen Sie einfach im Shop.",
    },
    {
      question: "Wie alt muss man sein?",
      answer: "Kein Mindestalter – Kinder sind willkommen, am besten mit Begleitung.",
    },
  ],
  defaultBenefits: [
    {
      title: "Pünktlich",
      text: "Reservierte Slots, kurze Wartezeiten.",
    },
    {
      title: "Saubere Arbeit",
      text: "Konturen sitzen, Übergänge passen.",
    },
    {
      title: "Eigene Atmosphäre",
      text: "Musik, Pflegeprodukte, ruhige Gespräche.",
    },
    {
      title: "Faire Preise",
      text: "Klare Übersicht, keine versteckten Aufschläge.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Reservieren",
      text: "Termin online, telefonisch oder per WhatsApp.",
    },
    {
      step: 2,
      title: "Kurze Abstimmung",
      text: "Stil, Länge und Bartwunsch festlegen.",
    },
    {
      step: 3,
      title: "Schnitt & Finish",
      text: "Saubere Arbeit, abschließende Pflege.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    {
      key: "requestedService",
      label: "Gewünschte Leistung",
      type: "select",
      required: false,
      options: [
        { value: "haircut", label: "Haarschnitt" },
        { value: "beard_trim", label: "Bartpflege" },
        { value: "haircut_beard", label: "Haar & Bart Kombi" },
        { value: "shave", label: "Klassische Nassrasur" },
        { value: "kids", label: "Kinderhaarschnitt" },
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
      body: "Hi {{customerName}}, danke fürs Vorbeikommen! Eine kurze Google-Bewertung hilft uns sehr → {{reviewLink}}",
    },
    {
      key: "sms_short",
      channel: "sms",
      tone: "short",
      body: "Danke {{customerName}}! Wenn’s gepasst hat: 30 Sekunden Bewertung → {{reviewLink}}",
    },
    {
      key: "whatsapp_friendly",
      channel: "whatsapp",
      tone: "friendly",
      body: "Hi {{customerName}}, wir hoffen, der Cut sitzt. Eine kurze Google-Bewertung wäre top: {{reviewLink}} Bis zum nächsten Mal!",
    },
  ],
  socialPostPrompts: [
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["instagram", "facebook"],
      tone: "modern",
      ideaShort: "Aktion: Haar & Bart Kombi-Preis am Wochentag.",
    },
    {
      key: "before_after",
      goal: "before_after",
      platforms: ["instagram"],
      tone: "souverän",
      ideaShort: "Vorher/Nachher eines klassischen Cut – mit Einverständnis.",
    },
    {
      key: "team",
      goal: "team_intro",
      platforms: ["instagram", "facebook"],
      tone: "persönlich",
      ideaShort: "Barber kurz vorstellen mit Lieblingsstil und Werkzeug.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Schreibe eine kurze, selbstbewusste Headline für einen Barbershop in {{city}}. Maximal 8 Wörter, ohne Buzzwords.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 90 Wörter) für einen Barbershop. Tonalität: souverän, freundlich, klar. Keine Übertreibungen.",
    },
  ],
  recommendedThemes: ["premium_dark", "automotive_strong", "clean_light"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "fixed", label: "Festpreis" },
  ],
  imageGuidance: {
    primaryStyle:
      "Reduziertes, dunkleres Setting, klare Schnitte und Werkzeuge. Echte Kunden, echte Atmosphäre.",
    recommendedSubjects: [
      "Schnitt-Detail (Übergang, Konturen)",
      "Werkzeug auf Theke",
      "Shop-Atmosphäre, Stuhl, Spiegel",
    ],
    avoid: [
      "Filter, harte Sepia-Look",
      "Posierte Models",
      "Aggressive Sprüche",
    ],
  },
  toneOfVoice: ["souverän", "freundlich", "klar", "modern"],
  complianceNotes: [],
});
