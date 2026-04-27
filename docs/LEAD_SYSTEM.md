# Lead-System – LocalPilot AI

Dreigeteiltes System: ein dynamisches Anfrageformular auf der **Public
Site**, ein **Dashboard** mit Filter, Suche, Detail-Pane und
Antwort-Vorlagen, und ein client-seitiger **Mock-Store**, der beide
Seiten verbindet, solange noch kein Backend (Supabase, Session 19)
angebunden ist.

## Live

- Public-Site-Formular: `/site/<slug>` → Sektion „Kontakt"
- Dashboard: `/dashboard/<slug>/leads`

Funktioniert auch auf GitHub Pages – der gesamte Datenfluss läuft
client-only (localStorage, kein Server).

## Architektur

```
src/lib/mock-store/leads-overrides.ts
  → Persistenz im Browser (versionierter Schlüssel
    `lp:leads-override:v1:<slug>`)
  → Public API:
      generateLeadId, appendLead, updateStoredLead,
      getStoredLeads, hasStoredLeads, clearStoredLeads,
      getEffectiveLeads, countByStatus

src/components/public-site/public-lead-form.tsx
  → "use client" Form, rendert Felder aus preset.leadFormFields,
    validiert per Zod (LeadSchema), persistiert via appendLead

src/components/dashboard/leads-view/
  leads-view.tsx        → Toolbar + Liste + Detail-Pane (Client-State)
  reply-templates.ts    → 3 branchen-neutrale Antwort-Vorlagen +
                           fillTemplate(body, { lead, businessName })
  index.ts

src/app/dashboard/[slug]/leads/page.tsx
  → Server-Page; Bronze (kein lead_management) bleibt ComingSoon,
    Silber/Gold rendern <LeadsView>
```

## Datenfluss

```
[Public Site /site/<slug>]
   ↓  PublicLeadForm.onSubmit
   ↓  validiert (LeadSchema)
   ↓  appendLead(slug, lead)
   ↓
localStorage:lp:leads-override:v1:<slug>
   ↓
[Dashboard /dashboard/<slug>/leads]
   ↓  Server liefert Demo-Mock-Leads aus leadsByBusiness
   ↓  Client mergt mit getEffectiveLeads(slug, fallback)
   ↓  Filter + Suche + Detail-Pane + Status-Wechsel + Notizen
```

Die Mock-Demo-Leads aus Session 6 bleiben sichtbar; lokal hinzugefügte
Anfragen erscheinen direkt darüber. Updates an Demo-Leads (Status,
Notizen) werden nur im Browser-State gehalten – `updateStoredLead`
schlägt für Demo-IDs fehl, der Detail-Pane behält den Wert dann nur
für die laufende Sitzung.

## Public-Site-Formular

`<PublicLeadForm>` (Client Component) ersetzt die Demo-Vorschau aus
Session 7:

- **Felder dynamisch aus `preset.leadFormFields`** (Friseur ↔ Werkstatt
  ↔ Reinigung ↔ Fahrschule etc.).
- **Manuelle Validierung**:
  - Pflichtfelder über `field.required`
  - E-Mail-Format und Telefon-Mindestlänge
  - Geschäftsregel „Telefon ODER E-Mail" über das passende Feld
- **Submit**: konstruiert ein `Lead`-Objekt, parst es noch einmal mit
  `LeadSchema.safeParse` und schreibt es per `appendLead` in den
  Browser-Storage.
- **Erfolgs-Zustand**: ersetzt das Formular durch eine Bestätigung mit
  „Weitere Anfrage senden"-Button.
- **Fehler-Zustand**: Inline-Fehler unter den Feldern; Fallback-Hinweis,
  wenn die Persistenz scheitert (z. B. inkognito/disabled storage).

Standard-Felder werden aufs Lead-Modell gemappt (`name`, `phone`,
`email`, `message`, `preferredDate`, `preferredTime`,
`requestedService`); alle weiteren Keys aus dem Preset (z. B.
`vehicleModel`, `objectType`, `drivingClass`) landen in `extraFields`.

## Dashboard-View

`<LeadsView>` (Client Component) zeigt:

### Toolbar

- **Status-Filter** (Alle / Neu / Kontaktiert / Qualifiziert /
  Gewonnen / Verloren / Archiviert) mit Live-Counter pro Status.
- **Volltext-Suche** über Name, Telefon, E-Mail, Nachricht.
- **„Lokale Anfragen leeren"**, falls etwas im Browser persistiert ist –
  Demo-Leads bleiben erhalten.

### Liste

- Pro Lead: Name, Status-Badge, Snippet der Nachricht, Quelle, Datum.
- Klick öffnet die Detailansicht in der Sidebar (Desktop) bzw. unter
  der Liste (Mobile).

### Detail-Pane

- **Direktkontakt**: `tel:`, `wa.me`, `mailto:` als drei kleine
  Buttons.
- **Status**: Pill-Buttons in den 6 Status-Farben, Klick wechselt sofort.
- **Nachricht** + **Zusatzfelder** (aus `extraFields`).
- **Notizen**: Textarea mit „Speichern" / „Verwerfen" für die
  Notiz-Drafts. Persistiert via `updateStoredLead` für Browser-Leads;
  Demo-Leads behalten den Wert nur für die Sitzung.
- **Antwort-Vorlagen**: 3 Vorlagen aus `reply-templates.ts`
  (kurz / freundlich / Detail), jede mit Copy-to-Clipboard-Button.
  Platzhalter `{{name}}` und `{{betrieb}}` werden im Vorschau-Block
  bereits ersetzt; die Zwischenablage erhält den fertigen Text.

## Persistierung-API

```ts
import {
  appendLead,
  updateStoredLead,
  getStoredLeads,
  getEffectiveLeads,
  hasStoredLeads,
  clearStoredLeads,
  countByStatus,
  generateLeadId,
} from "@/lib/mock-store/leads-overrides";

// Public-Site-Submit
const lead = { /* …LeadSchema-konform… */ };
appendLead("studio-haarlinie", lead); // boolean

// Dashboard-Edit
updateStoredLead("studio-haarlinie", "lead-…", {
  status: "won",
  notes: "Termin bestätigt.",
});

// Listen-Lookup
const all = getEffectiveLeads("studio-haarlinie", demoLeads);
const counts = countByStatus(all);
```

LocalStorage-Schlüssel: `lp:leads-override:v1:<slug>`. Alle
Schreibwege validieren defensiv über `LeadSchema` – ungültige
Datensätze werden weder geschrieben noch gelesen.

## Compliance & Privacy

- **Keine sensiblen unnötigen Daten**: Das Formular fragt branchen-
  spezifisch nach genau dem Nötigen. Keine Geburtsdaten, keine
  Adresse, keine Kontonummer.
- **Demo-Hinweis**: Unterhalb der Felder steht *„Demo-Submission – Daten
  bleiben ausschließlich in Ihrem Browser"*. Damit ist auf der Public
  Site klar, dass kein realer Datentransfer stattfindet.
- **Pflicht-Geschäftsregel**: Name + (Telefon ODER E-Mail) – sonst
  könnten Anfragen nie beantwortet werden.
- **`robots: noindex, nofollow`** auf `/dashboard/<slug>/leads`.

## Paket-Gating

| Paket  | `lead_management` | UI-Status                                                |
| ------ | ----------------- | -------------------------------------------------------- |
| Bronze | ❌                | ComingSoonSection mit Hinweis „X Demo-Anfragen liegen an" |
| Silber | ✅                | Voller `<LeadsView>` mit Filter, Suche, Detail-Pane      |
| Gold   | ✅                | Voller `<LeadsView>`                                      |

Public-Site-Formular ist immer aktiv – Anfragen können auch von
Bronze-Betrieben angenommen werden, sie verwalten sie aber dann nur
über den Direktkontakt (Anrufen / WhatsApp / E-Mail).

## Tests

`src/tests/leads-system.test.ts` (~15 Assertions):

- 25+ Demo-Leads sind alle gegen `LeadSchema` valide.
- Jedes Industry-Preset hat `name` + `phone` als Felder und ≥ 2
  Lead-Felder gesamt.
- Mock-Store ist SSR-sicher (keine Throws ohne `window`,
  `appendLead`/`updateStoredLead` liefern `false`).
- `countByStatus` deckt alle 6 Status ab und summiert korrekt.
- `getEffectiveLeads` sortiert absteigend nach `createdAt`.
- `REPLY_TEMPLATES` enthält ≥ 3 Vorlagen mit `{{name}}`- und
  `{{betrieb}}`-Platzhaltern, die `fillTemplate` korrekt ersetzt.

Plus erweiterter `dashboard.test.ts`: erwartet jetzt mindestens **vier**
produktive Sektionen (Übersicht, Betriebsdaten, Leistungen, Anfragen).

## Beziehung zu späteren Sessions

- **Sessions 13–15** – KI-Assistent: kann Antworten direkt aus dem Lead
  generieren (Branche + USPs als Kontext).
- **Session 16** – Bewertungs-Booster: nutzt `email`/`phone` aus Leads,
  um nach erfolgtem Termin eine Vorlage zu schicken.
- **Session 18** – Settings: Lead-Routing, Webhook-URL, Auto-Reply.
- **Session 19** – Repository-Layer: ersetzt `leads-overrides` durch
  Supabase + Realtime; Public Site triggert eine Server Action,
  Dashboard streamt neue Leads in Echtzeit.
- **Session 22** – `docs/SALES.md`: nutzt die Demo-Antwort-Vorlagen als
  Vertriebsskript-Vorlage.
