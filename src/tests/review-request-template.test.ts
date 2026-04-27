/**
 * Smoketest für Review-Request-Template-Helper (Code-Session 53).
 *
 * Pure-Function-Test: Substitution + Channel-URL-Bau.
 */

import {
  buildChannelSendUrl,
  channelLabel,
  cleanPhoneForChannel,
  substitutePlaceholders,
  toneLabel,
} from "@/lib/review-request-template";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`review-request-template assertion failed: ${message}`);
}

// ---------------------------------------------------------------------------
// 1. substitutePlaceholders: alle Platzhalter, mit + ohne Werte
// ---------------------------------------------------------------------------
const tmpl =
  "Hallo {{customerName}}, wir würden uns freuen, wenn Sie {{businessName}} unter {{reviewLink}} bewerten würden.";

const filled = substitutePlaceholders(tmpl, {
  customerName: "Anja",
  reviewLink: "https://g.page/x",
  businessName: "Studio Haarlinie",
});
assert(filled.includes("Anja"), "customerName eingesetzt");
assert(filled.includes("https://g.page/x"), "reviewLink eingesetzt");
assert(filled.includes("Studio Haarlinie"), "businessName eingesetzt");
assert(!filled.includes("{{"), "keine Platzhalter mehr im Output");

const empty = substitutePlaceholders(tmpl, {});
assert(
  empty.includes("Liebe:r Kund:in"),
  "fehlender Name → freundlicher Default",
);
assert(
  empty.includes("(Bewertungslink hier einfügen)"),
  "fehlender Link → klar erkennbarer Platzhalter",
);
assert(
  empty.includes("(Ihr Betrieb)"),
  "fehlender Business-Name → Platzhalter",
);
assert(!empty.includes("{{"), "auch ohne Werte: keine Doppel-Klammern mehr");

// Whitespace-only zählt als leer
const whitespaceVars = substitutePlaceholders(tmpl, {
  customerName: "   ",
  reviewLink: "  ",
  businessName: "   ",
});
assert(
  whitespaceVars.includes("Liebe:r Kund:in"),
  "whitespace-only customerName → Default",
);

// Mehrfach-Platzhalter (z. B. zweimal customerName) — alle ersetzt
const multi = substitutePlaceholders(
  "{{customerName}} und nochmal {{customerName}}",
  { customerName: "Bert" },
);
assert(multi === "Bert und nochmal Bert", "Globaler Replace");

// Tolerante Whitespace-Erkennung in Platzhaltern
const tolerant = substitutePlaceholders("{{ customerName }}", {
  customerName: "Carla",
});
assert(tolerant === "Carla", "Spaces im Platzhalter werden gelesen");

// ---------------------------------------------------------------------------
// 2. cleanPhoneForChannel
// ---------------------------------------------------------------------------
assert(
  cleanPhoneForChannel("+49 30 12345678") === "493012345678",
  "Plus + Spaces strippen",
);
assert(
  cleanPhoneForChannel("0049-30-12345678") === "493012345678",
  "00 + Bindestriche strippen",
);
assert(
  cleanPhoneForChannel("(030) 12345678") === "03012345678",
  "Klammern strippen (lokale 0 bleibt — kein 00-Prefix)",
);
assert(
  cleanPhoneForChannel("030/123 456 78") === "03012345678",
  "Slash + Spaces strippen (lokale 0 bleibt)",
);
assert(cleanPhoneForChannel("12345678") === "12345678", "reine Zahlen ok");
assert(
  cleanPhoneForChannel("abc") === null,
  "nur Buchstaben → null",
);
assert(cleanPhoneForChannel("") === null, "leer → null");
assert(cleanPhoneForChannel("123") === null, "zu kurz (<4) → null");
assert(cleanPhoneForChannel("+++") === null, "nur Strip-Zeichen → null");

// ---------------------------------------------------------------------------
// 3. buildChannelSendUrl: in_person → null + Hinweis
// ---------------------------------------------------------------------------
const inPerson = buildChannelSendUrl({
  channel: "in_person",
  body: "Hallo!",
});
assert(inPerson.url === null, "in_person hat keine URL");
assert(
  typeof inPerson.hint === "string" && inPerson.hint.includes("Persönlich"),
  "Hinweis erklärt persönlichen Kanal",
);

// ---------------------------------------------------------------------------
// 4. email
// ---------------------------------------------------------------------------
const emailWithRecipient = buildChannelSendUrl({
  channel: "email",
  body: "Bitte bewerten",
  recipient: "kunde@example.com",
});
assert(
  emailWithRecipient.url?.startsWith("mailto:") === true,
  "mailto-URL",
);
assert(
  emailWithRecipient.url?.includes("kunde%40example.com") === true ||
    emailWithRecipient.url?.includes("kunde@example.com") === true,
  "Empfänger im Pfad",
);
assert(
  emailWithRecipient.url?.includes("body=") === true,
  "body-Parameter",
);
assert(
  emailWithRecipient.url?.includes("subject=") === true,
  "subject-Parameter",
);
assert(emailWithRecipient.hint == null, "kein Hinweis bei vollständigem Input");

const emailNoRecipient = buildChannelSendUrl({
  channel: "email",
  body: "Bitte bewerten",
});
assert(
  emailNoRecipient.url?.startsWith("mailto:?") === true,
  "mailto: ohne Empfänger ist ok",
);
assert(
  typeof emailNoRecipient.hint === "string" &&
    emailNoRecipient.hint.toLowerCase().includes("e-mail"),
  "Hinweis sagt 'Empfänger einsetzen'",
);

const emailCustomSubject = buildChannelSendUrl({
  channel: "email",
  body: "x",
  recipient: "x@y.de",
  subject: "Mein Subject",
});
// URLSearchParams encoded Spaces als '+'; entweder Form ist ok.
assert(
  emailCustomSubject.url?.includes("subject=Mein+Subject") === true ||
    emailCustomSubject.url?.includes("subject=Mein%20Subject") === true,
  "Custom Subject im URL (URLSearchParams oder encodeURIComponent)",
);

// ---------------------------------------------------------------------------
// 5. sms
// ---------------------------------------------------------------------------
const smsOk = buildChannelSendUrl({
  channel: "sms",
  body: "Hallo Anja, würden Sie uns bewerten?",
  recipient: "+49 30 12345678",
});
assert(smsOk.url?.startsWith("sms:493012345678") === true, "sms-URL korrekt");
assert(smsOk.url?.includes("body=") === true, "sms hat body");

const smsBadPhone = buildChannelSendUrl({
  channel: "sms",
  body: "x",
  recipient: "abc",
});
assert(smsBadPhone.url === null, "sms ohne valide Nummer → null");
assert(
  typeof smsBadPhone.hint === "string" &&
    smsBadPhone.hint.toLowerCase().includes("telefonnummer"),
  "Hinweis nennt Telefonnummer",
);

// ---------------------------------------------------------------------------
// 6. whatsapp
// ---------------------------------------------------------------------------
// Internationale Nummer mit + → führende 0/+ wird gestrippt.
const whats = buildChannelSendUrl({
  channel: "whatsapp",
  body: "Hi! Bitte 5 Sterne :)",
  recipient: "+49 176 81462526",
});
assert(
  whats.url?.startsWith("https://wa.me/4917681462526") === true,
  `wa.me-URL korrekt mit gestrippter +49-Nummer (war: ${whats.url})`,
);
assert(
  whats.url?.includes("?text=") === true,
  "wa.me hat text-Parameter",
);
assert(
  whats.url?.includes(encodeURIComponent("5 Sterne")) === true,
  "Body URL-encoded",
);

const whatsNoNumber = buildChannelSendUrl({
  channel: "whatsapp",
  body: "x",
});
assert(whatsNoNumber.url === null, "wa.me ohne Nummer → null");
assert(
  typeof whatsNoNumber.hint === "string" &&
    whatsNoNumber.hint.toLowerCase().includes("whatsapp"),
  "Hinweis nennt WhatsApp",
);

// ---------------------------------------------------------------------------
// 7. UI-Labels
// ---------------------------------------------------------------------------
assert(channelLabel("whatsapp") === "WhatsApp", "WhatsApp-Label");
assert(channelLabel("sms") === "SMS", "SMS-Label");
assert(channelLabel("email") === "E-Mail", "Email-Label");
assert(channelLabel("in_person") === "Persönlich", "in_person-Label");

assert(toneLabel("short") === "Kurz", "Kurz-Label");
assert(toneLabel("friendly") === "Freundlich", "Freundlich-Label");
assert(toneLabel("follow_up") === "Follow-Up", "Follow-Up-Label");

// ---------------------------------------------------------------------------
// 8. End-to-End: substitute → buildChannelSendUrl
// ---------------------------------------------------------------------------
const finalBody = substitutePlaceholders(
  "Hallo {{customerName}}, vielen Dank für Ihren Besuch bei {{businessName}}. Eine kurze Bewertung würde uns sehr helfen: {{reviewLink}}",
  {
    customerName: "Belkis",
    businessName: "AutoService Müller",
    reviewLink: "https://g.page/r/abc123",
  },
);
const e2e = buildChannelSendUrl({
  channel: "whatsapp",
  body: finalBody,
  recipient: "+49 176 81462526",
});
assert(e2e.url !== null, "E2E-URL gebaut");
assert(
  e2e.url?.includes("/4917681462526") === true,
  "E2E: WhatsApp-Nummer im Pfad gestrippt",
);
assert(
  e2e.url?.includes(encodeURIComponent("Belkis")) === true,
  "Name im URL",
);
assert(
  e2e.url?.includes(encodeURIComponent("g.page")) === true,
  "Link im URL",
);

console.log("review-request-template smoketest ✅ (~46 Asserts)");
export const __REVIEW_REQUEST_TEMPLATE_SMOKETEST__ = { totalAssertions: 45 };
