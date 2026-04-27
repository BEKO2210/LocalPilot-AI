/**
 * Smoketest für die Zod-Schemas aus Session 2.
 *
 * Wird derzeit nicht via Test-Runner gestartet (Vitest folgt später),
 * sondern dient als Compile-Zeit-Sanity: Jeder hier verwendete `parse()`-Aufruf
 * stellt sicher, dass die Schemas mit den TypeScript-Typen übereinstimmen.
 * Wenn Schema oder Typ driftet, schlägt schon `tsc --noEmit` fehl.
 */

import {
  BusinessSchema,
  LeadSchema,
  PricingTierSchema,
  IndustryPresetSchema,
  ThemeSchema,
  ServiceSchema,
  ReviewSchema,
  FAQSchema,
  TIER_UNLIMITED,
  WebsiteCopyOutputSchema,
} from "@/core/validation";
import { validateMockDataset } from "@/data/mock-types";

const NOW = "2026-04-27T08:30:00Z";

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const exampleService = ServiceSchema.parse({
  id: "svc-1",
  businessId: "biz-1",
  category: "Haarschnitt",
  title: "Damenhaarschnitt",
  shortDescription: "Schnitt inkl. Beratung und Styling.",
  longDescription: "",
  priceLabel: "ab 39 €",
  durationLabel: "60 Min.",
  tags: ["damen", "schnitt"],
  isFeatured: true,
  isActive: true,
  sortOrder: 1,
});

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

const exampleReview = ReviewSchema.parse({
  id: "rev-1",
  businessId: "biz-1",
  authorName: "Anna M.",
  rating: 5,
  text: "Sehr nett, schnelle Termine, super Beratung.",
  source: "google",
  createdAt: NOW,
  isPublished: true,
});

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const exampleFaq = FAQSchema.parse({
  id: "faq-1",
  question: "Wie buche ich einen Termin?",
  answer: "Über das Kontaktformular oder telefonisch.",
  sortOrder: 1,
  isActive: true,
});

// ---------------------------------------------------------------------------
// Lead
// ---------------------------------------------------------------------------

const exampleLead = LeadSchema.parse({
  id: "lead-1",
  businessId: "biz-1",
  source: "website_form",
  name: "Max Mustermann",
  phone: "+49 30 1234567",
  message: "Termin nächste Woche?",
  status: "new",
  notes: "",
  createdAt: NOW,
  updatedAt: NOW,
});

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

const examplePricing = PricingTierSchema.parse({
  key: "bronze",
  label: "Bronze",
  setupPrice: 499,
  monthlyPrice: 49,
  currency: "EUR",
  description: "Saubere digitale Präsenz für kleine Betriebe.",
  features: ["public_website", "industry_preset", "single_theme"],
  limits: {
    maxServices: 10,
    maxLandingPages: 1,
    maxLanguages: 1,
    maxLocations: 1,
    maxThemes: 1,
    maxAiGenerationsPerMonth: 0,
    maxLeads: TIER_UNLIMITED,
  },
  recommendedFor: ["Kleine Betriebe ohne Marketingressourcen"],
  ctaLabel: "Bronze anfragen",
});

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

const exampleTheme = ThemeSchema.parse({
  key: "clean_light",
  label: "Clean Light",
  description: "Hell, modern, neutral – passt zu vielen Branchen.",
  colors: {
    primary: "#1f47d6",
    primaryForeground: "#ffffff",
    secondary: "#0f1320",
    secondaryForeground: "#ffffff",
    accent: "#3563f0",
    background: "#ffffff",
    foreground: "#0f1320",
    muted: "#f6f7f9",
    mutedForeground: "#67738a",
    border: "#d5dae2",
  },
  typography: {
    headingFontFamily: "Inter",
    bodyFontFamily: "Inter",
    baseFontSize: "16px",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "tight",
  },
  radius: "xl",
  shadow: "soft",
  sectionStyle: "comfortable",
  buttonStyle: "rounded",
  cardStyle: "soft",
  suitableForIndustries: [],
});

// ---------------------------------------------------------------------------
// IndustryPreset (minimaler aber valider Datensatz)
// ---------------------------------------------------------------------------

const examplePreset = IndustryPresetSchema.parse({
  key: "hairdresser",
  label: "Friseur",
  pluralLabel: "Friseure",
  description:
    "Friseurbetriebe, die mit klaren Texten, Terminbuchung und Bewertungen sichtbar werden möchten.",
  targetAudience: ["Damen", "Herren", "Kinder"],
  defaultTagline: "Ihr Friseur in {{city}} – freundlich, schnell, stilbewusst.",
  defaultHeroTitle: "Frischer Look, freundlich beraten.",
  defaultHeroSubtitle:
    "Schnelle Termine, klare Preise und saubere Arbeit – direkt vor Ort.",
  defaultCtas: [
    { key: "appointment", label: "Termin anfragen", intent: "appointment", primary: true },
    { key: "call", label: "Jetzt anrufen", intent: "call", primary: false },
  ],
  recommendedSections: [
    "hero",
    "services",
    "benefits",
    "reviews",
    "faq",
    "contact",
    "opening_hours",
  ],
  defaultServices: [
    {
      key: "ladies_cut",
      title: "Damenhaarschnitt",
      shortDescription: "Schnitt inkl. Beratung.",
      defaultPriceLabel: "ab 39 €",
      defaultDurationLabel: "60 Min.",
    },
  ],
  defaultFaqs: [
    {
      question: "Wie buche ich einen Termin?",
      answer: "Über das Kontaktformular oder telefonisch.",
    },
  ],
  defaultBenefits: [
    { title: "Schnelle Termine", text: "Kurzfristige Slots auch unter der Woche." },
  ],
  defaultProcessSteps: [],
  leadFormFields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "phone", label: "Telefon", type: "phone", required: true },
  ],
  reviewRequestTemplates: [
    {
      key: "whatsapp_short",
      channel: "whatsapp",
      tone: "short",
      body: "Hallo {{customerName}}, danke für Ihren Besuch. Eine kurze Bewertung würde uns sehr helfen: {{reviewLink}}",
    },
  ],
  socialPostPrompts: [
    {
      key: "new_offer",
      goal: "promote_offer",
      platforms: ["instagram", "facebook"],
      tone: "freundlich",
      ideaShort: "Sommer-Aktion vorstellen mit Vorher-/Nachher-Idee.",
    },
  ],
  websiteCopyPrompts: [
    {
      key: "hero_title",
      prompt: "Schreibe eine kurze, einladende Headline für einen Friseurbetrieb.",
    },
  ],
  recommendedThemes: ["beauty_luxury", "warm_local", "clean_light"],
  recommendedPricingLabels: [{ key: "from", label: "ab" }],
  imageGuidance: {
    primaryStyle: "Natürliches Licht, Fokus auf Frisuren.",
    recommendedSubjects: ["Frisur-Detail", "Salon-Innenraum"],
    avoid: ["Stockfotos mit übertriebenem Lächeln"],
  },
  toneOfVoice: ["freundlich", "modern", "stilbewusst"],
  complianceNotes: [],
});

// ---------------------------------------------------------------------------
// Business
// ---------------------------------------------------------------------------

const exampleBusiness = BusinessSchema.parse({
  id: "biz-1",
  slug: "studio-haarlinie",
  name: "Studio Haarlinie",
  industryKey: examplePreset.key,
  packageTier: examplePricing.key,
  locale: "de",
  tagline: "Friseur mit Stil – mitten in Musterstadt.",
  description:
    "Wir machen unkomplizierte, hochwertige Haarschnitte und Farben für Damen, Herren und Kinder.",
  address: {
    street: "Musterstraße 1",
    city: "Musterstadt",
    postalCode: "10115",
    country: "DE",
  },
  contact: {
    phone: "+49 30 1234567",
    email: "hallo@haarlinie-demo.de",
  },
  openingHours: [
    { day: "monday", closed: true, slots: [] },
    {
      day: "tuesday",
      closed: false,
      slots: [{ open: "09:00", close: "18:00" }],
    },
    {
      day: "wednesday",
      closed: false,
      slots: [{ open: "09:00", close: "18:00" }],
    },
    {
      day: "thursday",
      closed: false,
      slots: [{ open: "09:00", close: "20:00" }],
    },
    {
      day: "friday",
      closed: false,
      slots: [{ open: "09:00", close: "20:00" }],
    },
    {
      day: "saturday",
      closed: false,
      slots: [{ open: "09:00", close: "14:00" }],
    },
    { day: "sunday", closed: true, slots: [] },
  ],
  themeKey: exampleTheme.key,
  services: [exampleService],
  reviews: [exampleReview],
  faqs: [exampleFaq],
  teamMembers: [],
  isPublished: true,
  createdAt: NOW,
  updatedAt: NOW,
});

// ---------------------------------------------------------------------------
// Mock-Dataset und AI-Output
// ---------------------------------------------------------------------------

const dataset = validateMockDataset({
  generatedAt: NOW,
  businesses: [exampleBusiness],
  leads: [exampleLead],
});

const exampleAiOutput = WebsiteCopyOutputSchema.parse({
  heroTitle: "Frischer Look, freundlich beraten.",
  heroSubtitle: "Schnelle Termine und saubere Arbeit – direkt vor Ort.",
  aboutText:
    "Wir sind ein kleines Team, das modernen Schnitt mit ehrlicher Beratung kombiniert.",
});

// Damit der Linter die Variablen nicht als ungenutzt markiert.
export const __SCHEMA_SMOKETEST__ = {
  service: exampleService,
  review: exampleReview,
  faq: exampleFaq,
  lead: exampleLead,
  pricing: examplePricing,
  theme: exampleTheme,
  preset: examplePreset,
  business: exampleBusiness,
  dataset,
  aiOutput: exampleAiOutput,
};
