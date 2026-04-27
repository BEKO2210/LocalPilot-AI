import { IndustryPresetSchema } from "@/core/validation/industry.schema";
import type { IndustryPreset } from "@/types/industry";
import {
  COMPLIANCE_NO_MEDICAL_PROMISE,
  CTA_APPOINTMENT_PRIMARY,
  CTA_CALL,
  CTA_QUOTE,
  EMAIL_FIELD,
  MESSAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
  PREFERRED_DATE_FIELD,
} from "../preset-helpers";

export const personalTrainerPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "personal_trainer",
  label: "Personal Trainer",
  pluralLabel: "Personal Trainer",
  description:
    "Personal Trainer:innen für Einzel- und Kleingruppentraining. Texte " +
    "bleiben sachlich – keine Heilversprechen, keine garantierten Ergebnisse.",
  targetAudience: ["Einsteiger:innen", "Wiedereinsteiger:innen", "Berufstätige", "Sportler:innen"],
  defaultTagline: "Training, das zu Ihnen passt – persönlich begleitet in {{city}}.",
  defaultHeroTitle: "Stärker werden. In Ihrem Tempo.",
  defaultHeroSubtitle:
    "Ob Einstieg, Wiedereinstieg oder gezieltes Training – mit klarer Planung und ehrlicher Rückmeldung.",
  defaultCtas: [CTA_APPOINTMENT_PRIMARY, CTA_QUOTE, CTA_CALL],
  recommendedSections: [
    "hero",
    "services",
    "benefits",
    "process",
    "reviews",
    "faq",
    "contact",
  ],
  defaultServices: [
    {
      key: "single_session",
      title: "Einzelstunde",
      shortDescription: "60 Minuten Training, individuell geplant.",
      defaultPriceLabel: "ab 79 €",
      defaultDurationLabel: "60 Min.",
    },
    {
      key: "starter_package",
      title: "Einsteigerpaket",
      shortDescription: "5 Stunden plus Plan und Rückmeldung.",
      defaultPriceLabel: "ab 349 €",
    },
    {
      key: "ten_pack",
      title: "10er Paket",
      shortDescription: "Mehrere Termine zum Vorzugspreis.",
      defaultPriceLabel: "ab 690 €",
    },
    {
      key: "small_group",
      title: "Kleingruppe (2–4 Personen)",
      shortDescription: "Gemeinsam trainieren, individuell betreut.",
      defaultPriceLabel: "ab 35 € / Person",
      defaultDurationLabel: "60 Min.",
    },
    {
      key: "online_coaching",
      title: "Online-Coaching",
      shortDescription: "Plan, Calls und Rückmeldung über digitale Tools.",
      defaultPriceLabel: "ab 99 € / Monat",
    },
  ],
  defaultFaqs: [
    {
      question: "Brauche ich Vorerfahrung?",
      answer:
        "Nein. Wir starten dort, wo Sie stehen, und passen die Übungen an. Erfahrungen helfen, sind aber nicht nötig.",
    },
    {
      question: "Wie schnell sehe ich Erfolge?",
      answer:
        "Das ist sehr individuell. Mit regelmäßigem Training entstehen erste spürbare Veränderungen oft nach 4–8 Wochen. Garantieren können wir das nicht.",
    },
    {
      question: "Wo trainieren wir?",
      answer:
        "Im Studio, draußen oder bei Ihnen zu Hause – je nach Setting und Zielen.",
    },
    {
      question: "Trainieren Sie auch nach Verletzungen?",
      answer:
        "Wir trainieren mit gesunden Erwachsenen. Bei Verletzungen oder gesundheitlichen Themen klären Sie das bitte vorher mit ärztlicher Stelle.",
    },
  ],
  defaultBenefits: [
    {
      title: "Individuelle Planung",
      text: "Übungen, Frequenz und Pausen abgestimmt auf Sie.",
    },
    {
      title: "Ehrliche Rückmeldung",
      text: "Was funktioniert, was wir anpassen sollten.",
    },
    {
      title: "Klare Pakete",
      text: "Sie wissen vor dem Start, was Sie bekommen.",
    },
    {
      title: "Flexibel",
      text: "Studio, draußen oder zu Hause – nach Setting.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Erstgespräch",
      text: "Ziele, Vorerfahrung und Setting klären.",
    },
    {
      step: 2,
      title: "Plan",
      text: "Trainingsplan mit klarer Struktur und realistischen Zwischenschritten.",
    },
    {
      step: 3,
      title: "Trainings",
      text: "Persönlich begleitet, mit Rückmeldung nach jeder Einheit.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    EMAIL_FIELD,
    {
      key: "goals",
      label: "Ziele",
      type: "textarea",
      required: true,
      placeholder: "z. B. Kraft aufbauen, abnehmen, Rücken stärken",
    },
    {
      key: "experienceLevel",
      label: "Vorerfahrung",
      type: "select",
      required: false,
      options: [
        { value: "none", label: "Keine" },
        { value: "some", label: "Etwas" },
        { value: "regular", label: "Regelmäßig aktiv" },
      ],
    },
    PREFERRED_DATE_FIELD,
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "whatsapp_friendly",
      channel: "whatsapp",
      tone: "friendly",
      body: "Hallo {{customerName}}, schön, dass Sie dabei sind. Wenn das Training Ihnen geholfen hat, hilft uns eine kurze Google-Bewertung sehr → {{reviewLink}}",
    },
    {
      key: "email_followup",
      channel: "email",
      tone: "follow_up",
      body: "Hallo {{customerName}},\n\nwir sind ein paar Wochen unterwegs – wie ist Ihr Eindruck bisher? Falls Sie zufrieden sind, würde uns eine kurze Google-Bewertung sehr helfen:\n{{reviewLink}}",
    },
  ],
  socialPostPrompts: [
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["instagram", "facebook"],
      tone: "ehrlich",
      ideaShort: "Trainings-Alltag zeigen, ohne Versprechen.",
    },
    {
      key: "new_service",
      goal: "new_service",
      platforms: ["instagram"],
      tone: "freundlich",
      ideaShort: "Neues Paket oder Format vorstellen, klar formuliert.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für Personal Trainer in {{city}}. Realistisch, freundlich, max. 8 Wörter. Keine garantierten Ergebnisse.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für Personal Trainer. Tonalität: ehrlich, klar, freundlich. Keine Heilsversprechen.",
    },
  ],
  recommendedThemes: ["fitness_energy", "clean_light", "education_calm"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "package", label: "Paket" },
  ],
  imageGuidance: {
    primaryStyle:
      "Authentische Trainingssituationen, klare Posen, helle Räume. Keine perfekt inszenierten Models.",
    recommendedSubjects: [
      "Trainingssituation mit Coach",
      "Übungsdetails (Bewegungsausführung)",
      "Trainingsraum oder Outdoor-Spot",
    ],
    avoid: [
      "Stockfotos mit übertrieben durchtrainierten Models",
      "Vorher/Nachher mit unrealistischen Versprechen",
    ],
  },
  toneOfVoice: ["ehrlich", "klar", "freundlich", "motivierend"],
  complianceNotes: [COMPLIANCE_NO_MEDICAL_PROMISE],
});
