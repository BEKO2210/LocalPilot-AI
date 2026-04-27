import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  CTA_APPOINTMENT_PRIMARY,
  CTA_CALL,
  CTA_CALLBACK,
  NAME_FIELD,
  PHONE_FIELD,
} from "../preset-helpers";

export const autoWorkshopPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "auto_workshop",
  label: "Autowerkstatt",
  pluralLabel: "Autowerkstätten",
  description:
    "Freie Werkstätten und Kfz-Betriebe, die Inspektion, Reparatur und " +
    "TÜV-Vorbereitung anbieten und Anfragen sauber abwickeln möchten.",
  targetAudience: ["Privatkund:innen", "Pendler:innen", "Kleinunternehmer:innen", "Stammkundschaft"],
  defaultTagline: "Verlässliche Werkstatt für Inspektion, Reparatur und TÜV in {{city}}.",
  defaultHeroTitle: "Sicher unterwegs – mit kurzen Wegen zur Werkstatt.",
  defaultHeroSubtitle:
    "Inspektion, Reparatur, Reifen- und Klimaservice. Termin in wenigen Tagen, klare Kostenrückmeldung.",
  defaultCtas: [CTA_APPOINTMENT_PRIMARY, CTA_CALLBACK, CTA_CALL],
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
      key: "inspection",
      title: "Inspektion",
      shortDescription: "Wartung nach Herstellervorgabe, transparenter Bericht.",
      defaultPriceLabel: "auf Anfrage",
      defaultDurationLabel: "ab 2 Std.",
    },
    {
      key: "oil_change",
      title: "Ölwechsel",
      shortDescription: "Inkl. Filter, Entsorgung und Stempel.",
      defaultPriceLabel: "ab 79 €",
      defaultDurationLabel: "30–45 Min.",
    },
    {
      key: "tire_change",
      title: "Reifenwechsel",
      shortDescription: "Sommer/Winter, Wuchten und Einlagerung möglich.",
      defaultPriceLabel: "ab 39 €",
      defaultDurationLabel: "30–60 Min.",
    },
    {
      key: "brake_service",
      title: "Bremsenservice",
      shortDescription: "Beläge, Scheiben, Bremsflüssigkeit – sicher unterwegs.",
      defaultPriceLabel: "auf Anfrage",
      defaultDurationLabel: "ab 1 Std.",
    },
    {
      key: "diagnostics",
      title: "Fehlerdiagnose",
      shortDescription: "Auslesen, Bewerten, klare Empfehlung.",
      defaultPriceLabel: "ab 49 €",
      defaultDurationLabel: "30–60 Min.",
    },
    {
      key: "ac_service",
      title: "Klimaservice",
      shortDescription: "Wartung der Klimaanlage inkl. Filter.",
      defaultPriceLabel: "ab 79 €",
      defaultDurationLabel: "60 Min.",
    },
    {
      key: "tuev_prep",
      title: "TÜV-Vorbereitung",
      shortDescription: "Sichtprüfung, kleine Mängel direkt beheben.",
      defaultPriceLabel: "ab 39 €",
      defaultDurationLabel: "60–90 Min.",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie schnell bekomme ich einen Termin?",
      answer:
        "Inspektion und Service meist innerhalb von 1–2 Wochen. Bei akuten Problemen rufen Sie uns bitte direkt an – wir versuchen, kurzfristig zu helfen.",
    },
    {
      question: "Bekomme ich ein Angebot vor der Reparatur?",
      answer:
        "Ja. Vor jeder größeren Reparatur erhalten Sie eine Kostenschätzung. Erst nach Ihrer Freigabe wird gearbeitet.",
    },
    {
      question: "Verliere ich die Herstellergarantie, wenn Sie warten?",
      answer:
        "Wir warten nach Herstellervorgabe und mit passenden Teilen. Damit bleibt die Garantie erhalten.",
    },
    {
      question: "Kann ich das Auto bringen und später abholen?",
      answer:
        "Ja, bringen vor Werkstattöffnung oder nach Absprache, Abholung am späten Nachmittag ist meist möglich.",
    },
  ],
  defaultBenefits: [
    {
      title: "Klare Kosten",
      text: "Kostenrückmeldung vor jeder Arbeit, keine Überraschungen.",
    },
    {
      title: "Schnelle Termine",
      text: "Inspektion in 1–2 Wochen, Notfälle nach Rücksprache.",
    },
    {
      title: "Garantie bleibt",
      text: "Wartung nach Herstellervorgabe mit passenden Teilen.",
    },
    {
      title: "Klartext",
      text: "Wir erklären, was nötig ist – und was warten kann.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Anfrage",
      text: "Fahrzeug, Problem oder gewünschte Leistung beschreiben.",
    },
    {
      step: 2,
      title: "Kostenrückmeldung",
      text: "Sie bekommen eine Schätzung, bevor wir arbeiten.",
    },
    {
      step: 3,
      title: "Werkstatttermin",
      text: "Annahme, Reparatur, Sichtprüfung – mit klarer Übergabe.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    {
      key: "vehicleModel",
      label: "Fahrzeugmodell",
      type: "text",
      required: true,
      placeholder: "z. B. VW Golf VII, Bj. 2019",
    },
    {
      key: "licensePlate",
      label: "Kennzeichen",
      type: "text",
      required: false,
      placeholder: "Optional",
    },
    {
      key: "concern",
      label: "Anliegen / Problem",
      type: "textarea",
      required: true,
      placeholder: "z. B. quietscht beim Bremsen",
    },
    {
      key: "preferredDate",
      label: "Wunschtermin",
      type: "date",
      required: false,
    },
  ],
  reviewRequestTemplates: [
    {
      key: "sms_short",
      channel: "sms",
      tone: "short",
      body: "Hallo {{customerName}}, vielen Dank! Eine kurze Google-Bewertung wäre eine große Hilfe: {{reviewLink}}",
    },
    {
      key: "email_friendly",
      channel: "email",
      tone: "friendly",
      body: "Hallo {{customerName}},\n\nIhr Fahrzeug ist abgeholt – wir hoffen, alles passt. Wenn Sie zufrieden waren, hilft uns eine kurze Google-Bewertung sehr:\n{{reviewLink}}\n\nFalls etwas nicht stimmt, melden Sie sich bitte direkt bei uns.",
    },
    {
      key: "whatsapp_followup",
      channel: "whatsapp",
      tone: "follow_up",
      body: "Hallo {{customerName}}, alles ok mit dem Auto? Wenn ja, würde uns eine kurze Google-Bewertung sehr helfen: {{reviewLink}}",
    },
  ],
  socialPostPrompts: [
    {
      key: "seasonal",
      goal: "seasonal",
      platforms: ["facebook", "google_business"],
      tone: "sachlich",
      ideaShort: "Reifenwechsel-Saison: Termin-Slots vorstellen.",
    },
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["facebook"],
      tone: "vertrauenswürdig",
      ideaShort: "Werkstatt-Alltag und Team kurz vorstellen.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["facebook", "google_business"],
      tone: "klar",
      ideaShort: "Klimaservice-Aktion vor dem Sommer.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Schreibe eine sachliche, vertrauenswürdige Headline für eine Autowerkstatt in {{city}}. Keine Marketingfloskeln, max. 9 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für eine freie Werkstatt. Tonalität: sachlich, kompetent, klar. Keine Garantieaussagen.",
    },
    {
      key: "services_intro",
      prompt:
        "Kurzeinleitung zur Leistungsübersicht (max. 60 Wörter). Klar formuliert, ohne Superlative.",
    },
  ],
  recommendedThemes: ["automotive_strong", "craftsman_solid", "clean_light"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "on_request", label: "auf Anfrage" },
  ],
  imageGuidance: {
    primaryStyle:
      "Aufgeräumte Werkstatt, klare Werkzeuge, fokussierte Arbeit. Authentisch statt inszeniert.",
    recommendedSubjects: [
      "Hebebühne mit Fahrzeug",
      "Detail beim Reifen- oder Bremsenservice",
      "Diagnosegerät am Fahrzeug",
      "Saubere Werkstatt-Übersicht",
    ],
    avoid: [
      "Stockfotos mit übertrieben sauberer Werkstatt",
      "Marken-Logos ohne Lizenz",
      "Aggressive Tuning-Optik, falls nicht passend",
    ],
  },
  toneOfVoice: ["sachlich", "vertrauenswürdig", "klar", "kompetent"],
  complianceNotes: [],
});
