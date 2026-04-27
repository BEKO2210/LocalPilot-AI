/**
 * Mock-Implementierung für `generateFaqs` (Code-Session 16).
 *
 * Deterministisch, branchenneutral, ohne externen API-Call. Liefert
 * eine deduplizierte Liste von Frage/Antwort-Paaren bis maximal `count`.
 *
 * Quellen-Strategie (in dieser Reihenfolge):
 *   1. `preset.defaultFaqs` – branchen-typische Standardfragen.
 *   2. Aus `topics` abgeleitete Q/A-Paare. Bekannte Stichworte
 *      (Preis, Termin, Öffnungszeiten, Stornierung, Zahlung,
 *      Parken/Anfahrt) bekommen eine zugeschnittene Antwort,
 *      alles andere fällt auf einen generischen Topic-Satz zurück.
 *   3. Falls `city` gesetzt ist und noch Platz übrig: eine lokale
 *      Frage „Sind Sie auch in {{city}} und Umgebung aktiv?"
 *
 * Deduplizierung: Fragen werden nach Normalform verglichen
 * (lowercase, ohne Diakritika und ohne Satzzeichen). Doppelte
 * Einträge werden verworfen.
 *
 * Antwort-Längen orientieren sich an aktuellen AEO-/AI-Search-
 * Empfehlungen (~30–60 Wörter), bleiben aber unter dem
 * Schema-Limit (≤ 2000 Zeichen).
 *
 * Output wird defensiv durch `FaqGenerationOutputSchema` validiert.
 */

import {
  FaqGenerationInputSchema,
  FaqGenerationOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type { FaqGenerationInput, FaqGenerationOutput } from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";

/**
 * Normalisiert eine Frage für die Deduplizierung: lowercase,
 * Diakritika entfernt, Whitespace und Satzzeichen entfernt.
 */
function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "");
}

function clamp(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

interface QA {
  readonly question: string;
  readonly answer: string;
}

/**
 * Liefert ein Q/A-Paar für ein Stichwort. Erkennt Wortstämme im
 * Topic-String (lowercased) und wählt die passendste Vorlage.
 * Branchen-Label und Betriebsname werden eingewoben, damit die
 * Antwort konkret bleibt.
 */
function topicToQA(
  topic: string,
  businessName: string,
  industryLabel: string,
): QA {
  const t = topic.trim().toLowerCase();
  const isPrice = /(preis|kost|tarif|honorar)/.test(t);
  const isAppointment = /(termin|buch|reserv)/.test(t);
  const isHours = /(\bzeit|öffnung|geoffnet|sprechzeit)/.test(t);
  const isCancel = /(stornier|absag|verschieb)/.test(t);
  const isPayment = /(zahl|bezahl|rechnung|kasse)/.test(t);
  const isAccess = /(park|anfahrt|adresse|barriere)/.test(t);
  const isWarranty = /(garantie|gewähr|gewahr)/.test(t);

  if (isPrice) {
    return {
      question: `Was kostet ${topic} bei Ihnen?`,
      answer: `Die meisten Preise stehen direkt bei den Leistungen. Bei individuellen Wünschen oder zusätzlichem Aufwand besprechen wir den Endpreis vorher transparent – Sie zahlen nichts, was nicht vorab geklärt ist.`,
    };
  }
  if (isAppointment) {
    return {
      question: `Wie kann ich einen Termin für ${topic} vereinbaren?`,
      answer: `Termine können Sie über das Kontaktformular, telefonisch oder per WhatsApp anfragen. Wir bestätigen Wunschtermine in der Regel am gleichen oder nächsten Werktag.`,
    };
  }
  if (isHours) {
    return {
      question: `Wann haben Sie geöffnet?`,
      answer: `Die aktuellen Öffnungszeiten finden Sie unten auf der Startseite. Außerhalb der Zeiten erreichen Sie uns per WhatsApp oder E-Mail – wir antworten am nächsten Werktag.`,
    };
  }
  if (isCancel) {
    return {
      question: `Was passiert, wenn ich einen Termin absagen muss?`,
      answer: `Eine kurze Nachricht spätestens 24 Stunden vorher reicht uns – per Telefon, WhatsApp oder E-Mail. So können wir den Slot für andere Anfragen freigeben.`,
    };
  }
  if (isPayment) {
    return {
      question: `Welche Zahlungsmöglichkeiten bieten Sie an?`,
      answer: `Sie können bar oder per EC-Karte bezahlen. Auf Wunsch stellen wir auch eine Rechnung mit Überweisungsdaten aus. Bei größeren Aufträgen sprechen wir die Modalitäten vorab ab.`,
    };
  }
  if (isAccess) {
    return {
      question: `Wie komme ich zu Ihnen und gibt es Parkplätze?`,
      answer: `Die Adresse mit Anfahrtsbeschreibung steht im Footer. Parkplätze sind in der näheren Umgebung in der Regel verfügbar. Bei Bedarf nennen wir Ihnen auf Anfrage die ruhigsten Zeiten für Anfahrt und Parken.`,
    };
  }
  if (isWarranty) {
    return {
      question: `Welche Garantie geben Sie auf Ihre Arbeit?`,
      answer: `Wir arbeiten nach den jeweiligen Branchenstandards und stehen für die ausgeführten Leistungen ein. Sollte etwas nicht passen, melden Sie sich direkt bei uns – wir finden eine faire Lösung.`,
    };
  }

  // Generischer Fallback – bleibt sachlich und konkret.
  return {
    question: `Wie handhaben Sie das Thema „${topic}" bei ${businessName}?`,
    answer: `${topic} regeln wir bei ${businessName} klar und nachvollziehbar. Wir besprechen die Details vor Auftragsbeginn – im Rahmen unserer ${industryLabel}-Praxis und an Ihren Wünschen orientiert.`,
  };
}

/** Lokale „Sind Sie auch in …?"-Frage, hilft für Local-AEO-Pickup. */
function localPresenceQA(city: string, businessName: string): QA {
  return {
    question: `Sind Sie auch in ${city} und Umgebung aktiv?`,
    answer: `Ja – ${businessName} ist in ${city} ansässig und übernimmt regelmäßig Aufträge aus dem näheren Umland. Bei Anfragen über die Stadtgrenze hinaus klären wir Anfahrt und Aufwand kurz vorab.`,
  };
}

export async function mockGenerateFaqs(
  input: FaqGenerationInput,
): Promise<FaqGenerationOutput> {
  const parsed = FaqGenerationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateFaqs: ${parsed.error.message}`,
    );
  }
  const { context, topics, count } = parsed.data;

  const preset = getPresetOrFallback(context.industryKey);
  const businessName = context.businessName;
  const industryLabel = preset.label;
  const city = context.city;

  // Deterministischer Build-Up: erst Preset, dann Topics, dann Local.
  const collected: QA[] = [];
  const seen = new Set<string>();

  function pushUnique(qa: QA): boolean {
    const key = normalizeQuestion(qa.question);
    if (key.length === 0 || seen.has(key)) return false;
    seen.add(key);
    collected.push({
      question: clamp(qa.question, 240),
      answer: clamp(qa.answer, 2000),
    });
    return true;
  }

  for (const f of preset.defaultFaqs) {
    pushUnique({ question: f.question, answer: f.answer });
    if (collected.length >= count) break;
  }

  if (collected.length < count) {
    for (const topic of topics) {
      pushUnique(topicToQA(topic, businessName, industryLabel));
      if (collected.length >= count) break;
    }
  }

  if (collected.length < count && city) {
    pushUnique(localPresenceQA(city, businessName));
  }

  // Falls (z. B. wegen Deduplizierung) noch immer zu wenig: einen
  // konservativen, branchen-allgemeinen Fallback nachschieben, damit
  // wir nie unter `min: 1` fallen. Das passiert in der Praxis nur,
  // wenn ein leeres `defaultFaqs`-Array auf ein leeres `topics`-Array
  // träfe, was kein bestehendes Preset tut.
  if (collected.length === 0) {
    pushUnique({
      question: `Wie nehme ich Kontakt zu ${businessName} auf?`,
      answer: `Am schnellsten über das Kontaktformular dieser Website. Telefon und WhatsApp finden Sie im Footer. Wir melden uns innerhalb eines Werktags zurück.`,
    });
  }

  const faqs = collected.slice(0, count);

  return FaqGenerationOutputSchema.parse({ faqs });
}
