/**
 * Account-Businesses-Helper (Code-Session 46).
 *
 * Pure-Logic-Schicht für die „Meine Betriebe"-Liste auf
 * `/account`. Liefert eine Mapper-Funktion, die einen
 * PostgREST-Embed-Row in eine UI-freundliche `BusinessMembership`-
 * Form bringt — testbar ohne Browser/Server-Runtime.
 *
 * RLS-Hinweis: die Query gegen `business_owners` filtert bereits
 * via Policy auf `user_id = auth.uid()`. Wir geben `userId`
 * trotzdem explizit als Filter an — kostet nichts extra
 * (Index `business_owners_user_id_idx` aus Migration 0006), macht
 * den Intent im Code sichtbar, und schützt gegen versehentliches
 * Service-Role-Aufrufen.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { IndustryKey, PackageTier } from "@/types/common";

export type MembershipRole = "owner" | "editor" | "viewer";

export interface BusinessMembership {
  readonly businessId: string;
  readonly slug: string;
  readonly name: string;
  readonly industryKey: IndustryKey;
  readonly packageTier: PackageTier;
  readonly tagline: string;
  readonly role: MembershipRole;
  readonly isPublished: boolean;
}

interface BusinessEmbed {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly industry_key: string;
  readonly package_tier: string;
  readonly tagline: string;
  readonly is_published: boolean;
}

/** Form, in der PostgREST den Embed liefert.
 *
 * Wir akzeptieren beides — Single-Object (PostgREST many-to-one)
 * und Array (supabase-js-v2-Type-Inferenz). Mapper normalisiert.
 */
export interface MembershipRow {
  readonly role: string;
  readonly businesses:
    | BusinessEmbed
    | readonly BusinessEmbed[]
    | null
    | undefined;
}

const VALID_ROLES: readonly MembershipRole[] = ["owner", "editor", "viewer"];

function unwrapEmbed(
  embed: MembershipRow["businesses"],
): BusinessEmbed | null {
  if (!embed) return null;
  if (Array.isArray(embed)) return embed[0] ?? null;
  return embed as BusinessEmbed;
}

/**
 * Mapt eine PostgREST-Embed-Row auf `BusinessMembership`. Liefert
 * `null`, wenn die Row defekt ist (kein businesses-Embed,
 * unbekannte Rolle, fehlende Felder). Defekte Rows entstehen
 * normalerweise nicht — RLS und Cascade-FKs verhindern Waisen —
 * aber wir wollen den UI-Code robust halten.
 */
export function mapMembershipRow(
  row: MembershipRow,
): BusinessMembership | null {
  const b = unwrapEmbed(row.businesses);
  if (!b) return null;
  if (!VALID_ROLES.includes(row.role as MembershipRole)) return null;
  if (!b.id || !b.slug || !b.name) return null;
  return {
    businessId: b.id,
    slug: b.slug,
    name: b.name,
    industryKey: b.industry_key as IndustryKey,
    packageTier: b.package_tier as PackageTier,
    tagline: b.tagline ?? "",
    role: row.role as MembershipRole,
    isPublished: Boolean(b.is_published),
  };
}

/**
 * Liefert die Betriebe, an denen der User Mitglied ist
 * (owner/editor/viewer).
 *
 * Sortierung: Owner-Rollen zuerst, dann alphabetisch nach Name —
 * macht die „Mein Hauptbetrieb"-Wahrnehmung klar, ohne dass wir
 * eine separate `is_primary`-Flag brauchen.
 */
export async function fetchBusinessesForUser(
  client: SupabaseClient,
  userId: string,
): Promise<readonly BusinessMembership[]> {
  const { data, error } = await client
    .from("business_owners")
    .select(
      "role, businesses(id, slug, name, industry_key, package_tier, tagline, is_published)",
    )
    .eq("user_id", userId);
  if (error) {
    throw new Error(`fetchBusinessesForUser: ${error.message}`);
  }
  // supabase-js v2 typisiert FK-Embeds konservativ als Array, auch bei
  // many-to-one (`business_owners.business_id → businesses.id`). Zur
  // Laufzeit liefert PostgREST hier ein Single-Object oder null. Wir
  // normalisieren in `mapMembershipRow` defensiv beide Formen.
  const rows = (data ?? []) as unknown as readonly MembershipRow[];
  const memberships: BusinessMembership[] = [];
  for (const row of rows) {
    const m = mapMembershipRow(row);
    if (m) memberships.push(m);
  }
  return sortMemberships(memberships);
}

/** Test-Helper: stabile Sortierung — Owner zuerst, dann nach Name. */
export function sortMemberships(
  list: readonly BusinessMembership[],
): readonly BusinessMembership[] {
  const ROLE_RANK: Record<MembershipRole, number> = {
    owner: 0,
    editor: 1,
    viewer: 2,
  };
  return [...list].sort((a, b) => {
    const r = ROLE_RANK[a.role] - ROLE_RANK[b.role];
    if (r !== 0) return r;
    return a.name.localeCompare(b.name, "de");
  });
}

const ROLE_LABELS: Record<MembershipRole, string> = {
  owner: "Inhaber:in",
  editor: "Bearbeiter:in",
  viewer: "Betrachter:in",
};

const TIER_LABELS: Record<PackageTier, string> = {
  bronze: "Bronze",
  silber: "Silber",
  gold: "Gold",
  platin: "Platin",
};

/** UI-Label für eine Rolle (deutsch, gendergerecht). */
export function roleLabel(role: MembershipRole): string {
  return ROLE_LABELS[role];
}

/** UI-Label für einen Paket-Tier (deutsch). */
export function tierLabel(tier: PackageTier): string {
  return TIER_LABELS[tier] ?? tier;
}

/**
 * Single-Business-Redirect-Logik (Code-Session 63).
 *
 * Wenn ein Owner nur einen Betrieb hat, ist die Account-Liste ein
 * unnötiger Klick — wir schicken ihn direkt aufs Dashboard. Der
 * `stay`-Bypass lässt den User aber bewusst zur Liste, falls er
 * später einen zweiten Betrieb anlegen oder den ersten löschen
 * will.
 *
 * Pure: kein React/Next.js — der Aufrufer baut sich daraus den
 * `router.replace(...)`-Call. Tests stubben nur das Input.
 */
export function shouldRedirectToSingle(
  list: readonly BusinessMembership[],
  options: { readonly stay?: boolean } = {},
): string | null {
  if (options.stay) return null;
  if (list.length !== 1) return null;
  const only = list[0];
  if (!only) return null;
  // Defensive: leere/whitespace-Slugs nicht redirecten — wären
  // ein Daten-Inkonsistenz, die wir nicht kaschieren wollen.
  const slug = only.slug.trim();
  if (slug.length === 0) return null;
  return `/dashboard/${slug}`;
}
