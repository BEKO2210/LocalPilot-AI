/**
 * Business-Repository (Code-Session 37).
 *
 * Eine **read-only** Abstraktion über zwei Datenquellen:
 *   - Mock-Pfad (`MockBusinessRepository`): liest aus
 *     `src/data/mock-businesses.ts`. Default solange Supabase nicht
 *     scharf konfiguriert ist.
 *   - Supabase-Pfad (`SupabaseBusinessRepository`): liest aus der
 *     `public.businesses`-Tabelle (Migration `0001_businesses.sql`).
 *     Muss Tabelle haben + Public-Read-Policy aktiv.
 *
 * Resolver in `index.ts` wählt den Pfad anhand der ENV. Schreibe-Pfad
 * folgt in einer späteren Session (Session 38+, sobald Auth steht).
 *
 * Wichtig: das Interface ist **schmal** (slug-by-slug + slug-list).
 * CRUD und Joins (Services, Reviews) folgen, sobald die jeweiligen
 * Tabellen existieren. Erstmal bleibt die Public-Site auf Mock —
 * Supabase wird über ein Feature-Flag schrittweise eingeschwenkt.
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
}

/** Mapt eine Postgres-Zeile auf das `Business`-Schema. */
function rowToBusiness(row: BusinessRow): Business {
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
    services: [],
    teamMembers: [],
    reviews: [],
    faqs: [],
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return BusinessSchema.parse(draft);
}

const COLUMNS =
  "id, slug, name, industry_key, package_tier, locale, tagline, description, logo_url, cover_image_url, theme_key, primary_color, secondary_color, accent_color, address, contact, opening_hours, is_published, created_at, updated_at";

export function createSupabaseBusinessRepository(
  client: SupabaseClient,
): BusinessRepository {
  return {
    source: "supabase",
    async findBySlug(slug: string) {
      const { data, error } = await client
        .from("businesses")
        .select(COLUMNS)
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
        .select(COLUMNS)
        .order("created_at", { ascending: true });
      if (error) throw new Error(`businesses.listAll: ${error.message}`);
      return (data ?? []).map((row) => rowToBusiness(row as BusinessRow));
    },
  };
}
