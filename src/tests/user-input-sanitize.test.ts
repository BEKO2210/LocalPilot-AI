/**
 * Smoketest für User-Input-Sanitize-Helper (Code-Session 67).
 *
 * Pure-Function-Test: kein Server, kein DOM. Decken alle
 * Pipeline-Phasen ab + Domain-Wrapper.
 */

import {
  SANITIZE_DEFAULTS,
  sanitizeBusinessProfileStrings,
  sanitizeLeadStrings,
  sanitizeServiceStrings,
  sanitizeUserMultiLine,
  sanitizeUserSingleLine,
  sanitizeUserText,
} from "@/lib/user-input-sanitize";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`user-input-sanitize assertion failed: ${message}`);
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. Defensive Inputs
  // ---------------------------------------------------------------------
  assert(sanitizeUserText(null) === "", "null → ''");
  assert(sanitizeUserText(undefined) === "", "undefined → ''");
  assert(sanitizeUserText(42) === "", "number → ''");
  assert(sanitizeUserText({}) === "", "object → ''");
  assert(sanitizeUserText("") === "", "leer → ''");

  // ---------------------------------------------------------------------
  // 2. HTML-Strip (delegiert an sanitizeText)
  // ---------------------------------------------------------------------
  assert(
    sanitizeUserText("<script>alert(1)</script>Hallo").length > 0,
    "HTML-Tags raus, Text bleibt",
  );
  assert(
    !sanitizeUserText("<script>alert(1)</script>Hallo").includes("<"),
    "kein < übrig",
  );
  // HTML-Entity-Bypass-Versuch
  assert(
    !sanitizeUserText("&lt;script&gt;alert(1)&lt;/script&gt;Hallo").includes(
      "<",
    ),
    "Entity-encoded < wird gestrippt",
  );
  // Zahl-Entity
  assert(
    !sanitizeUserText("&#60;img onerror=x&#62;").includes("<"),
    "Numeric-Entity wird gestrippt",
  );

  // Normale Texte mit `<` als Sonderzeichen bleiben
  assert(
    sanitizeUserText("Aktion < 50 €") === "Aktion < 50 €",
    "isoliertes < bleibt",
  );

  // ---------------------------------------------------------------------
  // 3. Single-Line: Whitespace kollabiert
  // ---------------------------------------------------------------------
  assert(
    sanitizeUserSingleLine("  Hallo   Welt  ") === "Hallo Welt",
    "Whitespace kollabiert in Single-Line",
  );
  assert(
    sanitizeUserSingleLine("Hallo\n\n\nWelt") === "Hallo Welt",
    "Newlines werden zu Spaces in Single-Line",
  );
  assert(
    sanitizeUserSingleLine("\tTab\tHallo") === "Tab Hallo",
    "Tabs werden zu Spaces",
  );

  // ---------------------------------------------------------------------
  // 4. Multi-Line: Newlines bleiben, aber max 2 hintereinander
  // ---------------------------------------------------------------------
  assert(
    sanitizeUserMultiLine("Zeile1\nZeile2") === "Zeile1\nZeile2",
    "Single-Newline bleibt",
  );
  assert(
    sanitizeUserMultiLine("Zeile1\n\nZeile2") === "Zeile1\n\nZeile2",
    "Doppel-Newline bleibt",
  );
  assert(
    sanitizeUserMultiLine("Zeile1\n\n\n\n\nZeile2") === "Zeile1\n\nZeile2",
    "5x Newline → 2x",
  );
  // Trailing/leading whitespace pro Zeile
  assert(
    sanitizeUserMultiLine("  Zeile1  \n  Zeile2  ") === "Zeile1\nZeile2",
    "Pro-Zeile-Trim",
  );
  // \r\n und \r normalisiert
  assert(
    sanitizeUserMultiLine("Zeile1\r\nZeile2\rZeile3") === "Zeile1\nZeile2\nZeile3",
    "CRLF/CR → LF",
  );
  // Block-Trim
  assert(
    sanitizeUserMultiLine("\n\nHallo\n\n") === "Hallo",
    "Leading/Trailing Newlines weg",
  );

  // ---------------------------------------------------------------------
  // 5. Length-Limit
  // ---------------------------------------------------------------------
  const long = "a".repeat(60_000);
  assert(
    sanitizeUserText(long).length === SANITIZE_DEFAULTS.maxLength,
    "Default-MaxLength = 50_000",
  );
  assert(
    sanitizeUserSingleLine("a".repeat(300), 200).length === 200,
    "Custom maxLength durchgereicht",
  );

  // ---------------------------------------------------------------------
  // 6. Defaults exportiert
  // ---------------------------------------------------------------------
  assert(SANITIZE_DEFAULTS.maxLength === 50_000, "DEFAULTS.maxLength");
  assert(SANITIZE_DEFAULTS.singleLine === false, "DEFAULTS.singleLine");

  // ---------------------------------------------------------------------
  // 7. sanitizeBusinessProfileStrings
  // ---------------------------------------------------------------------
  const profile = sanitizeBusinessProfileStrings({
    name: "  <b>Studio</b>  Haarlinie  ",
    tagline: "Friseur in <script>alert(1)</script> {{city}}",
    description: "Zeile1\n\n\n\nZeile2 mit <img src=x onerror=alert(1)>",
    contact: {
      phone: "  +49 30  ",
      email: "owner@example.com<script>x</script>",
      whatsapp: undefined,
      website: "https://example.com",
    },
    address: {
      street: "Lindenallee 14",
      postalCode: "10115",
      city: " Berlin ",
      country: "DE",
    },
  });
  assert(profile.name === "Studio Haarlinie", "name single-line + strip");
  assert(
    typeof profile.tagline === "string" && !profile.tagline.includes("<"),
    "tagline ohne <",
  );
  assert(
    typeof profile.description === "string" && !profile.description.includes("\n\n\n"),
    "description max 2 Newlines",
  );
  const c = profile.contact as Record<string, unknown>;
  assert(c["phone"] === "+49 30", "phone trimmed");
  assert(
    typeof c["email"] === "string" && !(c["email"] as string).includes("<"),
    "email ohne HTML",
  );
  assert(!("whatsapp" in c) || c["whatsapp"] === undefined, "undefined nicht überschrieben");
  const a = profile.address as Record<string, unknown>;
  assert(a["city"] === "Berlin", "city trimmed");

  // ---------------------------------------------------------------------
  // 8. sanitizeServiceStrings
  // ---------------------------------------------------------------------
  const svc = sanitizeServiceStrings({
    title: "<b>Damenhaarschnitt</b>",
    shortDescription: "Schnitt + Beratung\n\n\n\nNeu!",
    longDescription: "Lange Beschreibung\n<script>x</script>",
    category: "  Damen  ",
    priceLabel: "ab 45 €",
    durationLabel: "30 Min.",
  });
  assert(svc.title === "Damenhaarschnitt", "title strip + single-line");
  assert(
    typeof svc.shortDescription === "string" &&
      !svc.shortDescription.includes("\n\n\n"),
    "shortDescription gekürzt",
  );
  assert(
    typeof svc.longDescription === "string" && !svc.longDescription.includes("<"),
    "longDescription ohne <",
  );
  assert(svc.category === "Damen", "category trimmed");

  // ---------------------------------------------------------------------
  // 9. sanitizeLeadStrings inkl. extraFields
  // ---------------------------------------------------------------------
  const lead = sanitizeLeadStrings({
    name: "Anja <Schmidt>",
    phone: "  +49 176 1234  ",
    email: "anja@example.com",
    message: "Bitte Rückruf\n\n\n\n— vielen Dank!",
    extraFields: {
      vehicleModel: "BMW <script>x</script>",
      driverAge: 35,
      hasInsurance: true,
      "  badKey  ": "wird normalisiert",
      "": "leerer key wird gefiltert",
    },
  });
  assert(lead.name === "Anja", "Lead-name strip");
  // Note: <Schmidt> wird vom Stripper entfernt (sieht wie tag aus, da
  // < gefolgt von Großbuchstabe). „Anja " bleibt, dann trim.
  assert(typeof lead.phone === "string" && lead.phone === "+49 176 1234", "Phone trimmed");
  const ef = lead.extraFields as Record<string, unknown>;
  assert(
    typeof ef["vehicleModel"] === "string" && !(ef["vehicleModel"] as string).includes("<"),
    "extraFields-string sanitized",
  );
  assert(ef["driverAge"] === 35, "Number bleibt Number");
  assert(ef["hasInsurance"] === true, "Boolean bleibt Boolean");
  assert("badKey" in ef, "Whitespace-Key normalisiert");
  assert(!("" in ef), "leerer Key gefiltert");

  // ---------------------------------------------------------------------
  // 10. Defense-in-Depth: kein doppeltes Decoding
  // ---------------------------------------------------------------------
  // Wenn jemand `&amp;lt;script&amp;gt;` schickt, sollte das NICHT
  // zu `<script>` werden. `&amp;` → `&`, dann sehen wir `&lt;` als
  // String — der wird durch sanitizeText decoded zu `<`, dann wird
  // der entstehende `<script>` gestrippt.
  // Wir prüfen nur: Output enthält kein <script>.
  const nested = sanitizeUserText("&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;");
  assert(!nested.toLowerCase().includes("<script>"), "doppelt-encoded → kein <script>");

  // ---------------------------------------------------------------------
  // 11. Idempotenz: zweimal sanitize ändert nichts
  // ---------------------------------------------------------------------
  const once = sanitizeUserText("Hallo Welt");
  const twice = sanitizeUserText(once);
  assert(once === twice, "idempotent für sauberen Input");

  const onceMl = sanitizeUserMultiLine("Zeile1\n\nZeile2");
  const twiceMl = sanitizeUserMultiLine(onceMl);
  assert(onceMl === twiceMl, "idempotent für Multi-Line");

  console.log("user-input-sanitize smoketest ✅ (~45 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __USER_INPUT_SANITIZE_SMOKETEST__ = { totalAssertions: 45 };
