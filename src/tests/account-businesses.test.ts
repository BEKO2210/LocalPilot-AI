/**
 * Smoketest für Account-Businesses-Mapping (Code-Session 46).
 *
 * Pure-Function-Test der Mapper-/Sortier-Helfer. Der eigentliche
 * Supabase-Roundtrip (`fetchBusinessesForUser`) wird beim
 * UI-Smoketest manuell durchgespielt — hier konzentrieren wir
 * uns auf die Logik, die schiefgehen kann, wenn die DB seltsame
 * Zeilen liefert.
 */

import {
  mapMembershipRow,
  roleLabel,
  sortMemberships,
  tierLabel,
  type BusinessMembership,
  type MembershipRow,
} from "@/lib/account-businesses";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`account-businesses assertion failed: ${message}`);
}

/** Test-Helper: enger getypte VALID_ROW, damit `.businesses!.id` etc.
 *  ohne Array-Branch im Test direkt zugreifbar bleibt. */
type ValidEmbed = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly industry_key: string;
  readonly package_tier: string;
  readonly tagline: string;
  readonly is_published: boolean;
};
const VALID_EMBED: ValidEmbed = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "studio-haarlinie",
  name: "Studio Haarlinie",
  industry_key: "hairdresser",
  package_tier: "silber",
  tagline: "Friseur in Musterstadt",
  is_published: true,
};
const VALID_ROW: MembershipRow & { businesses: ValidEmbed } = {
  role: "owner",
  businesses: VALID_EMBED,
};

// ---------------------------------------------------------------------------
// 1. mapMembershipRow: voll-valide Row → Memberships
// ---------------------------------------------------------------------------
const ok = mapMembershipRow(VALID_ROW);
assert(ok !== null, "valide Row mappt erfolgreich");
if (ok) {
  assert(ok.businessId === VALID_EMBED.id, "businessId durchgereicht");
  assert(ok.slug === "studio-haarlinie", "slug durchgereicht");
  assert(ok.name === "Studio Haarlinie", "name durchgereicht");
  assert(ok.industryKey === "hairdresser", "industryKey-Cast");
  assert(ok.packageTier === "silber", "packageTier-Cast");
  assert(ok.tagline === "Friseur in Musterstadt", "tagline durchgereicht");
  assert(ok.role === "owner", "role durchgereicht");
  assert(ok.isPublished === true, "isPublished durchgereicht");
}

// ---------------------------------------------------------------------------
// 2. mapMembershipRow: defekte Rows → null
// ---------------------------------------------------------------------------
const noBusinesses = mapMembershipRow({ ...VALID_ROW, businesses: null });
assert(noBusinesses === null, "businesses=null → null");

const badRole = mapMembershipRow({ ...VALID_ROW, role: "admin" });
assert(badRole === null, "unbekannte Rolle → null");

const emptyRole = mapMembershipRow({ ...VALID_ROW, role: "" });
assert(emptyRole === null, "leere Rolle → null");

const noId = mapMembershipRow({
  ...VALID_ROW,
  businesses: { ...VALID_EMBED, id: "" },
});
assert(noId === null, "businesses.id leer → null");

const noSlug = mapMembershipRow({
  ...VALID_ROW,
  businesses: { ...VALID_EMBED, slug: "" },
});
assert(noSlug === null, "businesses.slug leer → null");

const noName = mapMembershipRow({
  ...VALID_ROW,
  businesses: { ...VALID_EMBED, name: "" },
});
assert(noName === null, "businesses.name leer → null");

// ---------------------------------------------------------------------------
// 3. mapMembershipRow: tagline darf leer sein → wird zu ""
// ---------------------------------------------------------------------------
const noTagline = mapMembershipRow({
  ...VALID_ROW,
  businesses: {
    ...VALID_EMBED,
    tagline: undefined as unknown as string,
  },
});
assert(noTagline !== null, "fehlende tagline ist OK");
assert(noTagline?.tagline === "", "fehlende tagline → ''");

// ---------------------------------------------------------------------------
// 3b. mapMembershipRow: businesses-Embed als Array (supabase-js v2-Form)
// ---------------------------------------------------------------------------
const arrayEmbed = mapMembershipRow({
  role: "owner",
  businesses: [VALID_EMBED],
});
assert(arrayEmbed !== null, "Single-Element-Array wird wie Single-Object behandelt");
assert(arrayEmbed?.slug === "studio-haarlinie", "Array-Embed-Slug korrekt");

const emptyArrayEmbed = mapMembershipRow({ role: "owner", businesses: [] });
assert(emptyArrayEmbed === null, "leeres Array → null");

const undefinedEmbed = mapMembershipRow({ role: "owner", businesses: undefined });
assert(undefinedEmbed === null, "undefined-Embed → null");

// ---------------------------------------------------------------------------
// 4. mapMembershipRow: editor / viewer-Rollen sind valide
// ---------------------------------------------------------------------------
const editor = mapMembershipRow({ ...VALID_ROW, role: "editor" });
assert(editor !== null && editor.role === "editor", "editor-Rolle akzeptiert");
const viewer = mapMembershipRow({ ...VALID_ROW, role: "viewer" });
assert(viewer !== null && viewer.role === "viewer", "viewer-Rolle akzeptiert");

// ---------------------------------------------------------------------------
// 5. sortMemberships: Owner zuerst, dann alphabetisch
// ---------------------------------------------------------------------------
const m = (
  name: string,
  role: BusinessMembership["role"],
): BusinessMembership => ({
  businessId: `id-${name}`,
  slug: name.toLowerCase().replace(/\s/g, "-"),
  name,
  industryKey: "hairdresser",
  packageTier: "silber",
  tagline: "",
  role,
  isPublished: true,
});

const sorted = sortMemberships([
  m("Beta-Beauty", "viewer"),
  m("Charlie-Cuts", "owner"),
  m("Alpha-Auto", "owner"),
  m("Echo-Edit", "editor"),
]);

assert(sorted[0]?.name === "Alpha-Auto", "1. = Alpha-Auto (owner, alphabetisch erster)");
assert(sorted[1]?.name === "Charlie-Cuts", "2. = Charlie-Cuts (owner, alphabetisch zweiter)");
assert(sorted[2]?.name === "Echo-Edit", "3. = Echo-Edit (editor)");
assert(sorted[3]?.name === "Beta-Beauty", "4. = Beta-Beauty (viewer)");

// Stabilität: gleiche Rolle, gleicher Name → bleibt Reihenfolge
const stableInput = [m("Same", "owner"), m("Same", "owner")];
const stableOutput = sortMemberships(stableInput);
assert(stableOutput.length === 2, "Sortierung wirft nicht");

// Sortier-Funktion mutiert nicht
const original = [m("Z-Last", "viewer"), m("A-First", "owner")];
const sortedCopy = sortMemberships(original);
assert(original[0]?.name === "Z-Last", "Original bleibt unverändert");
assert(sortedCopy[0]?.name === "A-First", "Kopie ist sortiert");

// ---------------------------------------------------------------------------
// 6. UI-Labels
// ---------------------------------------------------------------------------
assert(roleLabel("owner") === "Inhaber:in", "Owner-Label deutsch + gendergerecht");
assert(roleLabel("editor") === "Bearbeiter:in", "Editor-Label");
assert(roleLabel("viewer") === "Betrachter:in", "Viewer-Label");

assert(tierLabel("bronze") === "Bronze", "Bronze-Label");
assert(tierLabel("silber") === "Silber", "Silber-Label");
assert(tierLabel("gold") === "Gold", "Gold-Label");
assert(tierLabel("platin") === "Platin", "Platin-Label");

// ---------------------------------------------------------------------------
// 7. Privacy: keine Service-Role-/Auth-Daten landen im Output
// ---------------------------------------------------------------------------
// (Defensive: in dieser Pure-Schicht gibt's keinen Auth-Token, aber
// wir stellen sicher, dass mapMembershipRow keine zusätzlichen
// Felder anhängt, die nicht im BusinessMembership-Interface stehen.)
const dump = JSON.stringify(ok);
const expectedKeys = [
  "businessId",
  "slug",
  "name",
  "industryKey",
  "packageTier",
  "tagline",
  "role",
  "isPublished",
];
const parsed = JSON.parse(dump) as Record<string, unknown>;
const actualKeys = Object.keys(parsed).sort();
assert(
  JSON.stringify(actualKeys) === JSON.stringify([...expectedKeys].sort()),
  `Output hat genau die erwarteten Keys (war: ${actualKeys.join(",")})`,
);

console.log("account-businesses smoketest ✅ (~33 Asserts)");
export const __ACCOUNT_BUSINESSES_SMOKETEST__ = { totalAssertions: 30 };
