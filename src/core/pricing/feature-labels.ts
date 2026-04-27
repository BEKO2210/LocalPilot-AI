/**
 * Deutsche Klartext-Labels für jede Feature-Capability.
 *
 * Wird vom Dashboard und vom Upgrade-Hinweis verwendet, damit nicht-technische
 * Nutzer:innen verstehen, was sie freischalten würden ("KI-Texte für Ihre
 * Website" statt "ai_website_text").
 *
 * Wer einen neuen `FeatureKey` ergänzt, ergänzt ihn:
 *  1. in `src/types/common.ts` (`FEATURE_KEYS`-Tupel)
 *  2. hier als Label
 *  3. ggf. in einem Tier in `pricing-tiers.ts`
 *
 * Die TypeScript-Signatur `Record<FeatureKey, FeatureLabel>` zwingt dazu –
 * fehlt ein Eintrag, schlägt der Typecheck fehl.
 */

import { FEATURE_KEYS, type FeatureKey } from "@/types/common";

export type FeatureGroup =
  | "website"
  | "lead"
  | "ai"
  | "social"
  | "review"
  | "design"
  | "operations";

export type FeatureLabel = {
  label: string;
  description: string;
  group: FeatureGroup;
};

export const FEATURE_LABELS: Record<FeatureKey, FeatureLabel> = {
  // -------------------------------------------------------------------------
  // Website
  // -------------------------------------------------------------------------
  public_website: {
    label: "Öffentliche Website",
    description: "Eigene Betriebs-Website unter einer eindeutigen Adresse.",
    group: "website",
  },
  industry_preset: {
    label: "Branchenvorlage",
    description: "Vorgefertigte Inhalte und Felder passend zur Branche.",
    group: "website",
  },
  service_listing: {
    label: "Leistungen anzeigen",
    description: "Übersicht aller Leistungen mit Beschreibung und Preisen.",
    group: "website",
  },
  contact_form_basic: {
    label: "Kontaktformular",
    description: "Einfaches Anfrageformular auf der öffentlichen Website.",
    group: "website",
  },
  opening_hours: {
    label: "Öffnungszeiten",
    description: "Strukturierte Anzeige der Wochenzeiten.",
    group: "website",
  },
  google_maps_link: {
    label: "Google-Maps-Link",
    description: "Direkter Klick zu Anfahrt und Karte.",
    group: "website",
  },
  basic_seo: {
    label: "Basis-SEO",
    description: "Saubere Meta-Titel, Beschreibungen und lokale Keywords.",
    group: "website",
  },
  multi_section_landing: {
    label: "Mehrere Landingpage-Sektionen",
    description: "Zusätzliche Angebots-, Saison- und Aktionsseiten.",
    group: "website",
  },
  multilingual_content: {
    label: "Mehrsprachige Inhalte",
    description: "Texte in mehreren Sprachen pflegen.",
    group: "website",
  },
  team_section: {
    label: "Team-Bereich",
    description: "Mitarbeitende mit Foto, Rolle und Kurzbeschreibung.",
    group: "website",
  },
  multi_location_ready: {
    label: "Mehrere Standorte",
    description: "Vorbereitung für Filialen oder mehrere Adressen.",
    group: "operations",
  },

  // -------------------------------------------------------------------------
  // Design
  // -------------------------------------------------------------------------
  single_theme: {
    label: "Ein Design",
    description: "Ein passendes Theme aus der Branchenempfehlung.",
    group: "design",
  },
  multiple_themes: {
    label: "Mehrere Designs",
    description: "Auswahl aus mehreren Themes, jederzeit umschaltbar.",
    group: "design",
  },
  premium_themes: {
    label: "Premium-Designs",
    description: "Hochwertige Designs für Beauty, Foto und Premium-Dienste.",
    group: "design",
  },

  // -------------------------------------------------------------------------
  // Leads
  // -------------------------------------------------------------------------
  lead_management: {
    label: "Anfragen verwalten",
    description: "Anfragen sortieren, Status setzen, Notizen pflegen.",
    group: "lead",
  },
  lead_priority: {
    label: "Anfragen-Priorisierung",
    description: "Wichtige Anfragen markieren und nach oben sortieren.",
    group: "lead",
  },
  service_management: {
    label: "Leistungen verwalten",
    description: "Leistungen anlegen, bearbeiten, deaktivieren, sortieren.",
    group: "operations",
  },
  performance_analytics: {
    label: "Auswertung",
    description:
      "Einfache Übersicht zu Anfragen, Quellen und Reaktionszeiten.",
    group: "operations",
  },
  copy_to_clipboard: {
    label: "In Zwischenablage kopieren",
    description: "Generierte Texte mit einem Klick übernehmen.",
    group: "operations",
  },

  // -------------------------------------------------------------------------
  // Bewertungen
  // -------------------------------------------------------------------------
  review_link: {
    label: "Bewertungslink",
    description: "Schnellzugriff zur Google-Bewertung des Betriebs.",
    group: "review",
  },
  review_booster_basic: {
    label: "Bewertungs-Booster (Basis)",
    description: "Eine Standardvorlage für Bewertungsanfragen.",
    group: "review",
  },
  review_booster_advanced: {
    label: "Bewertungs-Booster (Mehrere Vorlagen)",
    description: "Mehrere Vorlagen für WhatsApp, SMS und E-Mail.",
    group: "review",
  },

  // -------------------------------------------------------------------------
  // KI
  // -------------------------------------------------------------------------
  ai_website_text: {
    label: "KI-Texte für die Website",
    description: "Headlines, Untertitel und Über-uns-Texte mit KI generieren.",
    group: "ai",
  },
  ai_service_text: {
    label: "KI-Texte für Leistungen",
    description: "Leistungsbeschreibungen verbessern und in Varianten erzeugen.",
    group: "ai",
  },
  ai_faq_generator: {
    label: "FAQ-Generator",
    description: "Häufige Fragen zur Branche per KI vorschlagen.",
    group: "ai",
  },
  ai_customer_reply: {
    label: "Kundenantworten",
    description: "Höfliche, passende Antworten auf Anfragen erzeugen.",
    group: "ai",
  },
  ai_social_post: {
    label: "Social-Media-Posts",
    description: "Posts mit Hashtags und Bildidee generieren.",
    group: "ai",
  },
  ai_offer_generator: {
    label: "Angebots-Generator",
    description: "Saison- und Aktionsangebote mit klarer Struktur erzeugen.",
    group: "ai",
  },
  ai_campaign_generator: {
    label: "Kampagnen-Generator",
    description: "Mehrteilige Kampagnen über mehrere Wochen vorschlagen.",
    group: "ai",
  },

  // -------------------------------------------------------------------------
  // Social
  // -------------------------------------------------------------------------
  social_media_basic: {
    label: "Social-Media-Generator (Basis)",
    description: "Posts für Instagram, Facebook und Google Business.",
    group: "social",
  },
  social_media_advanced: {
    label: "Social-Media-Generator (Erweitert)",
    description:
      "Serien, Monatspläne und plattformspezifische Optimierungen.",
    group: "social",
  },
};

/**
 * Sicherheitsnetz: Wenn jemand `FEATURE_KEYS` erweitert, aber das Label hier
 * vergisst, schlägt diese Konstante zur Compile-Zeit fehl.
 */
export const FEATURE_LABELS_COVERAGE: ReadonlyArray<FeatureKey> = FEATURE_KEYS;

export function getFeatureLabel(feature: FeatureKey): FeatureLabel {
  return FEATURE_LABELS[feature];
}
