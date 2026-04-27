/**
 * Konfig-Map für alle 7 Mock-Methoden des KI-Assistent-Playgrounds.
 *
 * Pro Methode definieren wir:
 *   - Anzeige-Metadaten (Label, Beschreibung, Icon-Key).
 *   - Formularfelder (`fields`) — nur die methoden-spezifisch
 *     variablen Eingaben. Branchen-Kontext / Stadt / Tonalität / USPs
 *     kommen aus dem Business-Datensatz und werden als Read-only-Box
 *     angezeigt, nicht editiert.
 *   - Default-Werte (`defaults`) — vorausgefüllt beim Methoden-Wechsel.
 *   - `buildInput(business, formValues)` — übersetzt Form-Werte in
 *     den jeweiligen Mock-Provider-Input.
 *   - `call(input)` — ruft die passende Mock-Methode.
 *
 * Wichtig: das Modul wird **nur clientseitig** gebraucht. Es importiert
 * `mockProvider`, der pure TypeScript ist (kein Node-Backend), damit
 * die Static-Export-Build sauber bleibt. Echte Live-Provider rufen
 * wir hier bewusst nicht — das würde den API-Key in den Browser-
 * Bundle pushen. Live-Provider folgen mit der API-Route hinter Auth.
 */

import {
  Hash,
  MessageCircle,
  Newspaper,
  Sparkles,
  Star,
  Tag,
  Type,
  type LucideIcon,
} from "lucide-react";
import { mockProvider } from "@/core/ai/providers/mock-provider";
import { getPresetOrFallback } from "@/core/industries";
import type { Business } from "@/types/business";
import type {
  AIBusinessContext,
  CustomerReplyInput,
  FaqGenerationInput,
  OfferCampaignInput,
  ReviewRequestInput,
  ServiceDescriptionInput,
  SocialPostInput,
  WebsiteCopyInput,
} from "@/types/ai";
import type {
  GenerationResult,
  PlaygroundField,
  PlaygroundFormValues,
  PlaygroundMethodId,
} from "./types";

/**
 * Baut den `AIBusinessContext` aus Demo-Business + Branchen-Preset.
 * Tonalität und USPs kommen aus dem Preset (für Demo-Zwecke); ein
 * späterer Editor erlaubt pro Betrieb individuelle Werte.
 */
export function contextFromBusiness(business: Business): AIBusinessContext {
  const preset = getPresetOrFallback(business.industryKey);
  return {
    industryKey: business.industryKey,
    packageTier: business.packageTier,
    language: "de",
    businessName: business.name,
    city: business.address.city,
    toneOfVoice: [...preset.toneOfVoice],
    // USPs sind im Preset noch nicht hinterlegt, daher leeres Array.
    uniqueSellingPoints: [],
  };
}

interface MethodConfig {
  readonly id: PlaygroundMethodId;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly fields: readonly PlaygroundField[];
  readonly defaults: PlaygroundFormValues;
  /**
   * Übersetzt Form-Werte + Business-Kontext in den jeweiligen
   * Mock-Provider-Input. Wirft, wenn ein Pflichtfeld leer ist —
   * der Container fängt das ab.
   */
  readonly call: (
    business: Business,
    values: PlaygroundFormValues,
  ) => Promise<GenerationResult>;
}

// ---------------------------------------------------------------------------
// Helper für die `call`-Funktionen
// ---------------------------------------------------------------------------

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function asNumber(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asBool(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true";
  return fallback;
}

// ---------------------------------------------------------------------------
// Methoden-Configs
// ---------------------------------------------------------------------------

const websiteCopyConfig: MethodConfig = {
  id: "website-copy",
  label: "Website-Texte",
  description:
    "Hero-Titel, Hero-Untertitel und Über-uns-Text. Vier Varianten je nach Sektion.",
  icon: Type,
  fields: [
    {
      kind: "select",
      name: "variant",
      label: "Variante",
      options: [
        { value: "hero", label: "Hero (Startseite-Aufmacher)" },
        { value: "about", label: "Über uns" },
        { value: "services_intro", label: "Leistungen (Einleitung)" },
        { value: "benefits_intro", label: "Vorteile (Einleitung)" },
      ],
    },
    {
      kind: "textarea",
      name: "hint",
      label: "Optionaler Hinweis",
      placeholder: `z. B. „bitte besonders auf Brautstyling eingehen"`,
      hint: "Wird als zusätzliche Vorgabe in den Prompt aufgenommen.",
      rows: 2,
    },
  ],
  defaults: { variant: "hero", hint: "" },
  async call(business, values) {
    const input: WebsiteCopyInput = {
      context: contextFromBusiness(business),
      variant: (values.variant ?? "hero") as WebsiteCopyInput["variant"],
      ...(asString(values.hint).length > 0
        ? { hint: asString(values.hint) }
        : {}),
    };
    const output = await mockProvider.generateWebsiteCopy(input);
    return { method: "website-copy", output };
  },
};

const serviceDescriptionConfig: MethodConfig = {
  id: "service-description",
  label: "Service-Beschreibung",
  description:
    "Kurz- und Langversion einer Leistungsbeschreibung. Bestehender Text wird poliert.",
  icon: Newspaper,
  fields: [
    {
      kind: "text",
      name: "serviceTitle",
      label: "Service-Titel",
      placeholder: "z. B. Damenhaarschnitt mit Tiefenpflege",
      required: true,
    },
    {
      kind: "select",
      name: "targetLength",
      label: "Ziel-Länge",
      options: [
        { value: "short", label: "Kurz (1 Absatz)" },
        { value: "medium", label: "Mittel (2 Absätze)" },
        { value: "long", label: "Lang (3 Absätze inkl. Trust)" },
      ],
    },
    {
      kind: "textarea",
      name: "currentDescription",
      label: "Bestehende Beschreibung (optional)",
      placeholder:
        "Wird als Saatzeile poliert, statt komplett neu geschrieben.",
      rows: 3,
    },
  ],
  defaults: {
    serviceTitle: "",
    targetLength: "medium",
    currentDescription: "",
  },
  async call(business, values) {
    const input: ServiceDescriptionInput = {
      context: contextFromBusiness(business),
      serviceTitle: asString(values.serviceTitle),
      currentDescription: asString(values.currentDescription),
      targetLength:
        (values.targetLength as ServiceDescriptionInput["targetLength"]) ??
        "medium",
    };
    const output = await mockProvider.improveServiceDescription(input);
    return { method: "service-description", output };
  },
};

const faqsConfig: MethodConfig = {
  id: "faqs",
  label: "FAQ-Generator",
  description:
    "Branchen-typische Fragen aus dem Preset, optional ergänzt um eigene Themen.",
  icon: MessageCircle,
  fields: [
    {
      kind: "number",
      name: "count",
      label: "Anzahl Fragen",
      min: 1,
      max: 20,
      step: 1,
    },
    {
      kind: "textarea",
      name: "topics",
      label: "Eigene Themen (Komma-getrennt, optional)",
      placeholder: "z. B. Preise, Stornierung, Anfahrt",
      rows: 2,
    },
  ],
  defaults: { count: 6, topics: "" },
  async call(business, values) {
    const topicsRaw = asString(values.topics);
    const topics =
      topicsRaw.length > 0
        ? topicsRaw
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length >= 2)
        : [];
    const input: FaqGenerationInput = {
      context: contextFromBusiness(business),
      topics,
      count: asNumber(values.count, 6),
    };
    const output = await mockProvider.generateFaqs(input);
    return { method: "faqs", output };
  },
};

const customerReplyConfig: MethodConfig = {
  id: "customer-reply",
  label: "Kunden-Antwort",
  description:
    "Höfliche Antwort auf eine Kundennachricht in drei Tonalitäten.",
  icon: MessageCircle,
  fields: [
    {
      kind: "textarea",
      name: "customerMessage",
      label: "Kunden-Nachricht",
      placeholder:
        "z. B. Wann hätten Sie nächste Woche einen Termin frei?",
      rows: 4,
      required: true,
    },
    {
      kind: "select",
      name: "tone",
      label: "Tonalität",
      options: [
        { value: "short", label: "Kurz (1–2 Sätze)" },
        { value: "friendly", label: "Freundlich (warm, persönlich)" },
        { value: "professional", label: "Professionell (sachlich)" },
      ],
    },
  ],
  defaults: { customerMessage: "", tone: "friendly" },
  async call(business, values) {
    const input = {
      context: contextFromBusiness(business),
      customerMessage: asString(values.customerMessage),
      tone: (values.tone ?? "friendly") as CustomerReplyInput["tone"],
    } satisfies CustomerReplyInput;
    const output = await mockProvider.generateCustomerReply(input);
    return { method: "customer-reply", output };
  },
};

const reviewRequestConfig: MethodConfig = {
  id: "review-request",
  label: "Bewertungs-Anfrage",
  description:
    "Vorlagen für WhatsApp/SMS/E-Mail/persönlich, je drei Tonalitäten.",
  icon: Star,
  fields: [
    {
      kind: "select",
      name: "channel",
      label: "Kanal",
      options: [
        { value: "whatsapp", label: "WhatsApp" },
        { value: "sms", label: "SMS" },
        { value: "email", label: "E-Mail" },
        { value: "in_person", label: "Persönlich (gesprochen)" },
      ],
    },
    {
      kind: "select",
      name: "tone",
      label: "Tonalität",
      options: [
        { value: "short", label: "Kurz (Ein-Satz-Ask)" },
        { value: "friendly", label: "Freundlich (warm, mit Dank)" },
        { value: "follow_up", label: "Follow-Up (sanftes Nachfassen)" },
      ],
    },
    {
      kind: "text",
      name: "customerName",
      label: "Kundenname (optional)",
      placeholder: "z. B. Frau Schmidt",
    },
    {
      kind: "text",
      name: "reviewLink",
      label: "Bewertungs-Link (optional)",
      placeholder: "https://g.page/r/...",
      hint: `Volle URL — sonst bleibt der Platzhalter „[Bewertungs-Link einfügen]" stehen.`,
    },
  ],
  defaults: {
    channel: "whatsapp",
    tone: "friendly",
    customerName: "",
    reviewLink: "",
  },
  async call(business, values) {
    const customerName = asString(values.customerName);
    const reviewLink = asString(values.reviewLink);
    const input: ReviewRequestInput = {
      context: contextFromBusiness(business),
      channel: (values.channel ?? "whatsapp") as ReviewRequestInput["channel"],
      tone: (values.tone ?? "friendly") as ReviewRequestInput["tone"],
      ...(customerName.length > 0 ? { customerName } : {}),
      ...(reviewLink.length > 0 ? { reviewLink } : {}),
    };
    const output = await mockProvider.generateReviewRequest(input);
    return { method: "review-request", output };
  },
};

const socialPostConfig: MethodConfig = {
  id: "social-post",
  label: "Social-Media-Post",
  description:
    "Plattform-bewusste Posts mit Hashtag-Pool und CTA. 5 Plattformen × 8 Goals.",
  icon: Hash,
  fields: [
    {
      kind: "select",
      name: "platform",
      label: "Plattform",
      options: [
        { value: "instagram", label: "Instagram (5 Hashtags)" },
        { value: "facebook", label: "Facebook (1–2 Hashtags)" },
        { value: "google_business", label: "Google Business (0 Hashtags)" },
        { value: "linkedin", label: "LinkedIn (3–5 Hashtags)" },
        { value: "whatsapp_status", label: "WhatsApp-Status (0 Hashtags)" },
      ],
    },
    {
      kind: "select",
      name: "goal",
      label: "Ziel",
      options: [
        { value: "more_appointments", label: "Mehr Termine" },
        { value: "promote_offer", label: "Aktion bewerben" },
        { value: "new_service", label: "Neuer Service" },
        { value: "collect_review", label: "Bewertung sammeln" },
        { value: "seasonal", label: "Saisonal" },
        { value: "before_after", label: "Vorher / Nachher" },
        { value: "trust_building", label: "Vertrauen aufbauen" },
        { value: "team_intro", label: "Team vorstellen" },
      ],
    },
    {
      kind: "text",
      name: "topic",
      label: "Konkretes Thema",
      placeholder: "z. B. Frühlings-Aktion: 20 % auf Pflegebehandlung",
      required: true,
    },
    {
      kind: "select",
      name: "length",
      label: "Länge (Lang-Variante)",
      options: [
        { value: "short", label: "Kurz" },
        { value: "medium", label: "Mittel" },
        { value: "long", label: "Lang (mit USP-Trust-Block)" },
      ],
    },
    {
      kind: "switch",
      name: "includeHashtags",
      label: "Hashtags einfügen",
    },
  ],
  defaults: {
    platform: "instagram",
    goal: "more_appointments",
    topic: "",
    length: "medium",
    includeHashtags: true,
  },
  async call(business, values) {
    const input: SocialPostInput = {
      context: contextFromBusiness(business),
      platform: (values.platform ?? "instagram") as SocialPostInput["platform"],
      goal: (values.goal ?? "more_appointments") as SocialPostInput["goal"],
      topic: asString(values.topic),
      length: (values.length ?? "medium") as SocialPostInput["length"],
      includeHashtags: asBool(values.includeHashtags, true),
    };
    const output = await mockProvider.generateSocialPost(input);
    return { method: "social-post", output };
  },
};

const offerCampaignConfig: MethodConfig = {
  id: "offer-campaign",
  label: "Angebots-Kampagne",
  description:
    "Headline + Subline + Body + zeit-orientiertes CTA. Echte Knappheit nur mit `validUntil`.",
  icon: Tag,
  fields: [
    {
      kind: "text",
      name: "offerTitle",
      label: "Titel der Aktion",
      placeholder: "z. B. Frühlings-Aktion 20 %",
      required: true,
    },
    {
      kind: "textarea",
      name: "details",
      label: "Details (optional)",
      placeholder: "Stichworte oder ein erster Entwurf — wird poliert.",
      rows: 3,
    },
    {
      kind: "text",
      name: "validUntil",
      label: "Gültig bis (optional)",
      placeholder: `z. B. 31.05.2026 oder „Ende Mai"`,
      hint: "Nur ausfüllen, wenn die Aktion wirklich endet — sonst bleibt der CTA neutral.",
    },
  ],
  defaults: { offerTitle: "", details: "", validUntil: "" },
  async call(business, values) {
    const validUntil = asString(values.validUntil);
    const input: OfferCampaignInput = {
      context: contextFromBusiness(business),
      offerTitle: asString(values.offerTitle),
      details: asString(values.details),
      ...(validUntil.length > 0 ? { validUntil } : {}),
    };
    const output = await mockProvider.generateOfferCampaign(input);
    return { method: "offer-campaign", output };
  },
};

// ---------------------------------------------------------------------------
// Export-Map
// ---------------------------------------------------------------------------

export const METHOD_CONFIGS: Readonly<Record<PlaygroundMethodId, MethodConfig>> = {
  "website-copy": websiteCopyConfig,
  "service-description": serviceDescriptionConfig,
  faqs: faqsConfig,
  "customer-reply": customerReplyConfig,
  "review-request": reviewRequestConfig,
  "social-post": socialPostConfig,
  "offer-campaign": offerCampaignConfig,
};

export const METHOD_ORDER: readonly PlaygroundMethodId[] = [
  "website-copy",
  "service-description",
  "faqs",
  "customer-reply",
  "review-request",
  "social-post",
  "offer-campaign",
];

export type { MethodConfig };
export { Sparkles };
