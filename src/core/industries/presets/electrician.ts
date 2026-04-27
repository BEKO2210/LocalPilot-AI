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

export const electricianPreset: IndustryPreset = IndustryPresetSchema.parse({
  key: "electrician",
  label: "Elektriker",
  pluralLabel: "Elektrofachbetriebe",
  description:
    "Elektrofachbetriebe für Installation, Reparatur und Sicherheitsprüfung. " +
    "Klare Anfragen, schriftliche Angebote, saubere Arbeit.",
  targetAudience: ["Privatkund:innen", "Hausverwaltungen", "Gewerbekund:innen", "Hauseigentümer:innen"],
  defaultTagline: "Elektroarbeiten in {{city}} – sicher, sauber, eingehalten.",
  defaultHeroTitle: "Strom, der hält. Sicherheit, die passt.",
  defaultHeroSubtitle:
    "Installation, Reparatur und Prüfung – mit klarer Kostenrückmeldung und kurzen Reaktionszeiten.",
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
      key: "installation",
      title: "Elektroinstallation",
      shortDescription: "Neuinstallation und Erweiterung.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "repair",
      title: "Reparatur & Störung",
      shortDescription: "Schnelle Hilfe bei Defekten und Störungen.",
      defaultPriceLabel: "ab 89 €",
      defaultDurationLabel: "ab 1 Std.",
    },
    {
      key: "safety_check",
      title: "Sicherheitsprüfung (E-Check)",
      shortDescription: "Prüfung Ihrer Anlage gemäß Vorgaben.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "lighting",
      title: "Beleuchtung",
      shortDescription: "Innen und außen, individuell geplant.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "smart_home",
      title: "Smart Home",
      shortDescription: "Beratung, Planung, Umsetzung.",
      defaultPriceLabel: "auf Anfrage",
    },
    {
      key: "ev_charger",
      title: "Wallbox / Ladestation",
      shortDescription: "Montage und Inbetriebnahme für Elektroautos.",
      defaultPriceLabel: "auf Anfrage",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie schnell können Sie kommen?",
      answer:
        "Akute Störungen so schnell wie möglich, in der Regel innerhalb von 1–2 Werktagen. Größere Aufträge nach Terminvereinbarung.",
    },
    {
      question: "Erstellen Sie ein verbindliches Angebot?",
      answer:
        "Ja. Nach einer Aufnahme vor Ort oder mit Fotos und Maßen erhalten Sie ein schriftliches Angebot.",
    },
    {
      question: "Sind Sie ein Fachbetrieb?",
      answer:
        "Ja, eingetragener Elektrofachbetrieb mit Meisterführung und Versicherung.",
    },
    {
      question: "Übernehmen Sie auch kleine Aufträge?",
      answer:
        "Ja. Auch der Austausch einer Steckdose oder das Anschließen einer Lampe ist möglich.",
    },
  ],
  defaultBenefits: [
    {
      title: "Fachbetrieb",
      text: "Eingetragen, mit Meisterführung und Versicherung.",
    },
    {
      title: "Klare Kosten",
      text: "Schriftliches Angebot vor der Arbeit.",
    },
    {
      title: "Schnelle Reaktion",
      text: "Bei Störungen kurze Wege, klare Rückmeldung.",
    },
    {
      title: "Sauber dokumentiert",
      text: "Prüfprotokolle und Übergabe inklusive.",
    },
  ],
  defaultProcessSteps: [
    {
      step: 1,
      title: "Anfrage",
      text: "Anliegen kurz beschreiben – gerne mit Foto.",
    },
    {
      step: 2,
      title: "Aufnahme & Angebot",
      text: "Vor Ort oder telefonisch, anschließend schriftliches Angebot.",
    },
    {
      step: 3,
      title: "Termin & Umsetzung",
      text: "Saubere Ausführung mit kurzer Übergabe.",
    },
  ],
  leadFormFields: [
    NAME_FIELD,
    PHONE_FIELD,
    EMAIL_FIELD,
    {
      key: "concernType",
      label: "Anliegen",
      type: "select",
      required: true,
      options: [
        { value: "installation", label: "Installation" },
        { value: "repair", label: "Reparatur / Störung" },
        { value: "safety_check", label: "E-Check" },
        { value: "lighting", label: "Beleuchtung" },
        { value: "smart_home", label: "Smart Home" },
        { value: "ev_charger", label: "Wallbox" },
        { value: "other", label: "Sonstiges" },
      ],
    },
    {
      key: "details",
      label: "Beschreibung",
      type: "textarea",
      required: true,
      placeholder: "z. B. Sicherung fällt regelmäßig im Bad",
    },
    MESSAGE_FIELD,
  ],
  reviewRequestTemplates: [
    {
      key: "email_short",
      channel: "email",
      tone: "short",
      body: "Hallo {{customerName}},\n\nvielen Dank für Ihren Auftrag. Wenn alles passend abgeschlossen wurde, hilft uns eine kurze Google-Bewertung sehr:\n{{reviewLink}}",
    },
    {
      key: "whatsapp_friendly",
      channel: "whatsapp",
      tone: "friendly",
      body: "Hallo {{customerName}}, alles ok mit der Installation? Wenn ja, würde uns eine kurze Google-Bewertung sehr helfen → {{reviewLink}}",
    },
  ],
  socialPostPrompts: [
    {
      key: "trust",
      goal: "trust_building",
      platforms: ["facebook", "google_business"],
      tone: "sachlich",
      ideaShort: "Kurze Vorstellung des Teams und Beispiel einer Sicherheitsprüfung.",
    },
    {
      key: "promote_offer",
      goal: "promote_offer",
      platforms: ["google_business"],
      tone: "vertrauenswürdig",
      ideaShort: "E-Check-Aktion vor der Heizperiode.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt:
        "Headline für einen Elektrofachbetrieb in {{city}}. Sachlich, vertrauenswürdig, max. 9 Wörter.",
    },
    {
      key: "about",
      prompt:
        "Über-uns-Text (max. 100 Wörter) für einen Elektrofachbetrieb. Tonalität: sachlich, kompetent, klar.",
    },
  ],
  recommendedThemes: ["craftsman_solid", "clean_light", "automotive_strong"],
  recommendedPricingLabels: [
    { key: "from", label: "ab" },
    { key: "on_request", label: "auf Anfrage" },
  ],
  imageGuidance: {
    primaryStyle:
      "Sachliche Detailaufnahmen, saubere Verkabelung, ordentlich gesetzte Schalter und Verteiler.",
    recommendedSubjects: [
      "Schaltschrank/Verteiler",
      "Werkzeug im Einsatz",
      "Saubere Endmontage",
    ],
    avoid: [
      "Inszenierte Stockbilder ohne realen Bezug",
      "Aussagen, die Versprechen über elektrische Sicherheit machen",
    ],
  },
  toneOfVoice: ["sachlich", "kompetent", "vertrauenswürdig", "klar"],
  complianceNotes: [],
});
