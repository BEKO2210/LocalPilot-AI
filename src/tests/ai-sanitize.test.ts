/**
 * Smoketest für den KI-Output-Sanitizer (Code-Session 31).
 *
 * Pure-Logic-Test: kein DOM, kein Netzwerk. Deckt typische
 * Prompt-Injection-Vektoren ab + sicheren Erhalt von harmlosem
 * Plain-Text mit Sonderzeichen.
 */

import {
  sanitizeAIOutput,
  sanitizeAIOutputAsHtml,
  sanitizeText,
} from "@/core/ai/sanitize";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`ai-sanitize assertion failed: ${message}`);
}

// -----------------------------------------------------------------------
// 1. sanitizeText — typische Injection-Vektoren
// -----------------------------------------------------------------------

assert(sanitizeText("Hello World") === "Hello World", "Plain bleibt unberührt");

assert(
  sanitizeText("<script>alert(1)</script>") === "alert(1)",
  "Script-Tag entfernt (Inhalt bleibt — wird trotzdem als Text harmlos)",
);

assert(
  sanitizeText("Hello <b>World</b>") === "Hello World",
  "Inline-Tags entfernt, Text bleibt",
);

assert(
  sanitizeText('<img src="x" onerror="alert(1)">') === "",
  "Self-closing Tag mit Event-Handler komplett raus",
);

assert(
  sanitizeText('<a href="javascript:alert(1)">Klick</a>') === "Klick",
  "javascript:-Link auf Text reduziert",
);

assert(
  sanitizeText("<!--[if IE]><script>alert(1)</script><![endif]-->") === "",
  "Conditional-Comments + Inhalt komplett raus",
);

// -----------------------------------------------------------------------
// 2. HTML-Entity-Bypass (klassischer Filter-Umgehungs-Versuch)
// -----------------------------------------------------------------------

assert(
  sanitizeText("&lt;script&gt;alert(1)&lt;/script&gt;") === "alert(1)",
  "Entity-encoded Script wird dekodiert, dann gestrippt",
);

assert(
  sanitizeText("&#60;script&#62;alert(1)&#60;/script&#62;") === "alert(1)",
  "Numerische Entities (dezimal) → dekodiert + gestrippt",
);

assert(
  sanitizeText("&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;") === "alert(1)",
  "Numerische Entities (hex) → dekodiert + gestrippt",
);

// -----------------------------------------------------------------------
// 3. Iterativer Strip — verschachtelte Bypasses
// -----------------------------------------------------------------------

assert(
  sanitizeText("<<script>script>alert(1)<</script>/script>") === "alert(1)",
  "Nested-Tag-Bypass: zweiter Pass erwischt freigelegte Tags",
);

// -----------------------------------------------------------------------
// 4. Was BLEIBEN MUSS (legitimer Plain-Text mit Sonderzeichen)
// -----------------------------------------------------------------------

assert(
  sanitizeText("Aktion < 50 €") === "Aktion < 50 €",
  "< gefolgt von Space bleibt erhalten (kein Tag)",
);

assert(
  sanitizeText("3 > 2 ist wahr") === "3 > 2 ist wahr",
  "> als Zeichen bleibt erhalten",
);

assert(
  sanitizeText("Salon Sophia GmbH & Co. KG") === "Salon Sophia GmbH & Co. KG",
  "& als Zeichen bleibt erhalten",
);

assert(
  sanitizeText("\"Top!\" sagte sie.") === '"Top!" sagte sie.',
  "Anführungszeichen bleiben",
);

assert(
  sanitizeText("Zeile 1\nZeile 2\nZeile 3") === "Zeile 1\nZeile 2\nZeile 3",
  "Zeilenumbrüche bleiben",
);

assert(
  sanitizeText("Tab\there") === "Tab\there",
  "Tabs bleiben",
);

assert(
  sanitizeText("Café 🎉 résumé") === "Café 🎉 résumé",
  "Umlaute, Emojis und Akzente bleiben",
);

// -----------------------------------------------------------------------
// 5. Control-Chars werden gestrippt (außer \t\n\r)
// -----------------------------------------------------------------------

const withCtrl = "Hello" + String.fromCharCode(0x00) + "World" + String.fromCharCode(0x07);
assert(
  sanitizeText(withCtrl) === "HelloWorld",
  "NUL und BEL gestrippt",
);

const withDel = "X" + String.fromCharCode(0x7f) + "Y";
assert(sanitizeText(withDel) === "XY", "DEL (0x7F) gestrippt");

// -----------------------------------------------------------------------
// 6. Edge-Cases
// -----------------------------------------------------------------------

assert(sanitizeText("") === "", "leerer String → leerer String");
assert(sanitizeText(null as unknown as string) === "", "null → leerer String");
assert(
  sanitizeText(undefined as unknown as string) === "",
  "undefined → leerer String",
);
assert(sanitizeText(42 as unknown as string) === "", "Zahl → leerer String");

// -----------------------------------------------------------------------
// 7. sanitizeAIOutput — rekursiv über Strukturen
// -----------------------------------------------------------------------

const out = sanitizeAIOutput({
  heroTitle: "<script>alert(1)</script>",
  heroSubtitle: "Sicher",
  count: 42,
  active: true,
  nullField: null,
  faqs: [
    { question: "<b>Wie?</b>", answer: "So." },
    { question: "Warum?", answer: '<img src="x" onerror="bad()">' },
  ],
});
assert(out.heroTitle === "alert(1)", "rekursiv: heroTitle gesäubert");
assert(out.heroSubtitle === "Sicher", "rekursiv: harmloser Text bleibt");
assert(out.count === 42, "rekursiv: Number bleibt unverändert");
assert(out.active === true, "rekursiv: Boolean bleibt unverändert");
assert(out.nullField === null, "rekursiv: null bleibt null");
assert(
  Array.isArray(out.faqs) && out.faqs.length === 2,
  "rekursiv: Array-Struktur bleibt",
);
assert(out.faqs[0]?.question === "Wie?", "rekursiv: Array-Item-String gesäubert");
assert(out.faqs[1]?.answer === "", "rekursiv: img mit onerror komplett raus");

// -----------------------------------------------------------------------
// 8. sanitizeAIOutputAsHtml — Stub wirft (Schutz vor Versehen)
// -----------------------------------------------------------------------

let threw = false;
try {
  sanitizeAIOutputAsHtml("<b>safe</b>");
} catch {
  threw = true;
}
assert(
  threw,
  "sanitizeAIOutputAsHtml wirft, weil noch nicht implementiert",
);

console.log("ai-sanitize smoketest ✅ (29 Asserts)");
export const __AI_SANITIZE_SMOKETEST__ = { totalAssertions: 29 };
