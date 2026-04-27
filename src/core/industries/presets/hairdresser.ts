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

export const hairdresserPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "hairdresser",
  label: "Friseur",
  pluralLabel: "Friseure",
  description:
    "Friseurbetriebe, die Termine, Leistungen und Bewertungen klar und " +
    "modern online präsentieren möchten.",
  targetAudience: ["Damen", "Herren", "Kinder", "Stammkundschaft"],
  defaultTagline:
    "Frische Frisuren, freundliche Beratung – direkt in {{city}}.",
  defaultHeroTitle: "Frischer Look, freundlich beraten.",
  defaultHeroSubtitle:
    "Schnelle Termine, klare Preise und saubere Arbeit für Damen, Herren und Kinder.",
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
      key: "ladies_cut",
      title: "Damenhaarschnitt",
      shortDescription: "Schnitt inkl. Beratung und Styling.",
      defaultPriceLabel: "ab 39 €",
      defaultDurationLabel: "60 Min.",
    },
    {
      key: "gentlemen_cut",
      title: "Herrenhaarschnitt",
      shortDescription: "Klassisch oder modern, sauber gefinisht.",
      defaultPriceLabel: "ab 25 €",
      defaultDurationLabel: "30 Min.",
    },
    {
      key: "kids_cut",
      title: "Kinderhaarschnitt",
      shortDescription: "Geduldig und altersgerecht.",
      defaultPriceLabel: "ab 18 €",
      defaultDurationLabel: "30 Min.",
    },
    {
      key: "color",
      title: "Farbe",
      shortDescription: "Komplette Färbung mit Pflege.",
      defaultPriceLabel: "ab 59 €",
      defaultDurationLabel: "90 Min.",
    },
    {
      key: "balayage",
      title: "Balayage / Strähnen",
      shortDescription: "Natürliche Akzente, individuell abgestimmt.",
      defaultPriceLabel: "ab 89 €",
      defaultDurationLabel: "120 Min.",
    },
    {
      key: "styling",
      title: "Styling für besondere Anlässe",
      shortDescription: "Hochzeit, Feier, Fototermin – auf den Punkt.",
      defaultPriceLabel: "ab 49 €",
      defaultDurationLabel: "60 Min.",
    },
    {
      key: "treatment",
      title: "Pflegebehandlung",
      shortDescription: "Tiefenpflege für strapaziertes Haar.",
      defaultPriceLabel: "ab 19 €",
      defaultDurationLabel: "20 Min.",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie buche ich einen Termin?",
      answer:
        "Über das Kontaktformular, per Telefon oder per WhatsApp. Wir bestätigen Ihren Wunschtermin meist am selben Tag.",
    },
    {
      question: "Was kostet ein Termin?",
      answer:
        "Die Preise stehen direkt bei den Leistungen. Bei längeren Haaren oder zusätzlichen Behandlungen besprechen wir den Aufpreis vor dem Schnitt.",
    },
    {
      question: "Kommen auch Kinder zu Ihnen?",
      answer:
        "Ja, wir schneiden Kinder gerne. Bitte sagen Sie uns kurz Bescheid, wenn ein Kind zum ersten Mal kommt – wir nehmen uns dann etwas mehr Zeit.",
    },
    {
      question: "Wie kurzfristig bekomme ich einen Termin?",
      answer:
        "Oft noch in der gleichen oder darauffolgenden Woche. Für Wunschzeiten am Wochenende empfehlen wir eine Anfrage 1–2 Wochen im Voraus.",
    },
  ],
  defaultBenefits: [
    {
      title: "Schnelle Termine",
      text: "Werktags meist auch kurzfristig erreichbare Slots.",
    },
    {
      title: "Klare Preise",
      text: "Transparente Preisangaben, keine Überraschungen an der Kasse.",
    },
    {
      title: "Zeit für Beratung",
      text: "Wir nehmen uns Zeit, bevor wir die Schere ansetzen.",
    },
    {
      title: "Sauber & ruhig",
      text: "Aufgeräumter Salon, freundliche Atmosphäre.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Termin anfragen",
      text: "Wunschtermin und Leistung nennen – wir melden uns zur Bestätigung.",
    },
    {
      step: 2,
      title: "Beratung im Salon",
      text: "Kurze Abstimmung zu Stil, Pflege und Zeitbedarf.",
    },
    {
      step: 3,
      title: "Schnitt & Finish",
      text: "Saubere Arbeit, abschließendes Styling, klarer Preis.",
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
        { value: "ladies_cut", label: "Damenhaarschnitt" },
        { value: "gentlemen_cut", label: "Herrenhaarschnitt" },
        { value: "kids_cut", label: "Kinderhaarschnitt" },
        { value: "color", label: "Farbe" },
        { value: "balayage", label: "Balayage / Strähnen" },
        { value: "styling", label: "Styling" },
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
      body: "Hallo {{customerName}}, danke für Ihren Besuch! Wenn Sie zufrieden waren, würden wir uns sehr über eine kurze Google-Bewertung freuen: {{reviewLink}}",
    },
    {
      key: "whatsapp_friendly",
      channel: "whatsapp",
      tone: "friendly",
      body: "Hallo {{customerName}}, wir hoffen, der neue Schnitt gefällt Ihnen. Falls ja: Eine kurze Google-Bewertung hilft uns sehr und ist in 30 Sekunden erledigt → {{reviewLink}} Vielen Dank!",
    },
    {
      key: "email_followup",
      channel: "email",
      tone: "follow_up",
      body: "Hallo {{customerName}},\n\nvielen Dank für Ihren Termin bei uns. Wenn Sie zufrieden waren, hilft uns eine kurze Google-Bewertung sehr weiter:\n{{reviewLink}}\n\nFalls etwas nicht gepasst hat, antworten Sie bitte direkt auf diese E-Mail – wir kümmern uns.",
    },
  ],
  socialPostPrompts: [
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["instagram", "facebook"],
      tone: "freundlich",
      ideaShort: "Saisonale Aktion vorstellen, Vorher-/Nachher-Bild als Aufhänger.",
    },
    {
      key: "new_service",
      goal: "new_service",
      platforms: ["instagram", "google_business"],
      tone: "modern",
      ideaShort: "Neue Behandlung vorstellen mit Pflegehinweis am Schluss.",
    },
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["instagram", "facebook"],
      tone: "persönlich",
      ideaShort: "Team kurz vorstellen mit einem Foto aus dem Salon-Alltag.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Schreibe eine kurze Headline für einen Friseurbetrieb in {{city}}. Freundlich, modern, ohne Buzzwords. Maximal 7 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Erstelle einen Über-uns-Text (max. 90 Wörter) für einen Friseurbetrieb. Tonalität: freundlich, persönlich, stilbewusst. Keine Übertreibungen, keine Garantien zu Ergebnissen.",
    },
    {
      key: "services_intro",
      prompt:
        "Schreibe einen Einstieg für die Leistungsübersicht eines Friseurs. Klar, einladend, ohne Marketingfloskeln.",
    },
  ],
  recommendedThemes: ["beauty_luxury", "warm_local", "clean_light"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "individual", label: "individuell" },
  ],
  imageGuidance: {
    primaryStyle:
      "Natürliches Licht, Fokus auf Frisuren und Salon-Atmosphäre. Echte Kundinnen und Kunden statt Stockfotos.",
    recommendedSubjects: [
      "Frisur-Detail (Schnittlinie, Farbe)",
      "Aufgeräumter Salon-Innenraum",
      "Werkzeuge im Einsatz (Schere, Kamm)",
      "Team in Aktion",
    ],
    avoid: [
      "Stockfotos mit übertriebenem Lächeln",
      "Glamour-Effekte und harte Filter",
      "Vorher/Nachher mit unrealistischen Ergebnissen",
    ],
  },
  toneOfVoice: ["freundlich", "modern", "persönlich", "stilbewusst"],
  complianceNotes: [],
});
