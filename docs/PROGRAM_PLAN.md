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
**Status:** ⏳ geplant

Supabase-Schema, Auth (Magic Link, optional OAuth), Repository-Layer
ersetzt die localStorage-Mocks transparent, Storage für Logos und Bilder,
Multi-Tenant-Isolation, Backups.

**Erfolgskriterium:** App läuft mit echter DB, mehrere Nutzer:innen
sehen ausschließlich ihre eigenen Daten, Daten überleben Browser-Wechsel.

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
  (Code-Session 28 ✅): `/api/ai/generate` als Node-Runtime-Route
  mit Bearer-Auth-Stub und Provider-Dropdown im Playground.
  Static-Export skippt die Route via `pageExtensions`-Filter.
  **Folge-Items**:
  - Echte Cookie-/JWT-Auth statt Bearer-Token (mit Session 4-
    Backend).
  - Edge-Runtime-Migration (statt Node) für niedrige Latenz +
    Streaming-Support, sobald Vercel-Deploy steht.
  - Cost-Tracking-Pipeline auf Server-Side (Token-Counts pro Call
    in einem Cost-Bucket loggen).
  - Rate-Limiting per Betrieb-ID (Track B).
  - SSR-Deploy-Setup auf Vercel als zweite Deploy-Pipeline neben
    GitHub Pages.
- **USP-Editor pro Betrieb** (aus Code-Session 27): Die
  Kontext-Box zeigt aktuell „USPs: (noch nicht hinterlegt)".
  Schema und Repository-Layer fehlen — kommt zusammen mit dem
  Settings-Editor in Meilenstein 4. Bis dahin Werte aus
  `business.json` als Mock-Daten ergänzen reicht für die Demos.

### Track B · Security & Compliance
- DOMPurify oder ähnlicher Sanitizer für jeden vom Nutzer übernommenen
  KI-Output, bevor er in einen Public-Site-Block geschrieben wird.
- npm-audit-Lauf in CI, plus monatlicher Auto-Bump-Pass mit
  `npm outdated` + Smoketest.
- DSGVO-Hinweis-Block für die Bewertungs-Anfrage-Versendung
  (Einwilligung, Speicherdauer, Widerruf).
- Rate-Limit auf der KI-Layer (Mock + zukünftig echte Provider) mit
  zentraler Konfiguration und transparenter Fehlermeldung im UI.
- Content-Security-Policy + Subresource-Integrity Header für den
  produktiven Build.
- **API-Key-Hygiene-Audit** (aus Code-Session 21): aktuell wird der
  Key direkt aus `process.env` gelesen. Sobald API-Routes existieren,
  ergänzen wir einen serverseitigen Wrapper, der den Key nie in
  Logs auftauchen lässt (Redaction in Sentry-Integration).
- **Cost-Cap pro Betrieb**: pro Tag/Monat ein Hard-Limit, das vor dem
  OpenAI-Call geprüft wird. Bei Überschreitung wirft die KI-Schicht
  `AIProviderError("rate_limited")` mit eigenem Hinweistext.

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
