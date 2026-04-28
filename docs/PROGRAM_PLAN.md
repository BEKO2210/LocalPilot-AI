# Programm-Plan – LocalPilot AI

**LocalPilot AI ist ein dauerhaftes Programm, kein Projekt mit Endpunkt.**
Anstatt 22 Sessions zu „erledigen" und fertig zu sein, läuft die Entwicklung
in **rollenden Meilensteinen** – jeder Meilenstein ist „stabil genug, um den
Fokus zu verlagern", nie „abgeschlossen". Wir kommen für Polish,
Performance, neue Plattform-Features und neue Branchen jederzeit zurück.

Diese Datei ersetzt die alte „Session 1 bis 22"-Sicht. Sie wird mit jeder
Session aktualisiert.

## Methodik (in Kurzform)

- **Session = 1 atomarer Schritt.** Klein genug, dass eine fokussierte
  Stunde reicht, sicher genug, dass der Build nach jeder Session grün ist.
- **Pro Session 1 Recherche-Step.** WebSearch nach aktuellen Patterns,
  Sicherheits-Hinweisen, neuen Versionen. Erkenntnis kommt in den
  Session-Eintrag im RUN_LOG, Quellen werden zitiert.
- **Inkrementelles Shipping.** Jede Session endet mit Commit + Push.
  GitHub-Pages-Deploy zeigt den neuen Stand auf dem Handy. Kein
  „Wir sammeln drei Wochen lang und mergen dann".
- **Variable Scope, fixe Qualität.** Wenn eine Session zu groß wird:
  splitten und in der nächsten weitermachen. Lieber 5 kleine Sessions
  als 1 große.
- **Maintenance ist gleichberechtigt.** Polish-, Performance-, Security-,
  A11y-, Test- und DX-Sessions zählen genauso wie Feature-Sessions.

Detaillierter Ablauf einer Session: siehe **`docs/SESSION_PROTOCOL.md`**.

## Meilensteine (rollend, open-ended)

Jeder Meilenstein hat ein **Erfolgskriterium**, ab dem wir den Fokus
verlagern. Wir kommen für Updates trotzdem zurück.

### Meilenstein 1 — Foundation
**Status:** ✅ stabil (Sessions 1–12 abgeschlossen)

Projektgrundlage, Datenmodelle, Pricing, Branchen-Presets, Themes,
Mock-Daten, Public Site, Marketing-Funnel, Dashboard-Skelett,
Business-Editor, Services-Editor, Lead-System.

**Erfolgskriterium erreicht:** Demo-fähiges Produkt, statisch deploybar,
6 Demo-Betriebe live, alle Editoren ohne Backend bedienbar.

**Was hier wieder aufgegriffen wird, wenn nötig:** Marketing-Texte,
neue Branchen-Presets, neue Themes, UX-Polish.

### Meilenstein 2 — KI-Schicht
**Status:** 🔄 in Arbeit (ab Session 13). **Mock-Phase mit Code-Session 20
abgeschlossen** — alle 7 Mock-Methoden sind deterministisch belegt,
~380 Smoketest-Assertions grün.

Branchenneutraler AI-Provider-Adapter, Mock-Provider mit hochwertigen
Beispieltexten, Echte Provider (OpenAI / Anthropic / Gemini) als
Skeletons, dann Schritt für Schritt scharf, je Capability eigene
UI-Komponente, Cost-Tracking, Rate-Limiting, Safety-Filter.

**Erfolgskriterium:** Alle 7 AI-Methoden aus `AIProviderInterface`
laufen mit Mock + mindestens einem Live-Provider, ohne API-Key
funktioniert die App weiterhin, Kostendeckel pro Betrieb.

**Session-Cluster (rollend):**
- 13–14: Provider-Scaffold + Mock für Website-Texte ✅
- 15–17: Mock für Service-Beschreibung, FAQ, Customer-Reply ✅
- 18–20: Mock für Review-Request, Social-Post, Offer-Campaign ✅
  **Mock-Phase abgeschlossen.**
- 21–22: OpenAI-Provider scharf (mit Caching)
- 23–24: Anthropic-Provider scharf
- 25–26: Gemini-Provider scharf + Cost-Tracking + Rate-Limit-UI
- 27+: AI-API-Route hinter Auth, Dashboard-UI je Capability,
  DOMPurify-Sanitizer auf übernommene KI-Outputs

### Meilenstein 3 — Engagement & Wachstum
**Status:** ⏳ vorbereitet

Bewertungs-Booster ausgebaut, Social-Media-Generator als eigene Seite,
Kampagnen-Builder, Referral-Tracking, E-Mail- und WhatsApp-Templates
mit Variablen.

**Erfolgskriterium:** Ein Betrieb kann ohne externes Tool
Bewertungs-Anfragen versenden und Social-Posts vorbereiten.

### Meilenstein 4 — Backend & Daten
**Status:** 🔄 in Arbeit (ab Code-Session 35).

Supabase-Schema, Auth (Magic Link, optional OAuth), Repository-Layer
ersetzt die localStorage-Mocks transparent, Storage für Logos und Bilder,
Multi-Tenant-Isolation, Backups.

**Erfolgskriterium:** App läuft mit echter DB, mehrere Nutzer:innen
sehen ausschließlich ihre eigenen Daten, Daten überleben Browser-Wechsel.

**Session-Cluster (rollend):**
- 35: Supabase-Client-Skeleton + Database-Health-Check (read-only) ✅
- 36: Plattform-Impressum + Datenschutz aus `LP_OWNER_*`-ENV ✅
  (Stammdaten leak-sicher per Konstruktion, Demo-Mode-Hinweis)
- 37: `businesses`-Schema (Migration 0001) + Repository-Layer mit
  Mock/Supabase-Resolver (`LP_DATA_SOURCE=...`) +
  Health-Probe `businesses-table` ✅
- 38: `services` + `reviews`-Tabellen (Migrationen 0002 + 0003),
  Repository liefert per FK-Embed nested Daten (1 Roundtrip) ✅
- 39: `faqs` + `leads`-Tabellen (Migrationen 0004 + 0005) inkl.
  `consents`-Audit-Trail aus Code-Session 32 ✅ FAQ embed im
  Repo, Leads mit asymmetrischer RLS (Insert-by-anon, Select
  nur authenticated)
- 40: Lead-Repository mit Insert-Pfad fürs Public-Form (mock +
  supabase) ✅ — RLS-Falle gefangen via client-side ID + INSERT
  ohne chained SELECT; 5-Kind-Error-Mapping (validation/rls/
  constraint/network/unknown). Magic-Link-Auth wandert auf 41.
- 41: `business_owners`-Tabelle (Migration 0006) + Owner-scoped
  RLS-Policies an 5 Tabellen (Migration 0007) ✅ DB-Teil; SSR-
  Auth-Infrastruktur wandert auf 42, UI auf 43 (atomar).
- 42: `@supabase/ssr`-Setup (server + browser Clients), Magic-Link-
  Route + Callback-Route, Middleware mit Session-Refresh ✅
- 43: Login-UI + Account-Page (Magic-Link-Form mit aria-live-
  Status, Browser-Client-Auth-Check) ✅. Geschützte Dashboard-
  Routen folgen, sobald Multi-Tenant-Daten da sind.
- 44: Public-Lead-Form auf `LeadRepository` umgestellt ✅.
  `POST /api/leads` mit dual-write (localStorage als Sicherheitsnetz),
  server-toleranter Submit (404 → silent local-only, 4xx/5xx →
  visible local-fallback-Hinweis), 4-stufiges `SubmitResult`-Mapping
  in `src/lib/lead-submit.ts`. Static-Pages-Build bleibt
  unverändert via `pageExtensions`-Filter.
- 45: Onboarding-Flow ✅. `/onboarding` Page + Form,
  `POST /api/onboarding` mit Auth-Gate + Service-Role-Dual-Insert
  (`businesses` + `business_owners`). Slug-Heuristik mit
  Umlaut-Mapping vor NFKD, Apostrophe-Strip. Reservierte Slugs
  Liste, 23505 → 409 mit klarer „Slug vergeben"-Meldung.
  Kompensation: bei Owner-Insert-Fehler wird der businesses-Insert
  rückgängig gemacht.
- 46: Account-Page zeigt eigene Betriebe ✅. `/account` listet
  jetzt nach erfolgreichem Login die Betriebe des Users via
  `business_owners ⨝ businesses`-Embed. Pure Mapping-Schicht
  `src/lib/account-businesses.ts` (~33 Asserts) normalisiert
  defensiv beide PostgREST-Embed-Formen (Single-Object und
  Array, weil supabase-js v2 konservativ als Array typisiert).
  Cards mit Rolle/Tier/Publish-Badges, Empty-State CTA auf
  `/onboarding`. Damit ist die End-to-End-Schleife geschlossen:
  Login → Onboarding → Account → Dashboard.
- 47: Public-Site auf Repository umgestellt ✅. Drei Pages
  (`/site/[slug]`, `/site/[slug]/datenschutz`, `/site/[slug]/
  impressum`) lesen jetzt über `loadBusinessOrNotFound` aus dem
  konfigurierten Repository (Mock im Static-Export, Supabase
  in SSR mit `LP_DATA_SOURCE=supabase`). `generateStaticParams`
  ist async und liefert Slugs aus dem Repository. Mit
  `dynamicParams=true` (Default) werden neue Slugs nach
  Build-Zeit on-demand gerendert. Dashboard-Migration folgt in
  Session 48 (9 Pages).
- 48: Dashboard auf Repository umgestellt ✅. Alle 9
  `/dashboard/[slug]/*`-Pages (layout, page, business,
  services, leads, ai, reviews, social, settings) lesen
  einheitlich über `loadBusinessOrNotFound`. Loader mit
  `React.cache()` gewrappt → Layout + Page deduplizieren den
  DB-Roundtrip pro Render-Pass. End-to-End-Schleife
  vollständig: Login → Onboarding → Account → echte
  Public-Site UND echtes Dashboard.
- 49: Lead-Read aus Repository ✅.
  `LeadRepository.listForBusiness(businessId)` ergänzt (mock
  in-memory + supabase mit `.order("created_at", desc)`).
  Mock-Resolver seedet jetzt aus `leadsByBusiness`, sodass
  Demo-Anfragen weiter sichtbar sind. Beide Dashboard-Pages
  (`page.tsx` Übersicht + `leads/page.tsx`) lesen jetzt aus
  dem Repo. Letzter Mock-Direktzugriff der Pages-Schicht ist
  damit erledigt.
- 50: Schreibpfad in DB für `BusinessEditForm` ✅.
  `PATCH /api/businesses/[slug]` mit Auth-Gate + RLS-only
  (Owner-Update via Migration-0007-Policy, KEIN Service-Role).
  Pure Submit-Helper `business-update.ts` mit 7-stufigem
  `BusinessUpdateResult`-Mapping (server / not-authed /
  forbidden / validation / local-fallback / fail). Form fällt
  bei Static-Build / 404 / offline transparent auf den
  localStorage-Pfad zurück. Bei 401/403/5xx KEIN Local-
  Schreiben → keine stille Drift mit DB.
- 51: Storage-Bucket für Logos + Hero-Bilder ✅.
  Migration 0008 erstellt `business-images`-Bucket (public=true,
  5 MB Limit, PNG/JPEG/WebP, **kein SVG**). Server-Route
  `POST /api/businesses/[slug]/image` macht Auth-Gate +
  Owner-Read-Check via authenticated-Client, anschließend
  Service-Role-Upload mit `upsert: true`. Pfad-Konvention
  `<slug>/<kind>.<ext>`. Pure Upload-Helper mit Mime-/Size-/
  SVG-Validation, ImageUploadField-Komponente mit Vorschau-
  Tile + „Hochladen" / „Ersetzen" / „Entfernen". URL landet
  über `methods.setValue` im Form und wird beim regulären
  „Speichern" mit-persistiert.
- 52: Settings-Page (Slug-Wechsel + Publish-Toggle + Locale)
  ✅. `PATCH /api/businesses/[slug]/settings` mit Auth-Gate +
  RLS-only (Server-Auth-Client). Postgres-23505 → 409
  „Slug vergeben". Pure Submit-Helper mit 7-stufigem Result
  (noop / server / not-authed / forbidden / slug_taken /
  validation / fail). Form macht bei Slug-Wechsel einen
  `router.push` auf den neuen Slug-Pfad nach 0,9 s. Stub-Page
  aus Session 32 ersetzt. README + Homepage angepasst
  (Header zeigt jetzt „Login" + „Jetzt starten",
  OnboardingPromise hat Magic-Link-Schritt + Login-CTA).
- 53: Reviews-UI scharf ✅. Bewertungs-Booster ist nicht mehr
  ComingSoon-Stub, sondern zielgerichtete UI:
  Channel-Tabs (WhatsApp/SMS/E-Mail/Persönlich), Tone-Pills
  (Kurz/Freundlich/Follow-Up), Mock-Provider liefert 1–3
  Varianten pro Klick, Platzhalter-Substitution
  (`{{customerName}}`/`{{reviewLink}}`/`{{businessName}}`)
  client-side, Direkt-Send-Buttons mit `wa.me`/`sms:`/`mailto:`,
  Copy-to-Clipboard pro Variante. Pure Template-Helper mit
  ~46 Asserts (Substitution, Phone-Cleaning für Kanäle,
  URL-Bau für 4 Channel-Typen, Subject/Body-Encoding).
- 54: Social-Media-UI scharf ✅. Symmetrisch zu Reviews:
  Plattform-Tabs (5: IG/FB/GBP/LinkedIn/WhatsApp-Status), 8
  Goal-Pills (more_appointments, promote_offer, new_service,
  collect_review, seasonal, before_after, trust_building,
  team_intro), Length-Picker (Kurz/Mittel/Lang), Topic-Input
  + Hashtags-On/Off. Mock-Provider liefert shortPost +
  longPost + hashtags + imageIdea + cta — alles mit
  Copy-Buttons. Plattform-spezifische Char-Counter mit
  Truncation-Warnung (IG 125, FB 480, LinkedIn 210, GBP 250)
  und Hashtag-Empfehlungs-Status (IG/LI 3–5, FB 1–2, GBP/WA 0).
  Pure Format-Helper mit ~40 Asserts (Labels, Limits,
  assessLength, composeFinalPost mit Tag-Normalisierung +
  case-insensitive Dedupe, adviseHashtagCount).
- 55: Schreibpfad in DB für `ServicesEditForm` ✅.
  Symmetrisch zu Session 50, aber Bulk-Sync statt flat-PATCH.
  `PUT /api/businesses/[slug]/services` mit Auth-Gate +
  RLS-only. Pseudo-IDs (`svc-<slug>-<random>`) werden
  serverseitig durch `crypto.randomUUID()` ersetzt; echte
  UUIDs (Migration 0007 RLS-Variant `[89ab]`, Version `[1-5]`)
  per `looksLikeDbUuid` erkannt → UPDATE-Pfad. Server berechnet
  Diff: `existingIds - incomingIds → DELETE`, Rest → UPSERT
  (`onConflict: "id"`). Lead-FK-Cascade auf `null` bewahrt
  Lead-Daten. Pure Submit-Helper `services-update.ts` mit
  6-stufigem Result + ~40 Asserts. Form mit drei differenzierten
  Bannern (server/local/error) + `submitting`-State. **Damit
  ist der Hauptinhalt der Public-Site (Friseur-Leistungen,
  Werkstatt-Pakete) endgültig self-service-fähig.**
- 56: Storage-Cleanup für Service-Bilder ✅. Beim Bulk-DELETE
  von Services werden orphan `image_url`-Werte aus dem
  `business-images`-Bucket entfernt. Pure Helper
  `storage-cleanup.ts` (parametrisiert auf `(urls, bucket)`,
  ~30 Asserts) ist generisch wiederverwendbar — Slug-Wechsel-
  Cleanup und ein zukünftiges Service-Image-Upload-UI nutzen
  ihn ohne Anpassung. Storage-Errors sind graceful: DB-DELETE
  läuft trotzdem (`console.warn` + `imagesFailed`-Count im
  Response). Außerdem als separater Commit: postcss-XSS-Fix
  (Dependabot moderate) + eslint-ReDoS-Fix (low) durch
  semver-minor-Bumps; `npm audit` ist nach diesem Commit auf
  0 Vulnerabilities.
- 57: Slug-Wechsel-Storage-Migration ✅. Pattern aus Session 56
  weitergedreht: bei `PATCH /api/businesses/<slug>/settings`
  mit `newSlug` werden Logo + Hero im `business-images`-Bucket
  von `<old-slug>/...` auf `<new-slug>/...` per atomarem
  `storage.move()` umbenannt; neue Public-URLs werden in
  einem zweiten DB-UPDATE eingespielt. Two-Phase-Pattern:
  UPDATE 1 (Slug, fängt 23505 → 409) → Move → UPDATE 2 (URLs).
  Move-Failure setzt URL auf null (kein 404-Bild auf der
  Public-Site). `storage-cleanup.ts` erweitert um
  `rewritePathPrefix` (mit strikter `/`-Boundary), `moveStoragePath`,
  `buildPublicUrl` (~22 neue Asserts on top, gesamt 52).
  Damit ist Storage-Hygiene **vollständig**: DELETE räumt
  auf (56), Slug-Wechsel migriert (57).
- 58: Service-Image-Upload-UI ✅. ServiceCard bekommt einen
  `ImageUploadField`-Slot mit UUID-Gating (Pseudo-IDs
  blockiert, echte UUID v4 sofort funktional). Upload-Route
  akzeptiert `kind="service"` mit Pflicht-`serviceId`
  (Path-Injection-Schutz via UUID-Regex). Pfad-Konvention
  `<slug>/services/<serviceId>.<ext>` im selben
  `business-images`-Bucket — Storage-Cleanup beim DELETE
  (56) und Slug-Wechsel-Move (57) sind bereits zuständig.
  `generateNewServiceId(slug)` umgestellt von Pseudo-ID auf
  echte UUID v4 (`crypto.randomUUID`), damit neu hinzugefügte
  Services sofort Bild-Upload-fähig sind.
- 59: Service-Bilder beim Slug-Wechsel mit-migrieren ✅.
  Pattern aus Session 57 wird für `services.image_url`
  ausgerollt: nach erfolgreichem Slug-UPDATE (Phase 1) wird
  pro Service-Row mit `image_url` auf unserem Bucket der
  Storage-Move auf den neuen Slug-Prefix ausgeführt
  (`Promise.all` parallel) und die DB-URL einzeln per
  `update().eq("id", x)` aktualisiert (zweites
  `Promise.all`). supabase-js v2 hat keinen native Bulk-
  Update mit unterschiedlichen Werten pro Row; pro-Row-
  UPDATE ist bei realistic 5–30 Services performant genug.
  Move-Failure setzt URL auf null (kein 404-Bild).
  Antwort um `serviceImagesMoved` + `serviceImagesFailed`.
  Damit ist die Storage-Hygiene-Lücke aus 58 geschlossen
  und der Storage-Stack symmetrisch über alle vier Pfade.
- 60: Light-Pass + Storage-Hygiene-Recap ✅. Sessions 56–59
  haben den Stack inkrementell ausgebaut — diese 5er-
  Multiple-Session konsolidiert die zwei Slug-Move-Blöcke
  aus 57+59 in einen einzigen pure Helper
  `storage-slug-migration.ts` (~38 Asserts), der per
  `Promise.all` Logo/Cover- und Service-Bilder-Migration
  parallel ausführt. `settings/route.ts` schrumpft von
  ~140 inline-Zeilen auf einen einzigen Helper-Aufruf. Neue
  Recap-Doku `docs/STORAGE.md` zeigt Bucket-Layout, Pfad-
  Konventionen und ein Diagramm aller 4 Hygiene-Pfade
  (Upload, DELETE-Cleanup, Slug-Move Logo/Cover, Slug-Move
  Services). Storage-Architektur ist damit production-ready
  und vollständig dokumentiert.
- 61: Live-Provider-Switch für Reviews-Panel ✅. Owner kann
  pro Generate-Klick zwischen Mock-Provider und Live (OpenAI/
  Anthropic/Gemini) umschalten. Neuer Pure-Helper
  `src/lib/ai-client.ts` (~150 Zeilen) mit 6-Result-Kind-
  Mapping (`server` / `not-authed` / `forbidden` /
  `rate-limit` / `static-build` / `fail`) als zentrale,
  getestete Browser→`/api/ai/generate`-Schnittstelle.
  Token-localStorage-Slot ist geteilt mit AIPlayground —
  einmal eingeben, in beiden Panels nutzbar.
- 62: Live-Provider-Switch für Social-Panel ✅. Symmetrisch
  zu 61 — gleicher Helper, gleicher Provider-Toggle, gleicher
  Token-Slot. Zusätzlich neuer lokaler `parseSocialOutput`-
  Helper für defensive Validation des `unknown`-Server-
  Outputs. Damit sind alle drei produktiven AI-Pfade
  (Playground, Reviews, Social) Live-fähig. Folge-Item:
  AIPlayground-Migration auf `callAIGenerate` als Light-Pass
  Session 65 (konsolidiert ~100 Zeilen inline-Error-Handling
  aus Session 28).
- 63: Default-Redirect bei einem Betrieb ✅. Owner mit
  genau einem Betrieb landen ab sofort nach Login direkt im
  Dashboard — Account-Übersicht ist nur noch sichtbar bei
  0/2+ Betrieben oder explizitem `?stay=1`-Bypass. Pure
  Helper `shouldRedirectToSingle(list, options?)` mit
  Whitespace-Slug-Defensive; UI nutzt `router.replace`
  statt `push` (kein Back-Button-Loop). +7 Asserts on top,
  39/40 Smoketests grün.
- 64: Lead-Retry-Queue ✅. Wenn das Public-Site-Formular
  einen Lead wegen Netzwerk-Hänger / 5xx nur lokal ablegt,
  wird er ab sofort beim nächsten `online`-Event automatisch
  erneut versendet. Pure Helper `lead-retry-queue.ts` (~250
  Zeilen, ~50 Asserts) mit Exponential-Backoff (5s → 5min,
  max 8 Versuche, danach `discardedAt`-Marker). Beim Flush
  werden 4xx als Success-Klasse behandelt (kein endloser
  Retry-Loop auf strukturell kaputten Leads). Form zeigt
  amber Badge „N ältere Anfragen warten …" bei nicht-leerer
  Queue. Damit ist der Public-Site-Lead-Pfad production-
  tauglich gegen Netzwerk-Hänger.
- 41+: Backup-Policy, Seed-Skript für Demo-Daten,
  „Betrieb löschen"-Flow mit rekursivem Storage-Cleanup.

### Phase 1 Restweg → MVP-funktional (Sessions 65–70)

Pflicht-Items, die `funktioniert alles` blockieren. Erst danach
beginnt die UI/UX-Polish-Phase.

- **65** (Light-Pass, 5er-Multiple) ✅: AIPlayground auf
  `callAIGenerate` migriert — letzte Stelle mit inline
  `/api/ai/generate`-Aufruf + ~100 Zeilen Error-Handling
  konsolidiert. Plus Recap-Doku `docs/AI.md`.
- **66** ✅: CSRF-Schutz für mutating Routes via
  Origin-/Referer-Header-Check (`lib/csrf.ts`, ~36 Asserts,
  10 Routen geschützt). Bearer-Token bypasst (CLI/Server-zu-
  Server). Außerdem industry-presets-Test (Codex #11)
  gefixt — 42/42 Tests grün.
- **67** ✅: HTML-Sanitize-Whitelist auf User-Inputs vor dem
  DB-Insert. Pure Helper `lib/user-input-sanitize.ts` (~250
  Zeilen, ~45 Asserts) wrappt den existierenden
  `sanitizeText`-Stripper aus Session 27 mit
  Whitespace-Normalisierung + Length-Cap + 3
  Domain-Wrappern (BusinessProfile, Service, Lead inkl.
  extraFields). 4 mutating Routen gehärtet
  (onboarding, business PATCH, services PUT, leads POST).
  Defense-in-Depth-Security-Stack komplett: SameSite +
  CSRF + HTML-Sanitize.
- **68** ✅: Error-Tracking via Adapter-Pattern.
  `lib/error-reporter.ts` (~190 Zeilen, ~30 Asserts) mit
  Public-API `captureException`/`captureMessage`/
  `reportRouteError`. Default-Sink: console (0 KB Bundle).
  Bei `SENTRY_DSN` ENV + installiertem `@sentry/nextjs`
  wird Sentry lazy via `await import(...)` aktiviert —
  keine harte Dep, kein Code-Wechsel beim Upgrade. Plus
  `app/global-error.tsx` als App-Router-ErrorBoundary für
  RootLayout-Crashes. Routen `/api/leads` + `/api/onboarding`
  melden 5xx-Errors. Observability-Layer eingezogen.
- **69** ✅: „Betrieb löschen"-Flow mit rekursivem Storage-
  Cleanup. `DELETE /api/businesses/<slug>` mit Auth + RLS
  + Stack-basiertem Walker (`listAllPathsByPrefix` +
  `removeAllByPrefix` in `storage-cleanup.ts`, +18 Asserts
  → 70 gesamt). Submit-Helper `business-delete.ts` (~110
  Zeilen, ~25 Asserts). UI mit Slug-Confirmation +
  `window.confirm()` als zweite Stufe + Redirect auf
  `/account?stay=1`. Lead-/Service-/Review-/FAQ-Cascade
  via FK. Self-Service-Cycle damit vollständig.
- **69**: „Betrieb löschen"-Flow mit rekursivem
  Storage-Cleanup. Nutzt vorhandene Helper aus 56/57/60.
- **70** (Light-Pass, 5er-Multiple): finaler Pre-MVP-Pass —
  alle 7 Pflicht-Items prüfen, Audit-Checkliste schließen.

### Phase 1.5 → End-to-End-Test-Block (Sessions 71–~76)

**Vor** der UI/UX-Polish-Phase: alles wie ein End-User
durchspielen. Anweisung des Auftraggebers: „Sehr viele
Tests bevor wir an die UI/UX. Alles muss funktionieren,
teste alles durch wie ein Endbenutzer."

Pro Session ein User-Flow als Playwright-E2E-Test. Skill:
`webapp-testing` (Playwright-Test-Generator + Runner).
Setup-Strategie: Tests laufen gegen lokale dev-Instanz mit
in-memory Mock-Provider (kein echtes Supabase nötig in
CI-Umgebung).

- **71** ✅: Setup-Session. `@playwright/test@^1.59.1`,
  `playwright.config.ts`, **10 Smoke-Tests grün** in 22 s
  (Landing, Login, Public-Site × 2 Slugs, Account). Demo-
  Modus: alle Tests grün ohne Supabase-ENV. `docs/TESTING.md`
  als Pflicht-Doku. 2 Annahmen-Fehler beim ersten Lauf
  aufgedeckt + gefixt (Footer-Selector Demo-Card-Kollision,
  Lead-Form branchenspezifische Felder) — exakt der
  Mehrwert, den E2E-Tests liefern sollen.
- **72** ✅: Onboarding-Flow E2E. 7 Tests: Form-Render mit
  ID-Selector (Asterisk-Spans brechen `getByLabel`-strict),
  Slug-Vorschlag, Select-Optionen-Counts, Branche+Theme-
  Unabhängigkeit, Submit ohne Pflicht-Felder. + 1 Login-
  Submit-Test. **18/18 E2E grün**. 2 Phase-2-UX-Items
  dokumentiert: Default-Tier ist `silber` statt `bronze`
  (gewollt? — Bronze als Free-Tier wäre Standard-SaaS),
  Branche-Auswahl koppelt nicht automatisch ans Theme
  (Auto-Empfehlung wäre UX-Win). Auth-gemockter Submit
  wandert in Session 75 (storageState-Setup).
- **73** ✅: Business-Editor + Dashboard-Shell E2E.
  12 Tests in 2 Files. **30 grüne E2E-Tests insgesamt** —
  Phase-1.5-Ziel ≥25 erreicht. Alle 6 Sektionen, Save-/
  Discard-Disabled-Logic, Tab-Navigation mit `:visible`-
  Filter (Mobile-Nav rendert hidden auf Desktop). 2
  Phase-2-Items dokumentiert (Verwerfen-Button bleibt
  nach Discard enabled — RHF-isDirty-Reset; Status-Bar-
  Heading als `<p>` statt `<h2>` — A11y).
- **74** ✅: Service-Liste E2E. 9 Tests: Silber-Editor (CRUD,
  Reorder via Pfeil-Buttons, Delete-Confirm-Inline, UUID-
  Gating-Hint im Image-Upload-Field, Save-isDirty) +
  Bronze-ComingSoon-Lock („Im Paket Bronze gesperrt").
  **39 grüne E2E-Tests** insgesamt — 56% über dem
  Erfolgskriterium ≥25. Selektor-Pattern `ul details`
  filtert Business-Header-Switcher raus; `<details>`-Cards
  per DOM-API geöffnet (sticky Top-Bar überdeckt Summary-
  Click — Phase-2-Item für Touch/Mobile).
- **75** (5er-Multiple, Light-Pass + E2E): Settings-E2E
  (Slug-Wechsel mit Storage-Move-Indikator, Publish-Toggle,
  Locale, Danger-Zone-Löschen mit Slug-Confirm) + Light-
  Pass auf E2E-Test-Helpers (Stable Selectors, Test-Data-
  Builders, Page-Objects).
- **76**: Public-Site-E2E + Lead-Retry-Queue. Lead-Form
  ausfüllen, Hero/Services/FAQ rendern, Mobile-CTA-
  Streifen, Theme-Wechsel, Lead-Retry-Queue-Verhalten
  bei `online`/`offline`-Events.

Erfolgskriterium Phase 1.5: ≥25 grüne E2E-Tests, alle
kritischen User-Flows abgedeckt, `TESTING.md`-Doku mit
Anleitung „lokal testen" + „CI-Setup".

### Phase 2 → UI/UX-Polish (Sessions ~77–~86+)

Nach Phase-1.5 (E2E-Coverage steht) folgt die mindestens
10-Sessions-tiefe Polish-Phase. Pro Session ein klar
abgegrenzter Audit-Bereich mit (a) Snapshot des Ist-Stands,
(b) Issue-Liste, (c) Fixes, (d) E2E-Tests aus Phase 1.5
als Regression-Schutz.

- **77**: Public-Site-Audit. Hero-Section, Service-Cards,
  Lead-Form, Theme-Anwendung, Footer. Theme-Token-
  Konsistenz prüfen.
- **78**: Dashboard-Shell-Audit. Header, Sidebar/Tabs,
  Mobile-Nav, Empty-States, Auth-Card.
- **79**: Editor-Audits — alle 5 Editoren (Business,
  Services, Settings, Reviews, Social) auf Buttons, Spacing,
  Validation-Hints, Banner-Konsistenz.
- **80** (5er-Multiple, Light-Pass): Form-System-
  Konsistenz + Component-Reuse-Pass mit `simplify`-Skill.
- **81**: **Demo-Logo + Brand-Identity**. Aktuelles Logo
  ist text-only (LocalPilot AI). Mit `algorithmic-art`-Skill
  ein generatives p5.js-Mark + statische SVG-Variante
  produzieren. Brand-Tokens (`brand-guidelines`-Skill)
  definieren: Farben, Schriften, Spacing, Iconography.
- **82**: Theme-Polish. `theme-factory`-Skill anwenden auf
  alle 10 Themes — Konsistenz-Audit der Farben, Schrift-
  Hierarchie, Buttons, Form-Surfaces. Public-Site-Theme-
  Switcher als Demo-Tool.
- **83**: A11y-Audit. Tab-Order, ARIA-Labels, Contrast-
  Ratios (WCAG 2.2 AA), Focus-States, Reduced-Motion-Pfad.
- **84**: Mobile/Tablet-Responsive-Audit. Breakpoints
  (sm/md/lg/xl), Touch-Targets (≥44×44), Mobile-CTA-
  Streifen, Tab-Bars.
- **85** (5er-Multiple, Light-Pass): Type-System-Pass.
- **86**: Finaler Polish-Pass + Lighthouse-Run + Bundle-
  Cleanup + Production-Deploy-Doku.

### Skill-Mapping (Phase 2)

Verfügbare Claude-Code-Skills, die in der UI/UX-Phase zentral
werden:

| Skill                  | Einsatz in Phase 1.5/2                              |
| ---------------------- | ----------------------------------------------- |
| `webapp-testing`       | **Phase 1.5 (Sessions 71–76)** — Playwright-Tests pro User-Flow. Regression-Schutz für Phase 2. |
| `simplify`             | Light-Pass-Sessions (65 ✅, 70 ✅, 75, 80, 85) — Code-Diff-Review für Reuse + Quality + Efficiency. |
| `algorithmic-art`      | Session 81 — Demo-Logo als generatives p5.js-Artwork mit Seed (reproduzierbar). |
| `theme-factory`        | Sessions 81+82 — Brand-Tokens auf alle Artefakte (HTML/CSS/Slides/PDF) anwenden. |
| `brand-guidelines`     | Session 81 — Brand-Definition (Farben, Schriften, Voice, Iconography) als Single-Source-of-Truth. |
| `systematic-debugging` | Bei Bug-Hunting in Audit-Phasen — Senior-Dev-Pipeline statt Rumprobieren. |
| `security-review`      | Session 70 (Pre-MVP) ✅ + vor Production-Deploy — Branch-weiter Security-Scan. |
| `review`               | PR-Reviews vor `main`-Merge. |

### Meilenstein 5 — Production-Readiness
**Status:** ⏳ geplant

Vercel-Deployment für SSR-fähige Routen (parallel zu GitHub Pages),
Custom Domains, Sentry für Error-Tracking, Analytics, Lighthouse-CI,
Performance-Budgets, A11y-Audit, Security-Headers.

**Erfolgskriterium:** Lighthouse ≥ 95 in allen 4 Kategorien,
WCAG 2.2 AA dokumentiert geprüft, Sentry-Inbox leer.

### Meilenstein 6 — Vertikalisierung & Sales
**Status:** ⏳ geplant

Branchen-Presets von 13 auf 20+, Themes von 10 auf 15+, Sales-Materialien,
Onboarding-Doku, Pricing-Experimente, Demo-Videos, Case-Studies.

**Erfolgskriterium:** „Onboarding eines neuen Betriebs in unter 60 Min."
ist real durchführbar, dokumentiert, mehrfach getestet.

### Meilenstein 7 — Innovation Loop
**Status:** ♾️ permanent

Sobald Meilenstein 6 stabil ist, dreht sich das Programm in Schleifen.
Pro Quartal:

- Neue Anthropic-/OpenAI-/Gemini-Modelle integrieren, sobald sie
  released werden.
- Neue Web-Plattform-Features (View Transitions, Container Queries,
  Speculation Rules, Popover-API, …) prüfen und ggf. einbauen.
- Tailwind-Major-Updates folgen, falls sinnvoll.
- Neue Branchen, neue Themes, neue Sprachen.
- White-Label-Funktionen für Reseller.

Dieser Meilenstein endet nie.

## Self-Extending Backlog

Verbindlich ab Code-Session 18: jede Session erweitert diesen Backlog
um **mindestens einen** neuen Punkt aus Recherche, Implementierung
oder Beobachtung. Erst wenn ein Punkt erledigt ist, wandert er aus
der Liste in den RUN_LOG.

Die Punkte sind nach Track gruppiert. Jede Code-Session darf jeden
Track bedienen — die Wahl trifft der nächste Plan-Step in der jeweils
aktiven Session.

### Track A · Innovation & neue Capabilities
- WhatsApp-Business-Cloud-API als Versand-Pfad für Review-Requests
  (Meilenstein 3) — höchste Conversion in der Recherche zu
  Code-Session 18.
- AI-gestützter A/B-Test für Review-Request-Tonalitäten: jede Variante
  bekommt einen Tracking-Param, Conversion wird gemessen.
- „Best Time to Ask"-Heuristik: aus Lead-Daten den optimalen Zeitpunkt
  für die Bewertungs-Anfrage ableiten (z. B. 2–6 h nach Termin).
- Antwort-Generator als API-Route hinter Auth (statt rein clientseitig),
  damit später Cost-Tracking + Audit-Log möglich werden.
- View-Transitions-API für Dashboard-Tab-Wechsel — verbessert die
  „App-Feel"-Wahrnehmung auf dem Handy spürbar.
- **Social-Media-Forwarding** (aus Code-Session 19): Buffer-/Hootsuite-
  oder Meta-Graph-API-Anbindung, sodass `generateSocialPost` direkt
  als Entwurf in der Plattform landet. Plattform-spezifische Hashtag-
  Limits (Code-Session 19 hat sie deterministisch verankert) bleiben
  auch im Vorschau-Schritt sichtbar.
- **Visual-Companion**: Vorschlag für ein passendes Stockfoto-Pendant
  oder Canva-Template-Slot zu jedem `imageIdea`, damit der Workflow
  vom Text bis zum gepostbaren Asset durchgängig ist.
- **Offer-Campaign-Bundle**: aus `generateOfferCampaign` automatisch
  passende `generateSocialPost`-Varianten (Instagram + Facebook) +
  `generateReviewRequest` (Follow-Up) ableiten. Eine Kampagne =
  Headline + Subline + Body + CTA + Social-Pakete + Review-Push.
- **AI-API-Route mit Edge-Runtime**: `/api/ai/generate` als Vercel-Edge-
  Function (statt Node), niedrige Latenz, gute Streaming-Kompatibilität
  mit Anthropic/OpenAI-SSE.
- **Prompt-Caching-Telemetrie** (aus Code-Session 21): pro Request
  loggen, wie viele Token aus dem Cache kamen (`usage.prompt_tokens_details
  .cached_tokens`). Daraus lässt sich später ein konkreter Kostenreport
  pro Branche/Variante bauen.
- **Modell-Switch-UI** (Track A oder F): pro Betrieb einstellbar,
  ob OpenAI-`gpt-4o-mini`, `gpt-4o` oder `o1-mini` benutzt wird.
  Default bleibt `gpt-4o-mini` (günstig + schnell, strukturiert
  zuverlässig).
- **Prompt-Bibliothek extrahieren** (aus Code-Session 22):
  System-Prompts liegen aktuell als Konstanten in `website-copy.ts`
  und `service-description.ts`. Bei 7 scharfen Methoden × 3 Providern
  (OpenAI, Anthropic, Gemini) entstehen 21 Strings. Sie wandern in
  `src/core/ai/prompts/<method>.ts` mit Provider-neutralen
  Helfer-Buildern.
- **Saatzeilen-Übergabe Mock → Live** (aus Code-Session 22):
  `improveServiceDescription` poliert eine bestehende Beschreibung.
  Wenn der Auftraggeber zwischen Mock und Live wechselt, soll der
  vom Mock vorbereitete Text als `currentDescription` an den
  Live-Provider durchgereicht werden — als „polish me"-Pipeline.
- **Provider-Parity-Suite** (aus Code-Session 24): jetzt, wo zwei
  Live-Provider existieren (OpenAI + Anthropic), lohnt eine
  optionale Parity-Suite, die den **gleichen Input** an beide
  Provider schickt und prüft, dass beide Outputs das gleiche
  Schema einhalten und nicht auseinanderdriften (Tonalität,
  Längen, Stadt-Bezug). Skip-by-default; nur mit beiden Keys
  + Opt-in-Flag aktiv.
- **Tool-Use-Generator aus Zod** (aus Code-Session 24): Anthropic
  braucht JSON Schema (kein Zod-Helper). Aktuell schreiben wir das
  von Hand (siehe `anthropic/website-copy.ts`). Ab 7 Methoden ×
  jede Variant-Kombination wird das mühsam. Ein
  `zodToToolInputSchema(WebsiteCopyOutputSchema)`-Helper
  (oder via `zod-to-json-schema`-Lib) würde die Wartung
  drastisch vereinfachen. Mit Code-Session 25 sind es **zwei**
  hand-geschriebene Tool-Schemas (`emit_website_copy`,
  `emit_service_description`) — Drift-Risiko wächst.
- **Anthropic Structured-Outputs migration prüfen** (aus
  Code-Session 25): Anthropic hat in 2026 ein offizielles
  `output_config.format` (Constrained Sampling) eingeführt, das
  Tool-Use als Strukturierungs-Workaround ersetzt. Tool-Use bleibt
  weiter unterstützt, ist aber redundant für reine Struktur.
  Lohnt sich, wenn 4–5 Anthropic-Methoden scharf sind: Migration
  auf `output_config.format` reduziert Boilerplate (kein Pseudo-
  Tool nötig) und setzt direkt auf compiled Grammar Constraints.
  Risk: ältere Modelle unterstützen es nicht — pinning auf
  Sonnet-4.5+ erforderlich.
- **Gemini Context Caching aktivieren** (aus Code-Session 26):
  Gemini hat eigene `caches.create(...)`-API für lange,
  wiederverwendete Prefixe (System-Prompt + Schema). Lohnt sich
  ab größeren Aufruf-Zahlen. Der erste Setup in Session 26
  hat es bewusst weggelassen, weil ohne Volumen kein Effekt.
  Folge-Session: Cache-Layer mit TTL-Tracking, getrennte Cost-
  Bucket pro Branche/Variant.
- ~~**AI-API-Route mit Auth + Live-Provider-Aufruf aus Browser**~~
  (Code-Session 28 ✅ + Cookie/JWT-Auth Session 33 ✅ + Vercel-
  Deploy-Pipeline Session 34 ✅).
  Verbleibende Folge-Items:
  - Edge-Runtime-Migration (statt Node) für niedrige Latenz +
    Streaming-Support. Aktuell `runtime: "nodejs"` für die HMAC-
    Auth via `node:crypto`. Für Edge umstellen auf
    `Web Crypto SubtleCrypto.HMAC`.
  - **Custom-Domain auf Vercel** (Code-Session 34 lieferte das
    Default-Subdomain). DNS-Records am eigenen Provider setzen,
    Vercel-Dashboard verbindet automatisch.
  - **Vercel-Logs → Sentry / Logflare**-Adapter, sobald wir echte
    Nutzer haben (Track C Observability).
  - **Multi-Tenant-Auth mit echten Usern** (Track G, ab Backend-
    Meilenstein 4): aktuell ein einzelnes geteiltes Passwort pro
    Server. Sobald Supabase steht: User-Accounts mit Email/Magic-
    Link, Tenant-Bucket pro Betrieb, Session-Bindung an `business_id`.
  - **CSRF-Schutz** für die Cookie-Auth: Origin-Header-Check oder
    Double-Submit-Token. Aktuell schützt SameSite=Lax die meisten
    Cross-Site-Forgeries; eine zweite Verteidigungslinie ist trotzdem
    sinnvoll, sobald wir cross-domain-Endpunkte haben.
  - **Edge-Compatible-JWT**: aktuell Node-`crypto`. Für Edge-
    Runtime auf `Web Crypto SubtleCrypto.HMAC` umstellen.
- **USP-Editor pro Betrieb** (aus Code-Session 27): Die
  Kontext-Box zeigt aktuell „USPs: (noch nicht hinterlegt)".
  Schema und Repository-Layer fehlen — kommt zusammen mit dem
  Settings-Editor in Meilenstein 4. Bis dahin Werte aus
  `business.json` als Mock-Daten ergänzen reicht für die Demos.

### Track B · Security & Compliance
- ~~DOMPurify oder ähnlicher Sanitizer für jeden vom Nutzer übernommenen
  KI-Output~~ (Code-Session 31 ✅, Plain-Text-Variante).
  Folge-Items:
  - **Markdown-/HTML-Render-Pfad scharf machen**: sobald ein Bereich
    KI-Output als HTML rendert (Markdown-Renderer in Reviews,
    Reicher-Text-Editor, etc.), `isomorphic-dompurify` einziehen
    und den `sanitizeAIOutputAsHtml`-Stub durch echte Whitelist
    ersetzen (Tags: `b/strong/em/i/p/br/ul/ol/li`).
  - **Property-based Test-Suite**: aktuell 29 manuell kuratierte
    Injection-Vektoren. Sinnvoll: ein Generator-Test (z. B. mit
    `fast-check`), der zufällige Mix-Strings produziert und
    invariant prüft („nach Sanitize gibt es kein `<script>`").
  - **CSP-Header** (Track B): zusätzliche Schicht, falls der
    Sanitizer mal versagt — Strict-CSP via Nonce bei der
    SSR-Auslieferung.
- npm-audit-Lauf in CI, plus monatlicher Auto-Bump-Pass mit
  `npm outdated` + Smoketest.
- DSGVO-Hinweis-Block für die Bewertungs-Anfrage-Versendung
  (Einwilligung, Speicherdauer, Widerruf).
- ~~**DSGVO-Lead-Einwilligung**~~ (Code-Session 32 ✅, Lead-Form
  hat aktive Pflicht-Checkbox + Versions-Stempel + Speicherdauer-
  Hinweis + Verlinkung auf `/datenschutz` und `/impressum`).
  Folge-Items:
  - **Settings-Editor mit Legal-Sektion** (Meilenstein 4): USt-IdNr.,
    Aufsichtsbehörde, Berufshaftpflicht, individueller
    Datenschutzbeauftragter pro Betrieb.
  - **Datenschutzerklärung-Editor** im Dashboard, damit der
    Auftraggeber den Stub-Text durch eigene anwaltlich geprüfte
    Texte ersetzen kann (mit automatischem Versions-Bump bei
    inhaltlicher Änderung).
  - **Auftragsverarbeitungsvertrag-Vorlage** für den Reseller-Fall
    (LocalPilot AI vs. der lokale Betrieb als Verantwortlicher).
  - **Lead-Retention-Cron**: alte Leads über
    `LEAD_RETENTION_MONTHS` automatisch löschen (sobald Backend
    steht — aktuell nur localStorage, also User-kontrolliert).
  - **Widerrufs-Handler-Endpoint** (`/api/lead/withdraw`): Anfragender
    sendet E-Mail-Verifikations-Token, Lead wird sofort entfernt +
    Audit-Eintrag.
- Rate-Limit auf der KI-Layer (Mock + zukünftig echte Provider) mit
  zentraler Konfiguration und transparenter Fehlermeldung im UI.
- Content-Security-Policy + Subresource-Integrity Header für den
  produktiven Build.
- **API-Key-Hygiene-Audit** (aus Code-Session 21): aktuell wird der
  Key direkt aus `process.env` gelesen. Sobald API-Routes existieren,
  ergänzen wir einen serverseitigen Wrapper, der den Key nie in
  Logs auftauchen lässt (Redaction in Sentry-Integration).
- ~~**Cost-Cap pro Betrieb**~~ (Code-Session 29 ✅, Default-Bucket).
  Folge-Items:
  - Bucket-Key per Betrieb-Slug (`business:<slug>`) statt
    `default` — sobald Auth + Multi-Tenant steht.
  - Persistenter Store (Redis/Upstash) statt In-Memory, sobald
    multi-instance deployed.
  - Monthly-Cap zusätzlich zum Daily-Cap.
  - Cost-Audit-Log pro Betrieb (für Auftraggeber-Reports und
    Pricing-Validierung der Pakete).
  - Echtes Provider-Usage statt Heuristik (4 Zeichen ≈ 1 Token).
    Aktuell unterschätzen wir 5–15 % — fein für Indikation, zu
    grob für Abrechnung.

### Track C · Observability & Qualität
- Strukturierte Telemetrie der Mock-Provider-Aufrufe (Welche Methode,
  welche Branche, welche Variante), damit später echte Calls mit
  derselben Pipeline angezeigt werden können.
- Lighthouse-CI als Gate: Performance + A11y + Best Practices
  müssen ≥ 95 bleiben, sonst Fail.
- Vitest oder ein vergleichbarer Test-Runner ergänzt den jetzigen
  „Smoketest-via-tsx"-Ansatz, sobald die Test-Tiefe wächst.
- Visual-Regression-Tests (Playwright) für die kritischen Public-Site-
  Sektionen.
- **Health-Snapshot-Endpoint** (aus Code-Session 30): aktuell
  Auth-gated und nur über die Dashboard-UI sichtbar. Folge-Items:
  - Public-Status-Page (`/status`) mit subset-Snapshot ohne
    sensitive Felder, geeignet für Status-Pages-Ähnliche Anzeige.
  - Status-History (letzte 7 Tage Budget-Verbrauch) für
    Auftraggeber-Reports.
  - Slack-/Email-Alert wenn `percentUsed > 80 %` an einem Tag.
- ~~**Database-Health: schärferer Tabellen-Probe**~~
  (Code-Session 37 ✅, `businesses-table`-Probe via
  `select=id&limit=1`). Folge-Items:
  - Cache-Layer mit 30-Sekunden-TTL (Server-Cache), damit ein
    aggressiver Refresh-Klick nicht jedes Mal 1–2 s blockt.
  - **Auto-Pause-Detection**: Free-Tier-Projekte schlafen nach
    7 d Inaktivität. Health-Check sollte diesen Spezialfall
    erkennen (HTTP 404 + spezifischer Body) und im UI „Projekt
    pausiert — auf Restore klicken" anzeigen.
- **Repository-Pfad-Switch im Dashboard sichtbar machen** (aus
  Code-Session 37): aktuell zeigt der Health-Block nur, dass DB
  „ok" ist. Sinnvoll wäre ein Badge „Datenquelle: mock | supabase",
  damit der Auftraggeber unterscheiden kann, welche Daten gerade
  am Public-Site-Output hängen.
- **Seed-Skript für Demo-Daten** (aus Code-Session 37): sobald
  die Migration läuft, müssen die 6 Demo-Betriebe in der Tabelle
  landen, sonst zeigt `LP_DATA_SOURCE=supabase` eine leere
  Public-Site. Skript: `supabase/seed.sql` mit `insert ... on
  conflict (slug) do nothing` aus den Mock-Daten — muss nach
  Code-Session 38 alle drei Tabellen abdecken (businesses,
  services, reviews).
- **Property-based-Test Schema↔Migration-Drift** (aus Code-Session 38):
  Code-Session 38 fand einen Drift (package_tier-CHECK enthielt
  englische Werte, Zod-Enum hat aber deutsche). Sinnvoll: ein
  Test, der das TS-Enum gegen die SQL-CHECK-Constraint matcht
  (z. B. SQL parsen oder beide aus einer Quelle generieren).
- ~~**Public-Lead-Form auf LeadRepository umstellen**~~
  (Code-Session 44 ✅, dual-write mit Server-Toleranz).
  Folge-Items:
  - **Dashboard-Lead-Read auf Supabase** (in Multi-Tenant-Session):
    sobald die Dashboard-Liste aus `business_owners` × `leads`
    speist, kann der dual-write-Pfad einseitig werden (nur Server).
  - **Retry-Queue für `local-fallback`**: aktuell bleibt der Lead
    im localStorage liegen. Optional: ein leichter Retry-Worker,
    der bei nächster Online-Phase erneut versucht zu posten.
- ~~**Onboarding-Flow** (Code-Session 45 ✅).~~ + ~~**Account-Page
  mit eigenen Betrieben**~~ (Code-Session 46 ✅).
  Folge-Items:
  - **Slug-Live-Check**: ein optionaler `HEAD`/`exists`-Check auf
    `/site/<slug>` bevor der Submit losgeht — fängt vergebene Slugs
    schon im Form ab. Heute löst Postgres-Unique das, aber erst
    nach dem Submit.
  - **Onboarding-Wizard mehrstufig**: Adresse + Kontakt + Logo
    optional als Schritt 2 nach dem Initial-Insert. Aktuell ist
    `address` mit Platzhaltern gefüllt.
  - **Dashboard-Read aus Supabase** (für Owner): aktuell zeigt
    `/dashboard/[slug]/...` die Mock-Daten — auch wenn der User
    in Supabase angelegt ist. Ziel: Dashboard liest via
    `BusinessRepository.findBySlug` aus dem konfigurierten
    Repository-Pfad (mock oder supabase), Owner-RLS aus 0007 trägt
    die Auth-Schicht.
  - **Multi-Member-Verwaltung**: `business_owners`-CRUD-UI für
    den Owner (Editor/Viewer einladen, Rollen ändern, entfernen).
  - **Default-Sicht-bei-genau-einem-Betrieb**: wenn User nur einen
    Betrieb hat, automatisch nach Login auf
    `/dashboard/<slug>` redirecten statt `/account`.
- **Dependency-Sweep-Session** (aus Deep-Pass nach Session 40):
  viele Major-Bumps stehen an: `next 15→16`, `react 19.0→19.2`,
  `tailwindcss 3→4`, `typescript 5.7→6`, `zod 3→4`, `eslint 9→10`,
  `lucide-react 0.469→1.11`, `@anthropic-ai/sdk 0.62→0.91`,
  `openai 5→6`, `tailwind-merge 2→3`. Manche brechen
  (zod-Peer-Dep der AI-SDKs!), eigene Maintenance-Session lohnt.
- **Stale-`comingInSession`-Audit** (aus Light-Pass Session 35):
  Bronze-User sehen `comingInSession={11}` (Services) bzw.
  `={12}` (Leads), obwohl die Features längst gebaut sind — die
  echte Logik ist „Bronze-Lock", nicht „kommt später". Audit:
  zwei separate Komponenten — `<FeatureLockedSection>` für
  Tier-Locks, `<ComingSoonSection>` nur für tatsächlich offene
  Features.
- **Impressum-Editor im Dashboard** (aus Code-Session 36):
  aktuell kommen die Owner-Daten ausschließlich aus
  `LP_OWNER_*`-ENV — gut für Privacy, aber unbequem für
  Reseller-Szenarien (jeder Mandant müsste seine eigene
  Vercel-Instanz haben). Mit Multi-Tenant-Backend (Meilenstein 4):
  Owner-Daten optional per Betrieb in der DB überschreibbar,
  ENV bleibt als Default für die Plattform-Marketing-Seite.
- **Marketing-Footer-Verifikation**: aktuell zeigt die Public-Site
  einen `#kontakt`-Anchor ohne echte Sektion. Hinweis aus
  Code-Session 36: entweder Sektion bauen oder Anchor entfernen.

### Track D · DX & Refactor
- Gemeinsamen `clamp`/`polish`/`substituteCity`-Helper in
  `src/core/ai/providers/mock/_helpers.ts` extrahieren — derzeit
  duplizieren website-copy / service-description / customer-reply
  / review-request / social-post / offer-campaign diese Funktionen
  leicht abweichend. Mit Code-Session 20 sind es **sechs** Duplikate
  von `clamp` — nächste DX-Session sollte das einsammeln.
- `topicToQA` aus `faqs.ts` und `detectTopic` aus `customer-reply.ts`
  teilen sich eine ähnliche Stamm-Erkennung — ein gemeinsames
  `topic-detection.ts`-Modul vermeidet zukünftige Drift.
- Smoketest-Datei ist mit Code-Session 20 auf >1100 Zeilen / ~380
  Assertions gewachsen — Aufteilung pro Methode parallel zur
  Aufteilung der Implementierung wird dringender.
- `tagify`-Helper aus `social-post.ts` ist verwandt mit
  `normalizeQuestion` aus `faqs.ts` (NFKD + Diakritik-Strip). Ein
  gemeinsames `slugify.ts` würde beides bedienen.
- **Live-/Mock-Parität sichern** (aus Code-Session 21): wenn der
  OpenAI-Provider mehr Methoden scharf hat, lohnt eine Parity-Suite,
  die Mock und Live mit dem gleichen Input fährt und prüft, dass
  beide das gleiche Schema erfüllen. Live-Calls dürfen optional
  bleiben (skip-by-default).

### Track E · Vertikalisierung
- Branchen-Presets von 13 auf mindestens 20 erweitern; Kandidaten:
  Heizungsbauer, Dachdecker, Imbiss, Hundesalon, Physiotherapie,
  Massage, Steuerberater.
- Pro Branche: dedizierte `reviewRequestTemplates` (sms ergänzen, ist
  bei einigen Presets noch nicht abgedeckt — Code-Session 18 musste
  daher synthetisieren).
- Pro Branche: dedizierte `socialPostPrompts` für **alle 8 Goals**
  (Code-Session 19 hat aufgedeckt, dass kein Preset alle Goals
  abdeckt — Synthese springt häufiger ein, als sie sollte).

### Track F · Doku & Onboarding
- Architektur-Diagramm (Mermaid) für den AI-Adapter — wie greifen
  Resolver, Provider, Mock-Methoden und API-Route ineinander.
- „Wie ergänze ich eine Branche in 30 Min."-Checkliste in
  `docs/ADD_INDUSTRY.md`.
- Recherche-Quellen aus den RUN_LOG-Einträgen in einer
  `docs/RESEARCH_INDEX.md` thematisch sortieren — wird mit der Zeit
  zum belegten Wissensspeicher des Programms.
- **Glossar** (`docs/GLOSSARY.md`) für projektinterne Begriffe —
  bereits als Codex-Backlog #7 vorbereitet.
- **Codex-Onboarding-Polish**: nach den ersten 5 Codex-Sessions die
  Erfahrungen in `codex.md` als „Was hat sich bewährt"-Anhang
  ergänzen.

### Track G · Mitwirkende-Koordination (neu mit Code-Session 20)
- **Codex-Junior-Workflow** ist jetzt etabliert
  (`codex.md` + `docs/CODEX_BACKLOG.md` + `docs/CODEX_LOG.md`).
- Backlog mit 9 Starter-Aufgaben (8 `[pre-approved]` + 1
  `[blocked]` auf Prettier).
- Folge-Iteration: Backlog wächst durch jede Claude-Session
  (Schritt 6 im Session-Protokoll, Sub-Punkt: „beobachtete Junior-
  Tasks ins Codex-Backlog").
- **Granularer Zugriffsschutz**: prüfen, ob `.git/hooks/pre-commit`
  einen einfachen Check enthalten kann, der bei `codex/`-Branches
  Änderungen an NEVER-Zone-Pfaden blockiert (Track B Security
  + Track G).

## Meilenstein-Wechsel-Entscheidung

Wir wechseln den Fokus, wenn **alle drei** zutreffen:

1. Erfolgskriterium des aktuellen Meilensteins erreicht.
2. Keine kritischen Bugs offen (Lint/Typecheck/Build sind grün, niemand
   meldet Showstopper).
3. Es gibt einen klaren nächsten Meilenstein-Kandidaten, der mehr Wert
   bringt als weitere Sub-Sessions im aktuellen Meilenstein.

Wir können jederzeit **temporär zurückspringen** (z. B. ein dringender
Branchen-Preset wird gewünscht, mitten in Meilenstein 4) – ohne den
aktuellen Meilenstein abzuschließen.

## Quellen-Pflege

Jede Session zitiert ihre Recherche-Quellen im RUN_LOG-Eintrag. Damit
entsteht über die Zeit ein **belegtes Tagebuch** der eingebauten Patterns
– hilfreich für Onboarding neuer Mitwirkender und für spätere Audits.

## Was die alte „Session 1 bis 22"-Liste in `Claude.md` jetzt bedeutet

Die ursprünglichen Session-Beschreibungen in `Claude.md` dienen weiterhin
als **Inhaltsverzeichnis** der Funktionen, die im Produkt erwartet werden.
Sie sind aber nicht mehr 1:1 mit unseren Code-Sessions identisch:

- Sessions 1–12 wurden 1:1 umgesetzt (waren noch im alten Modell).
- Sessions 13+ werden in **mehrere kleinere Code-Sessions** zerlegt.
  Der Bereich „AI Provider Interface und Mock AI" aus dem alten Plan
  („Session 13") entspricht jetzt den Code-Sessions 13–25 in
  Meilenstein 2.
- Wenn ein Funktionsblock vollständig ist, wird im RUN_LOG vermerkt
  „erfüllt durch Code-Sessions 13–25".

So bleibt das Master-Briefing aus `Claude.md` der inhaltliche Anker, ohne
dass wir uns künstlich auf 22 Schritte beschränken.
