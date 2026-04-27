/**
 * Business-Repository (Code-Session 37, erweitert in 38).
 *
 * Eine **read-only** Abstraktion über zwei Datenquellen:
 *   - Mock-Pfad (`MockBusinessRepository`): liest aus
 *     `src/data/mock-businesses.ts`. Default solange Supabase nicht
 *     scharf konfiguriert ist.
 *   - Supabase-Pfad (`SupabaseBusinessRepository`): liest aus der
 *     `public.businesses`-Tabelle plus per FK-Embed aus
 *     `public.services` und `public.reviews` (Migrationen 0001–0003).
 *
 * Resolver in `index.ts` wählt den Pfad anhand der ENV. Schreibe-Pfad
 * folgt in einer späteren Session (40+, sobald Auth steht).
 *
 * **Code-Session 38**: Supabase-Impl liefert jetzt zusätzlich zu den
 * Stammdaten auch `services` und `reviews` über PostgREST-Embedding
 * (`select=*, services(*), reviews(*)`). Das ist 1 HTTP-Roundtrip
 * statt 3, RLS wird pro Embed automatisch ausgewertet.
 */

import type { Business } from "@/types/business";
import { BusinessSchema } from "@/core/validation/business.schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface BusinessRepository {
  /** Lädt einen Betrieb anhand des Slugs. `null`, wenn nicht vorhanden. */
  findBySlug(slug: string): Promise<Business | null>;
  /** Listet alle bekannten Slugs (für `generateStaticParams`). */
  listSlugs(): Promise<readonly string[]>;
  /** Listet alle Betriebe (für die Demo-Übersicht `/demo`). */
  listAll(): Promise<readonly Business[]>;
  /** Quellen-Etikett für Telemetrie / Logs / Health. */
  readonly source: "mock" | "supabase";
}

// ---------------------------------------------------------------------------
// Mock-Implementierung
// ---------------------------------------------------------------------------

export interface MockBusinessRepoInput {
  readonly businesses: readonly Business[];
}

export function createMockBusinessRepository(
  input: MockBusinessRepoInput,
): BusinessRepository {
  const bySlug = new Map<string, Business>();
  for (const b of input.businesses) bySlug.set(b.slug, b);
  const slugs = Object.freeze(input.businesses.map((b) => b.slug));
  const all = Object.freeze([...input.businesses]);
  return {
    source: "mock",
    findBySlug(slug: string) {
      return Promise.resolve(bySlug.get(slug) ?? null);
    },
    listSlugs() {
      return Promise.resolve(slugs);
    },
    listAll() {
      return Promise.resolve(all);
    },
  };
}

// ---------------------------------------------------------------------------
// Supabase-Implementierung
// ---------------------------------------------------------------------------

interface ServiceRow {
  readonly id: string;
  readonly business_id: string;
  readonly category: string | null;
  readonly title: string;
  readonly short_description: string;
  readonly long_description: string;
  readonly price_label: string | null;
  readonly duration_label: string | null;
  readonly image_url: string | null;
  readonly icon: string | null;
  readonly tags: readonly string[] | null;
  readonly is_featured: boolean;
  readonly is_active: boolean;
  readonly sort_order: number;
}

interface ReviewRow {
  readonly id: string;
  readonly business_id: string;
  readonly author_name: string;
  readonly rating: number;
  readonly text: string;
  readonly source: string;
  readonly is_published: boolean;
  readonly created_at: string;
}

interface FaqRow {
  readonly id: string;
  readonly business_id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: string | null;
  readonly sort_order: number;
  readonly is_active: boolean;
}

interface BusinessRow {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly industry_key: string;
  readonly package_tier: string;
  readonly locale: string;
  readonly tagline: string;
  readonly description: string;
  readonly logo_url: string | null;
  readonly cover_image_url: string | null;
  readonly theme_key: string;
  readonly primary_color: string | null;
  readonly secondary_color: string | null;
  readonly accent_color: string | null;
  readonly address: unknown;
  readonly contact: unknown;
  readonly opening_hours: unknown;
  readonly is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  /** PostgREST-Embed: leeres Array, falls keine Services oder RLS blockt. */
  readonly services?: readonly ServiceRow[];
  /** Wie services. */
  readonly reviews?: readonly ReviewRow[];
  /** Wie services. */
  readonly faqs?: readonly FaqRow[];
}

function rowToService(row: ServiceRow) {
  return {
    id: row.id,
    businessId: row.business_id,
    ...(row.category ? { category: row.category } : {}),
    title: row.title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    ...(row.price_label ? { priceLabel: row.price_label } : {}),
    ...(row.duration_label ? { durationLabel: row.duration_label } : {}),
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
    ...(row.icon ? { icon: row.icon } : {}),
    tags: row.tags ?? [],
    isFeatured: row.is_featured,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

function rowToReview(row: ReviewRow) {
  return {
    id: row.id,
    businessId: row.business_id,
    authorName: row.author_name,
    rating: row.rating,
    text: row.text,
    source: row.source,
    createdAt: row.created_at,
    isPublished: row.is_published,
  };
}

function rowToFaq(row: FaqRow) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    ...(row.category ? { category: row.category } : {}),
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

/** Mapt eine Postgres-Zeile auf das `Business`-Schema. */
function rowToBusiness(row: BusinessRow): Business {
  // Services nach sort_order sortieren — die SQL-Policy filtert bereits
  // is_active=true; doppelte Defensive schadet nicht, falls mal ein
  // anderer Pfad (Service-Role-Key) doch inaktive Zeilen durchlässt.
  const services = (row.services ?? [])
    .filter((s) => s.is_active)
    .map(rowToService)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const reviews = (row.reviews ?? [])
    .filter((r) => r.is_published)
    .map(rowToReview);
  const faqs = (row.faqs ?? [])
    .filter((f) => f.is_active)
    .map(rowToFaq)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const draft = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    industryKey: row.industry_key,
    packageTier: row.package_tier,
    locale: row.locale,
    tagline: row.tagline,
    description: row.description,
    ...(row.logo_url ? { logoUrl: row.logo_url } : {}),
    ...(row.cover_image_url ? { coverImageUrl: row.cover_image_url } : {}),
    address: row.address,
    contact: row.contact ?? {},
    openingHours: row.opening_hours ?? [],
    themeKey: row.theme_key,
    ...(row.primary_color ? { primaryColor: row.primary_color } : {}),
    ...(row.secondary_color ? { secondaryColor: row.secondary_color } : {}),
    ...(row.accent_color ? { accentColor: row.accent_color } : {}),
    services,
    teamMembers: [],
    reviews,
    faqs,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return BusinessSchema.parse(draft);
}

const BUSINESS_BASE_COLUMNS =
  "id, slug, name, industry_key, package_tier, locale, tagline, description, logo_url, cover_image_url, theme_key, primary_color, secondary_color, accent_color, address, contact, opening_hours, is_published, created_at, updated_at";

// PostgREST-Embed über die Foreign-Keys: ein Roundtrip lädt Business +
// Services + Reviews + FAQs. RLS wird pro embed-Tabelle eigenständig
// ausgewertet, Public-Read-Policies aus Migration 0002/0003/0004 reichen.
// `leads` wird bewusst NICHT eingebettet — andere RLS-Strategie
// (anon darf nicht lesen). Lead-Repository folgt in Session 40.
const BUSINESS_FULL_SELECT = `${BUSINESS_BASE_COLUMNS}, services(*), reviews(*), faqs(*)`;

export function createSupabaseBusinessRepository(
  client: SupabaseClient,
): BusinessRepository {
  return {
    source: "supabase",
    async findBySlug(slug: string) {
      const { data, error } = await client
        .from("businesses")
        .select(BUSINESS_FULL_SELECT)
        .eq("slug", slug)
        .maybeSingle<BusinessRow>();
      if (error) throw new Error(`businesses.findBySlug: ${error.message}`);
      if (!data) return null;
      return rowToBusiness(data);
    },
    async listSlugs() {
      const { data, error } = await client
        .from("businesses")
        .select("slug")
        .order("created_at", { ascending: true });
      if (error) throw new Error(`businesses.listSlugs: ${error.message}`);
      return (data ?? []).map((r: { slug: string }) => r.slug);
    },
    async listAll() {
      const { data, error } = await client
        .from("businesses")
        .select(BUSINESS_FULL_SELECT)
        .order("created_at", { ascending: true });
      if (error) throw new Error(`businesses.listAll: ${error.message}`);
      return (data ?? []).map((row) => rowToBusiness(row as BusinessRow));
    },
  };
}

// Test-Helper: erlauben uns, das Row→Schema-Mapping ohne echten
// Supabase-Client zu verifizieren.
export const __TEST_ONLY_rowToBusiness__ = rowToBusiness;
