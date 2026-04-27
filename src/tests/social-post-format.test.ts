/**
 * Smoketest für Social-Post-Format-Helper (Code-Session 54).
 *
 * Pure-Function-Test: Labels, Limits, Length-Assessment,
 * Final-Post-Komposition, Hashtag-Beratung.
 */

import {
  adviseHashtagCount,
  assessLength,
  composeFinalPost,
  goalLabel,
  lengthLabel,
  platformLabel,
  platformLimits,
} from "@/lib/social-post-format";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`social-post-format assertion failed: ${message}`);
}

// ---------------------------------------------------------------------------
// 1. Labels
// ---------------------------------------------------------------------------
assert(platformLabel("instagram") === "Instagram", "Instagram-Label");
assert(platformLabel("facebook") === "Facebook", "Facebook-Label");
assert(platformLabel("google_business") === "Google Business", "GBP-Label");
assert(platformLabel("linkedin") === "LinkedIn", "LinkedIn-Label");
assert(platformLabel("whatsapp_status") === "WhatsApp-Status", "WA-Status-Label");

assert(goalLabel("more_appointments") === "Mehr Termine", "more_appointments");
assert(goalLabel("promote_offer") === "Angebot bewerben", "promote_offer");
assert(goalLabel("collect_review") === "Bewertung sammeln", "collect_review");
assert(goalLabel("team_intro") === "Team vorstellen", "team_intro");

assert(lengthLabel("short") === "Kurz", "short → Kurz");
assert(lengthLabel("medium") === "Mittel", "medium → Mittel");
assert(lengthLabel("long") === "Lang", "long → Lang");

// ---------------------------------------------------------------------------
// 2. platformLimits
// ---------------------------------------------------------------------------
const ig = platformLimits("instagram");
assert(ig.hardChar === 2200, "IG Hard-Limit 2200");
assert(ig.truncationChar === 125, "IG Truncation 125");
assert(ig.recommendedHashtags.low === 3 && ig.recommendedHashtags.high === 5, "IG Tags 3–5");

const fb = platformLimits("facebook");
assert(fb.truncationChar === 480, "FB Truncation 480");
assert(fb.recommendedHashtags.high === 2, "FB Tags ≤2");

const gbp = platformLimits("google_business");
assert(gbp.recommendedHashtags.high === 0, "GBP Tags = 0");

const li = platformLimits("linkedin");
assert(li.truncationChar === 210, "LinkedIn Truncation 210");

const wa = platformLimits("whatsapp_status");
assert(wa.hardChar === 700, "WA-Status hardChar 700");
assert(wa.recommendedHashtags.high === 0, "WA-Status Tags = 0");

// ---------------------------------------------------------------------------
// 3. assessLength
// ---------------------------------------------------------------------------
const shortIg = assessLength("Hallo Welt", "instagram");
assert(shortIg.status === "ok", "10 Zeichen → ok");
assert(shortIg.chars === 10, "chars korrekt");
assert(shortIg.hint.includes("sichtbaren"), "Hint nennt 'sichtbaren'");

const mediumIg = assessLength("X".repeat(200), "instagram");
assert(mediumIg.status === "truncated", "200 Zeichen IG → truncated");
assert(
  mediumIg.hint.includes("Mehr lesen") || mediumIg.hint.includes(`Schnitt`),
  "Hint nennt Truncation",
);

const overIg = assessLength("X".repeat(2500), "instagram");
assert(overIg.status === "over", "2500 Zeichen IG → over");
assert(overIg.hint.includes("ablehnen"), "Hint sagt 'ablehnen'");

// FB Truncation ist bei 480
const mediumFb = assessLength("X".repeat(300), "facebook");
assert(mediumFb.status === "ok", "300 Zeichen FB → ok (unter 480)");

const truncFb = assessLength("X".repeat(600), "facebook");
assert(truncFb.status === "truncated", "600 Zeichen FB → truncated");

// LinkedIn Truncation bei 210
const truncLi = assessLength("X".repeat(220), "linkedin");
assert(truncLi.status === "truncated", "220 Zeichen LI → truncated");

// ---------------------------------------------------------------------------
// 4. composeFinalPost
// ---------------------------------------------------------------------------
const noTags = composeFinalPost({
  body: "Hallo Welt",
  hashtags: [],
  includeHashtags: true,
});
assert(noTags === "Hallo Welt", "leere Tags → nur Body");

const withTags = composeFinalPost({
  body: "Hallo Welt",
  hashtags: ["#friseur", "#musterstadt"],
  includeHashtags: true,
});
assert(
  withTags === "Hallo Welt\n\n#friseur #musterstadt",
  "Tags am Ende mit Doppel-Newline",
);

const includeOff = composeFinalPost({
  body: "Hallo",
  hashtags: ["#a", "#b"],
  includeHashtags: false,
});
assert(includeOff === "Hallo", "includeHashtags=false → nur Body");

// Defensive: Tags ohne #, mit Whitespace, Duplikate
const messy = composeFinalPost({
  body: "Test",
  hashtags: ["friseur", "  #musterstadt  ", "#FRISEUR", "", "  "],
  includeHashtags: true,
});
assert(
  messy === "Test\n\n#friseur #musterstadt",
  `Normalisierung: # ergänzt, Whitespace getrimmt, case-insensitive dedupe (war: ${messy})`,
);

// Body wird auch getrimmt
const trimmedBody = composeFinalPost({
  body: "  Hallo Welt  \n\n",
  hashtags: ["#x"],
  includeHashtags: true,
});
assert(trimmedBody === "Hallo Welt\n\n#x", "Body getrimmt");

// ---------------------------------------------------------------------------
// 5. adviseHashtagCount
// ---------------------------------------------------------------------------
const igOk = adviseHashtagCount(4, "instagram");
assert(igOk.status === "ok", "4 IG-Tags → ok");
assert(igOk.hint.includes("passend"), "Hint sagt 'passend'");

const igBelow = adviseHashtagCount(1, "instagram");
assert(igBelow.status === "below", "1 IG-Tag → below");

const igAbove = adviseHashtagCount(8, "instagram");
assert(igAbove.status === "above", "8 IG-Tags → above");

const fbOk = adviseHashtagCount(1, "facebook");
assert(fbOk.status === "ok", "1 FB-Tag → ok");

const fbAbove = adviseHashtagCount(5, "facebook");
assert(fbAbove.status === "above", "5 FB-Tags → above");

const gbpZero = adviseHashtagCount(0, "google_business");
assert(gbpZero.status === "discouraged", "GBP 0 Tags → discouraged (Empfehlung)");
assert(gbpZero.hint.includes("ohne Hashtags"), "Hint sagt 'ohne Hashtags'");

const gbpAny = adviseHashtagCount(3, "google_business");
assert(gbpAny.status === "discouraged", "GBP mit Tags → discouraged");

const waZero = adviseHashtagCount(0, "whatsapp_status");
assert(waZero.status === "discouraged", "WA-Status 0 → discouraged-Hinweis");

// ---------------------------------------------------------------------------
// 6. End-to-End
// ---------------------------------------------------------------------------
const composedForIg = composeFinalPost({
  body: "Heute frischer Schnitt — wer kommt vorbei?",
  hashtags: ["#friseur", "#musterstadt", "#balayage", "#newhair"],
  includeHashtags: true,
});
const igAssessment = assessLength(composedForIg, "instagram");
assert(igAssessment.status === "ok" || igAssessment.status === "truncated", "kombinierter Post bewertbar");
assert(igAssessment.chars === composedForIg.length, "chars = composedFinalPost-Länge");

console.log("social-post-format smoketest ✅ (~40 Asserts)");
export const __SOCIAL_POST_FORMAT_SMOKETEST__ = { totalAssertions: 40 };
