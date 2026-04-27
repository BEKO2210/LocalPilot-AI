import { LeadSchema } from "@/core/validation/lead.schema";
import type { Lead } from "@/types/lead";
import { daysAgo, makeBusinessId, makeLeadId, MOCK_NOW } from "./mock-helpers";

/**
 * Realistische Beispiel-Leads pro Demo-Betrieb.
 * Mix aus Status (`new`, `contacted`, `qualified`, `won`, `lost`, `archived`),
 * mit branchenspezifischen Zusatzfeldern (`extraFields`).
 *
 * Alle Datensätze werden über `LeadSchema.parse(...)` validiert.
 */

function lead(input: Omit<Lead, never>): Lead {
  return LeadSchema.parse(input);
}

// ---------------------------------------------------------------------------
// Studio Haarlinie (Friseur, Silber)
// ---------------------------------------------------------------------------

const STUDIO = "studio-haarlinie";

const studioLeads: readonly Lead[] = [
  lead({
    id: makeLeadId(STUDIO, 1),
    businessId: makeBusinessId(STUDIO),
    source: "website_form",
    name: "Marie Becker",
    phone: "+49 30 9000 5511",
    email: "marie.becker@example.org",
    message: "Hallo, ich hätte gerne einen Damenhaarschnitt + Pflege.",
    requestedServiceId: undefined,
    preferredDate: "2026-04-30",
    preferredTime: "10:00",
    extraFields: { requestedService: "ladies_cut" },
    status: "new",
    notes: "",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  }),
  lead({
    id: makeLeadId(STUDIO, 2),
    businessId: makeBusinessId(STUDIO),
    source: "whatsapp",
    name: "Tobias R.",
    phone: "+49 30 9000 5512",
    email: undefined,
    message: "Schnitt + Bart? Hat das jemand bei euch frei diese Woche?",
    extraFields: { requestedService: "gents_cut" },
    status: "contacted",
    notes: "Donnerstag 17:30 vorgeschlagen.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  }),
  lead({
    id: makeLeadId(STUDIO, 3),
    businessId: makeBusinessId(STUDIO),
    source: "website_form",
    name: "Familie Köhler",
    phone: "+49 30 9000 5513",
    email: "koehler@example.org",
    message: "Vater + zwei Kinder (5 und 8). Wann passt das?",
    extraFields: { requestedService: "kids_cut" },
    status: "qualified",
    notes: "Termin Sa 10:00 bestätigt.",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  }),
  lead({
    id: makeLeadId(STUDIO, 4),
    businessId: makeBusinessId(STUDIO),
    source: "website_form",
    name: "Saskia P.",
    phone: "+49 30 9000 5514",
    email: undefined,
    message: "Balayage – Beratung möglich?",
    extraFields: { requestedService: "balayage" },
    status: "won",
    notes: "Termin durchgeführt am 2026-04-19.",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(8),
  }),
];

// ---------------------------------------------------------------------------
// AutoService Müller (Werkstatt, Gold)
// ---------------------------------------------------------------------------

const AUTO = "autoservice-mueller";

const autoLeads: readonly Lead[] = [
  lead({
    id: makeLeadId(AUTO, 1),
    businessId: makeBusinessId(AUTO),
    source: "phone",
    name: "Christian L.",
    phone: "+49 211 9000 1701",
    email: undefined,
    message: "Klimaservice vor Sommer – am liebsten morgens.",
    extraFields: {
      vehicleModel: "Skoda Octavia, Bj. 2019",
      concern: "Klimaservice",
    },
    status: "qualified",
    notes: "Termin Di 8:00.",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  }),
  lead({
    id: makeLeadId(AUTO, 2),
    businessId: makeBusinessId(AUTO),
    source: "website_form",
    name: "Marina K.",
    phone: "+49 211 9000 1702",
    email: "marina.k@example.org",
    message: "Bremsen quietschen seit 2 Tagen – kann ich vorbeikommen?",
    extraFields: {
      vehicleModel: "VW Golf VII",
      licensePlate: "MB-XX 123",
      concern: "Bremsen quietschen",
    },
    status: "won",
    notes: "Bremsbeläge erneuert, Rechnung 248 €.",
    createdAt: daysAgo(11),
    updatedAt: daysAgo(8),
  }),
  lead({
    id: makeLeadId(AUTO, 3),
    businessId: makeBusinessId(AUTO),
    source: "website_form",
    name: "Ralf B.",
    phone: "+49 211 9000 1703",
    email: undefined,
    message: "TÜV läuft Ende Mai aus.",
    extraFields: {
      vehicleModel: "BMW 1er, Bj. 2017",
      concern: "TÜV-Vorbereitung + HU",
    },
    status: "contacted",
    notes: "Termin 12.05. vorgeschlagen.",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  }),
  lead({
    id: makeLeadId(AUTO, 4),
    businessId: makeBusinessId(AUTO),
    source: "phone",
    name: "Anna F.",
    phone: "+49 211 9000 1704",
    email: undefined,
    message: "Ölwechsel + Inspektion.",
    extraFields: {
      vehicleModel: "Hyundai i30",
      concern: "Wartung",
    },
    status: "new",
    notes: "",
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  }),
  lead({
    id: makeLeadId(AUTO, 5),
    businessId: makeBusinessId(AUTO),
    source: "website_form",
    name: "Mehmet Y.",
    phone: "+49 211 9000 1705",
    email: "mehmet.y@example.org",
    message: "Reifenwechsel + Einlagerung für 2 Sätze.",
    extraFields: {
      vehicleModel: "Audi A4 Avant",
      concern: "Reifenservice",
    },
    status: "won",
    notes: "Erledigt, Folge-Termin Oktober.",
    createdAt: daysAgo(28),
    updatedAt: daysAgo(20),
  }),
];

// ---------------------------------------------------------------------------
// Glanzwerk Reinigung (Reinigung, Silber)
// ---------------------------------------------------------------------------

const GLANZ = "glanzwerk-reinigung";

const glanzLeads: readonly Lead[] = [
  lead({
    id: makeLeadId(GLANZ, 1),
    businessId: makeBusinessId(GLANZ),
    source: "website_form",
    name: "Hausverwaltung Sommer",
    phone: "+49 69 9000 6611",
    email: "verwaltung@example.org",
    message: "3 Treppenhäuser, monatlich. Bitte um Angebot.",
    extraFields: { objectType: "stairwell", frequency: "monthly", areaSqm: 0 },
    status: "qualified",
    notes: "Besichtigung 30.04. um 9:00.",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(2),
  }),
  lead({
    id: makeLeadId(GLANZ, 2),
    businessId: makeBusinessId(GLANZ),
    source: "website_form",
    name: "Praxis Dr. Becker",
    phone: "+49 69 9000 6612",
    email: "kontakt@example.org",
    message: "Praxisreinigung 4 Räume, 2x pro Woche.",
    extraFields: { objectType: "practice", frequency: "weekly", areaSqm: 95 },
    status: "won",
    notes: "Vertrag 12 Monate ab 1.5.",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(15),
  }),
  lead({
    id: makeLeadId(GLANZ, 3),
    businessId: makeBusinessId(GLANZ),
    source: "phone",
    name: "Lukas H.",
    phone: "+49 69 9000 6613",
    email: undefined,
    message: "Fensterreinigung Wohnung 3-Zimmer.",
    extraFields: { objectType: "private", frequency: "once", areaSqm: 70 },
    status: "contacted",
    notes: "Angebot per WhatsApp gesendet.",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
  }),
  lead({
    id: makeLeadId(GLANZ, 4),
    businessId: makeBusinessId(GLANZ),
    source: "website_form",
    name: "Eva W.",
    phone: "+49 69 9000 6614",
    email: "eva.w@example.org",
    message: "Grundreinigung nach Renovierung.",
    extraFields: { objectType: "construction", frequency: "once" },
    status: "new",
    notes: "",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  }),
];

// ---------------------------------------------------------------------------
// Beauty Atelier (Kosmetik, Gold)
// ---------------------------------------------------------------------------

const BEAUTY = "beauty-atelier";

const beautyLeads: readonly Lead[] = [
  lead({
    id: makeLeadId(BEAUTY, 1),
    businessId: makeBusinessId(BEAUTY),
    source: "website_form",
    name: "Julia W.",
    phone: "+49 30 9000 7711",
    email: undefined,
    message: "Klassische Gesichtsbehandlung – am liebsten Donnerstagabend.",
    extraFields: { requestedService: "facial_basic" },
    preferredDate: "2026-05-02",
    status: "qualified",
    notes: "Termin Do 18:00 bestätigt.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  }),
  lead({
    id: makeLeadId(BEAUTY, 2),
    businessId: makeBusinessId(BEAUTY),
    source: "whatsapp",
    name: "Anett K.",
    phone: "+49 30 9000 7712",
    email: undefined,
    message: "Hochzeit am 25.05. – Make-up + Probe-Termin?",
    extraFields: { requestedService: "makeup", skinNotes: "trockene Haut" },
    status: "won",
    notes: "Probe + Termin gebucht.",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(7),
  }),
  lead({
    id: makeLeadId(BEAUTY, 3),
    businessId: makeBusinessId(BEAUTY),
    source: "website_form",
    name: "Carina M.",
    phone: "+49 30 9000 7713",
    email: "carina.m@example.org",
    message: "Wimpernverlängerung Naturlook.",
    extraFields: { requestedService: "lash_extensions" },
    status: "contacted",
    notes: "Termin Di 14:00 angeboten.",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  }),
  lead({
    id: makeLeadId(BEAUTY, 4),
    businessId: makeBusinessId(BEAUTY),
    source: "website_form",
    name: "Lara D.",
    phone: "+49 30 9000 7714",
    email: undefined,
    message: "Brauenform – nie gemacht, brauche Beratung.",
    extraFields: { requestedService: "brows" },
    status: "new",
    notes: "",
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  }),
];

// ---------------------------------------------------------------------------
// Meisterbau Schneider (Handwerker, Bronze)
// ---------------------------------------------------------------------------

const BAU = "meisterbau-schneider";

const bauLeads: readonly Lead[] = [
  lead({
    id: makeLeadId(BAU, 1),
    businessId: makeBusinessId(BAU),
    source: "website_form",
    name: "Andreas P.",
    phone: "+49 871 9000 9911",
    email: "andreas.p@example.org",
    message: "Bad neu fliesen, ca. 8 m². Bitte Angebot.",
    extraFields: { objectType: "house", concern: "Bad fliesen" },
    status: "won",
    notes: "Erledigt, Folgeauftrag möglich.",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(15),
  }),
  lead({
    id: makeLeadId(BAU, 2),
    businessId: makeBusinessId(BAU),
    source: "phone",
    name: "Birgit S.",
    phone: "+49 871 9000 9912",
    email: undefined,
    message: "Wohnzimmertür hängt – kann mal jemand vorbeikommen?",
    extraFields: { objectType: "apartment", concern: "Türen justieren" },
    status: "qualified",
    notes: "Mo Vormittag, 1 Stunde eingeplant.",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  }),
  lead({
    id: makeLeadId(BAU, 3),
    businessId: makeBusinessId(BAU),
    source: "website_form",
    name: "Markus T.",
    phone: "+49 871 9000 9913",
    email: "markus.t@example.org",
    message: "Trockenbau-Wand 3 m, Wohnung. Möglich?",
    extraFields: { objectType: "apartment", concern: "Trockenbau" },
    status: "contacted",
    notes: "Vor-Ort-Aufnahme angeboten.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  }),
  lead({
    id: makeLeadId(BAU, 4),
    businessId: makeBusinessId(BAU),
    source: "website_form",
    name: "Daniel K.",
    phone: "+49 871 9000 9914",
    email: undefined,
    message: "Kleinere Reparatur in der Mietwohnung.",
    extraFields: { objectType: "apartment", concern: "Reparatur" },
    status: "lost",
    notes: "Hat sich für anderen Anbieter entschieden – Termin zu spät.",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(28),
  }),
];

// ---------------------------------------------------------------------------
// Fahrschule Stadtmitte (Fahrschule, Silber)
// ---------------------------------------------------------------------------

const FAHR = "fahrschule-stadtmitte";

const fahrLeads: readonly Lead[] = [
  lead({
    id: makeLeadId(FAHR, 1),
    businessId: makeBusinessId(FAHR),
    source: "website_form",
    name: "Hannah V.",
    phone: "+49 69 9000 8811",
    email: "hannah.v@example.org",
    message: "Klasse B, möchte mit Theorie im nächsten Monat starten.",
    extraFields: { drivingClass: "B", preferredCourseStart: "next_month" },
    status: "won",
    notes: "Anmeldung erfolgt.",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(30),
  }),
  lead({
    id: makeLeadId(FAHR, 2),
    businessId: makeBusinessId(FAHR),
    source: "phone",
    name: "Niklas T.",
    phone: "+49 69 9000 8812",
    email: undefined,
    message: "Auffrischung nach 5 Jahren Pause.",
    extraFields: { drivingClass: "refresh", preferredCourseStart: "asap" },
    status: "won",
    notes: "5 Stunden gebucht.",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(20),
  }),
  lead({
    id: makeLeadId(FAHR, 3),
    businessId: makeBusinessId(FAHR),
    source: "website_form",
    name: "Fatma O.",
    phone: "+49 69 9000 8813",
    email: undefined,
    message: "B197 möglich? Ich habe Angst vor Schaltgetriebe.",
    extraFields: { drivingClass: "B197", preferredCourseStart: "next_month" },
    status: "qualified",
    notes: "Anmeldegespräch Do 17:00.",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(7),
  }),
  lead({
    id: makeLeadId(FAHR, 4),
    businessId: makeBusinessId(FAHR),
    source: "website_form",
    name: "Erkan G.",
    phone: "+49 69 9000 8814",
    email: undefined,
    message: "Klasse BE für Wohnwagen.",
    extraFields: { drivingClass: "BE", preferredCourseStart: "later" },
    status: "new",
    notes: "",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  }),
];

// ---------------------------------------------------------------------------
// Aggregat
// ---------------------------------------------------------------------------

export const mockLeads: readonly Lead[] = [
  ...studioLeads,
  ...autoLeads,
  ...glanzLeads,
  ...beautyLeads,
  ...bauLeads,
  ...fahrLeads,
];

// Statistik nur für Tests / Debug.
export const __MOCK_LEAD_COUNT__ = mockLeads.length;
export const __MOCK_NOW__ = MOCK_NOW;
