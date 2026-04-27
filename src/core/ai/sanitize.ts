/**
 * KI-Output-Sanitizer (Code-Session 31).
 *
 * **Threat-Model**:
 *   - Indirekte Prompt-Injection: ein Provider liefert (gewollt oder
 *     gehackt) einen Output mit eingebettetem `<script>`/Event-Handler.
 *   - Mitigation in React: `{text}`-Rendering escaped automatisch.
 *   - Reales Risiko: Auftraggeber kopiert den KI-Text in ein CMS, eine
 *     HTML-Mail oder einen `dangerouslySetInnerHTML`-Block (z. B. eine
 *     Markdown-Renderer-Komponente, die wir später hinzufügen).
 *   - Real-World-CVE: CVE-2026-25802 (LLM-Output → unsanitized
 *     `dangerouslySetInnerHTML` → Stored XSS). Siehe RESEARCH_INDEX.md
 *     Track B.
 *
 * **Designentscheidung — kein DOMPurify (yet)**:
 *   - DOMPurify und `isomorphic-dompurify` brauchen einen DOM
 *     (`jsdom` ~ 120 KB im Server-Bundle). Lohnt sich, sobald wir
 *     **HTML-Whitelist-Modus** brauchen (also einige Tags erlauben).
 *   - Solange wir KI-Output ausschließlich als Plain-Text rendern,
 *     reicht ein **konservativer Stripper**: alle HTML-Tags raus,
 *     HTML-Entities zuerst dekodieren (sonst umgehen `&lt;script&gt;`
 *     den Stripper), Control-Chars raus.
 *   - Folge-Item in `PROGRAM_PLAN.md` Track B: bei Markdown-Rendering
 *     auf `isomorphic-dompurify` mit Tag-Whitelist umstellen.
 *
 * **Was bleibt erhalten**:
 *   - `<` als Sonderzeichen im Fließtext („Aktion < 50 €") bleibt
 *     erhalten — wir strippen nur, wenn `<` von `[A-Za-z!/?]` gefolgt
 *     wird (also wirklich nach Tag aussieht).
 *   - Zeilenumbrüche, Tabs, Carriage-Returns.
 *   - Alle gewöhnlichen Zeichen, Umlaute, Emojis, Anführungszeichen.
 */

/**
 * Control-Char-Range, die wir entfernen: alles unter Space (0x20),
 * AUSSER Tab (0x09), LineFeed (0x0A) und CarriageReturn (0x0D).
 * Plus DEL (0x7F). Mit `String.fromCharCode` aufgebaut, damit der
 * Quelltext keine echten Control-Chars enthält.
 */
const CTRL_CHAR_PATTERN = (() => {
  const chars: string[] = [];
  for (let code = 0x00; code <= 0x1f; code++) {
    if (code === 0x09 || code === 0x0a || code === 0x0d) continue;
    chars.push(String.fromCharCode(code));
  }
  chars.push(String.fromCharCode(0x7f));
  // eslint-disable-next-line no-control-regex
  return new RegExp(`[${chars.join("")}]`, "g");
})();

/**
 * Strippt HTML-Tags und gefährliche Konstrukte aus einem freien Text.
 * Reine String-Ebene, kein DOM erforderlich.
 *
 * Iterativer Strip: nach dem Decoding können neue Tags sichtbar werden
 * (z. B. nested `&lt;&lt;script&gt;script&gt;`), wir loopen bis stabil.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";

  // 1. HTML-Entities dekodieren — sonst umgehen `&lt;script&gt;` den
  //    Stripper. Reihenfolge: erst Numerische, dann Named-Entities.
  let s = input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : "";
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : "";
    })
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#x27;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&"); // & zuletzt, sonst doppelt-decode

  // 2. Iterativ Tags strippen, weil das Strippen verschachtelte
  //    Konstrukte freilegen kann.
  let prev: string;
  let iterations = 0;
  do {
    prev = s;
    // HTML/MathML/SVG-Tag-Pattern: < gefolgt von optionaler `/`,
    // Buchstaben-Anfang (oder `!` für Doctype/Kommentar), bis `>`.
    s = s.replace(/<\/?[A-Za-z][^>]*>/g, "");
    s = s.replace(/<!--[\s\S]*?-->/g, "");
    s = s.replace(/<![\s\S]*?>/g, "");
    s = s.replace(/<\?[\s\S]*?\?>/g, ""); // Processing-Instructions
    iterations++;
  } while (s !== prev && iterations < 5);

  // 3. Control-Characters strippen, außer Tab/LF/CR.
  s = s.replace(CTRL_CHAR_PATTERN, "");

  return s;
}

/**
 * Sanitizer für komplette KI-Output-Strukturen (rekursiv).
 * - Strings → durch `sanitizeText` ersetzt.
 * - Arrays / Plain-Objects → rekursiv.
 * - Numbers / Booleans / null / undefined → unverändert.
 *
 * Generisch typisiert, damit der Aufrufer das Output-Schema behält.
 *
 * **Achtung**: Methodenausgaben sind plain-data (Output-Schemas via
 * Zod). Klassen-Instanzen würden hier zu Plain-Objects degradiert —
 * das ist beabsichtigt, kommt in unserem AI-Output aber nicht vor.
 */
export function sanitizeAIOutput<T>(output: T): T {
  if (output === null || output === undefined) return output;
  if (typeof output === "string") {
    return sanitizeText(output) as unknown as T;
  }
  if (typeof output === "number" || typeof output === "boolean") {
    return output;
  }
  if (Array.isArray(output)) {
    return output.map((item) => sanitizeAIOutput(item)) as unknown as T;
  }
  if (typeof output === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(output as object)) {
      result[key] = sanitizeAIOutput(value);
    }
    return result as unknown as T;
  }
  // Symbol / function / bigint → ignorieren (sollten in AI-Outputs nie auftauchen).
  return output;
}

/**
 * Stub für den HTML-Whitelist-Modus. **Aktuell nicht implementiert** —
 * wir rendern keine HTML-Outputs aus KI-Texten. Sobald sich das ändert
 * (Markdown-Renderer, Reicher Text in Bewertungen, etc.), kommt
 * `isomorphic-dompurify` als Dependency und diese Funktion wird scharf.
 *
 * Wirft bewusst, damit ein versehentlicher Aufruf nicht stillschweigend
 * unsicheres HTML durchlässt.
 */
export function sanitizeAIOutputAsHtml(input: string): string {
  // `input` wird absichtlich nicht ausgewertet — wir wollen nicht
  // suggerieren, der String wäre nach Aufruf irgendwie sicher.
  void input;
  throw new Error(
    "sanitizeAIOutputAsHtml ist noch nicht implementiert. Sobald wir KI-Output als HTML rendern, wechseln wir auf isomorphic-dompurify mit Tag-Whitelist (siehe PROGRAM_PLAN.md Track B).",
  );
}
