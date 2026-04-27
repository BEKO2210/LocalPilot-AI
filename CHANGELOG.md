# Changelog

Alle nennenswerten Änderungen am Projekt werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung an [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Geplant (Meilenstein 2 – KI-Schicht)
- **Code-Session 27: KI-Assistent-Playground-UI** — Tab-/Karten-
  Picker für alle 7 Methoden, clientseitiger Mock-Aufruf,
  Copy-to-Clipboard, Provider-Auswahl-Badge. Damit endlich auch
  visuell sichtbar, was die Schicht kann.
- Code-Sessions 28+: Cost-Tracking + Rate-Limit-UI, AI-API-Route
  hinter Auth (für echte Live-Provider-Calls aus dem UI),
  DOMPurify-Sanitizer auf übernommene KI-Outputs.

### Self-Extending Backlog
Code-Session 26 hat 1 neues Item in `docs/PROGRAM_PLAN.md` ergänzt
(Track A: Gemini Context Caching aktivieren — eigene
`caches.create(...)`-API mit TTL-Tracking + Cost-Bucket pro
Branche/Variant, lohnt sich ab größerem Volumen).

## [0.15.6] – Code-Session 26 – 2026-04-27

### Added
- **Gemini-Provider erste Live-Methode**: `generateWebsiteCopy`
  ist jetzt scharf. Damit haben **alle drei externen Live-Provider**
  (OpenAI, Anthropic, Gemini) mindestens eine scharfe Methode.
  Ohne `GEMINI_API_KEY` fällt der Resolver weiterhin defensiv auf
  den Mock-Provider zurück.
  - `src/core/ai/providers/gemini/_client.ts` (neu) — gemeinsamer
    Client-Builder + Error-Mapper für alle zukünftigen Gemini-
    Methoden:
    - `getGeminiApiKey(opts?)` mit defensivem Vor-Check, wirft
      `AIProviderError("no_api_key")`.
    - `getGeminiModel(opts?)` liest `GEMINI_MODEL` aus der ENV,
      Default `gemini-2.0-flash`.
    - `buildGeminiClient(opts?)` instanziiert `GoogleGenAI`.
    - `mapGeminiError(err)` mappt SDK-`ApiError` über HTTP-Status:
      401/403 → `no_api_key`, 429 → `rate_limited`,
      5xx → `provider_unavailable`, 400 → `invalid_input`.
  - `src/core/ai/providers/gemini/website-copy.ts` (neu) —
    `geminiGenerateWebsiteCopy(input)`:
    - **Structured Output via `responseJsonSchema`** + `responseMimeType:
      "application/json"`. Gemini hat seit v1.x ein natives JSON-
      Schema-Feld (kein Tool-Use-Workaround wie bei Anthropic, kein
      Helper-Modul wie bei OpenAI).
    - **Property-Reihenfolge im Schema = Reihenfolge im Prompt**:
      laut 2026-Best-Practices kann eine Mismatch-Reihenfolge das
      Modell verwirren und zu malformed Output führen. Wir nennen
      die Felder in beiden Stellen in derselben Reihenfolge.
    - Identische Stilrichtlinien wie OpenAI/Anthropic-Provider —
      Tonalitäts-Konsistenz beim Provider-Wechsel.
    - JSON-Parse + `WebsiteCopyOutputSchema.parse` als doppelte
      Validierung.
    - **Kein Caching in dieser Iteration**: Gemini-Caching geht
      über die separate `caches.create(...)`-API und lohnt sich
      erst ab größerem Volumen. Auf Roadmap.
- `src/core/ai/providers/gemini-provider.ts`: komponiert nun den
  Stub mit der scharfen Methode. 6 weitere Methoden bleiben Stub.
- Smoketest `src/tests/ai-gemini-provider.test.ts` (neu) mit zwei
  Modi (analog zu OpenAI/Anthropic-Smoketests):
  - **Strukturell** (12 Asserts, immer aktiv): Provider-Key, alle 7
    Methoden sind Funktionen, ohne Key → `no_api_key` vor Netzwerk-
    Call, ungültiges Input → `invalid_input`, Resolver mit Key →
    gemini, übrige 6 Methoden werfen `provider_unavailable`.
  - **Live** (opt-in via `LP_TEST_GEMINI_LIVE=1` +
    `GEMINI_API_KEY`): echter Call, Output gegen
    `WebsiteCopyOutputSchema` validiert.

### Dependencies
- **`@google/genai@^1`** als dritte (und damit letzte) externe
  AI-SDK-Dependency hinzugefügt. Modernes SDK; das deprecate
  `@google/generative-ai` wäre die Alternative gewesen, aber
  Google bewegt sich in Richtung `@google/genai`. Optionale
  peer-dep auf `@modelcontextprotocol/sdk` wird von uns nicht
  installiert (nicht benötigt).
- Bundle bleibt **unverändert bei 102 KB** — Tree-Shaking räumt
  alle drei AI-SDKs sauber aus dem Client-Bundle.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu Gemini Structured
  Output (`responseJsonSchema`, `propertyOrdering`,
  Komplexitäts-Limits) im RUN_LOG-Eintrag „Code-Session 26".
- **Keine UI-Änderung**, keine API-Route. Diff ~22 KB Code, ~5 KB
  Test, ~3 KB Doku. 3 neue Dateien, 2 geänderte (+ `package.json`/
  `package-lock.json`).
- Alle Verifikationen grün: `typecheck`, `lint`, `build:static`,
  alle 6 Smoketests (Mock ~380, Resolver 22, OpenAI 14,
  Anthropic 14, Gemini 12, Themes inkl. Hex-Asserts).

## [0.15.5] – Code-Session 25 (UI-Patch) – 2026-04-27

### Fixed
- **`/dashboard/[slug]/ai`-Stub auf echten Stand aktualisiert**.
  Die generische `ComingSoonSection` mit „Folgt in Session 13"
  und „Provider-Adapter für Mock, OpenAI, Anthropic und Gemini"
  als Zukunfts-Versprechen wurde durch eine ehrliche Status-Seite
  ersetzt:
  - Header-Badge: **„Backend bereit · UI in Session 27"**.
  - **Provider-Status-Tabelle** mit 7 Methoden × 4 Provider
    (Mock, OpenAI, Anthropic, Gemini), Checkmark/Clock-Icons.
    Reflektiert den tatsächlichen Stand (Mock: alle 7 scharf,
    OpenAI/Anthropic: je 2, Gemini: 1 nach Code-Session 26).
  - Beschreibung pro Methode (Variants, Tonalitäten, Plattformen).
  - Paket-Status-Block mit aktualisierter Botschaft („Sobald die
    UI in Code-Session 27 fertig ist…").
  - Empty-State erklärt: Methoden funktionieren headless (siehe
    Smoketests im Repo), Dashboard-UI folgt in Code-Session 27
    als „KI-Assistent-Playground".
- Reine Doku-Seite, keine neue Logik. Erste Live-Sichtbarkeit für
  den Auftraggeber, dass Backend tatsächlich existiert.

### Notes
- Commit `6bed32f` separat von Session-26-Code committed, damit
  der Patch sofort auf GitHub Pages live geht und der Auftraggeber
  den ehrlichen Status sieht, während Session 26 noch läuft.

## [0.15.4] – Code-Session 25 – 2026-04-27

### Added
- **Anthropic-Provider zweite Live-Methode**: `improveServiceDescription`
  ist jetzt scharf. Gleiches Tool-Use-Muster wie
  `generateWebsiteCopy` aus Code-Session 24:
  - `src/core/ai/providers/anthropic/service-description.ts` (neu)
    nutzt den gemeinsamen Client-Builder aus `_client.ts`.
  - **Tool Use** über pseudo-Tool `emit_service_description` mit
    `input_schema` für `shortDescription` (≤ 240) und
    `longDescription` (≤ 2000).
  - **System-Prompt** ist inhaltlich kompatibel mit dem OpenAI-
    Pendant (gleiche Stilrichtlinien, gleiche Längen-Logik pro
    `targetLength`, gleiche `currentDescription`-Polish-Anweisung).
    Ein Provider-Wechsel mitten in der Session-Pipeline erzeugt
    daher keinen Tonalitäts-Bruch.
  - **Prompt-Caching** über `cache_control: { type: "ephemeral" }`
    auf System-Prompt **und** Tool-Definition (5 min TTL,
    ~90 % Token-Rabatt bei Hit).
  - **Doppelte Validierung** durch
    `ServiceDescriptionOutputSchema.parse` auf `tool_use.input`.
- `src/core/ai/providers/anthropic-provider.ts` komponiert jetzt
  zwei Live-Methoden + Stub für die übrigen 5.
- Smoketest `src/tests/ai-anthropic-provider.test.ts` erweitert
  (~14 strukturelle Asserts, +2 vs. Session 24, Stub-Assert für
  `improveServiceDescription` entfernt):
  - `improveServiceDescription` ohne Key → `no_api_key`.
  - `improveServiceDescription` mit zu kurzem `serviceTitle` →
    `invalid_input`.
  - Live-Block ergänzt einen zweiten Live-Call gegen
    `improveServiceDescription` mit `targetLength=long`.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu Anthropic
  Multi-Field Tool Use und Polish-existing-Text-Patterns im
  RUN_LOG-Eintrag „Code-Session 25". Auch dokumentiert: Anthropic
  hat 2026 `output_config.format` (Constrained Sampling) als
  natives Strukturierungs-Pattern eingeführt — Tool-Use bleibt
  unterstützt, eine Migration kommt auf den Backlog (Track D).
- **Kein UI-Diff**, keine neuen Dependencies. Bundle bleibt 102 KB.
- Diff ~12 KB Code, ~2 KB Test, ~3 KB Doku. 1 neue Datei, 3
  geänderte. Alle Verifikationen grün (typecheck, lint,
  build:static, alle 5 Smoketests).

## [0.15.3] – Code-Session 24 – 2026-04-27

### Added
- **Anthropic-Provider erste Live-Methode**: `generateWebsiteCopy`
  ist jetzt scharf. Ohne `ANTHROPIC_API_KEY` fällt der Resolver
  weiterhin defensiv auf den Mock-Provider zurück.
  - `src/core/ai/providers/anthropic/_client.ts` (neu) — gemeinsamer
    Client-Builder + Error-Mapper für alle zukünftigen Anthropic-
    Methoden:
    - `getAnthropicApiKey(opts?)` mit defensivem Vor-Check, wirft
      `AIProviderError("no_api_key")` mit deutscher Nachricht.
    - `getAnthropicModel(opts?)` liest `ANTHROPIC_MODEL` aus der
      ENV, Default `claude-sonnet-4-5`.
    - `buildAnthropicClient(opts?)` setzt `maxRetries: 2`.
    - `mapAnthropicError(err)` mappt SDK-Klassen direkt:
      `AuthenticationError`/`PermissionDeniedError` → `no_api_key`,
      `RateLimitError` → `rate_limited`,
      `InternalServerError` → `provider_unavailable`,
      `BadRequestError`/`UnprocessableEntityError` → `invalid_input`.
  - `src/core/ai/providers/anthropic/website-copy.ts` (neu) —
    `anthropicGenerateWebsiteCopy(input)`:
    - **Tool Use als Strukturierungs-Vehikel** statt Free-Text-JSON.
      Pseudo-Tool `emit_website_copy` mit `input_schema`, dessen
      Properties exakt unserem `WebsiteCopyOutputSchema` entsprechen.
      `tool_choice: { type: "tool", name: ... }` zwingt das Modell,
      das Tool aufzurufen.
    - **Prompt-Caching** via `cache_control: { type: "ephemeral" }`
      auf System-Prompt **und** Tool-Definition (5-min-TTL,
      ≥ 1024 Tokens pro Block, ~90 % Token-Rabatt bei Hit).
    - **Identische Stilrichtlinien wie OpenAI-Provider** im
      System-Prompt, damit ein späterer Provider-Wechsel keinen
      Tonalitäts-Bruch erzeugt.
    - **Doppelte Validierung**: `tool_use.input` (typisch `unknown`
      aus SDK-Sicht) wird durch `WebsiteCopyOutputSchema.parse`
      gejagt.
- `src/core/ai/providers/anthropic-provider.ts`: komponiert nun den
  Stub mit der scharfen Methode. 6 weitere Methoden bleiben Stub.
- Smoketest `src/tests/ai-anthropic-provider.test.ts` (neu) mit
  zwei Modi (analog zum OpenAI-Smoketest):
  - **Strukturell** (12 Asserts, immer aktiv): Provider-Key, alle 7
    Methoden sind Funktionen, ohne Key → `no_api_key` vor Netzwerk-
    Call, ungültiges Input → `invalid_input`, Resolver mit Key →
    anthropic, übrige 6 Methoden werfen `provider_unavailable`.
  - **Live** (opt-in via `LP_TEST_ANTHROPIC_LIVE=1` +
    `ANTHROPIC_API_KEY`): echter Call, Output gegen
    `WebsiteCopyOutputSchema` validiert.

### Dependencies
- **`@anthropic-ai/sdk@^0.62.0`** als zweite externe AI-SDK-
  Dependency hinzugefügt. Version 0.62 statt aktuelle 0.91, weil
  v0.63+ als Peer-Dep `zod ^3.25` verlangt — wir bleiben bei
  `zod 3.24.1` (gleiche Logik wie beim OpenAI-Bump auf v5 in
  Code-Session 21). Eine spätere DX-Session bündelt den Zod-Bump
  mit beiden SDK-Updates.
- Bundle bleibt **unverändert bei 102 KB** — Anthropic-SDK ist
  pure Server-Side, Tree-Shaking funktioniert sauber.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu Anthropic-Tool-Use,
  ephemerem Prompt-Caching (5 min TTL, ≥ 1024 Tokens, 90 % Rabatt)
  und SDK-Error-Klassen im RUN_LOG-Eintrag „Code-Session 24".
- **Keine UI-Änderung**, keine API-Route. Diff ~22 KB Code, ~5 KB
  Test, ~3 KB Doku. 3 neue Dateien, 2 geänderte (+ `package.json`/
  `package-lock.json`).
- Alle Verifikationen grün: `typecheck`, `lint`, `build:static`,
  alle vier Smoketests (Mock ~380, Resolver 22, OpenAI 14,
  Anthropic 12).

## [0.15.2] – Code-Session 23 – 2026-04-27 (Maintenance)

### Fixed
- **Business-Editor-Crash bei unvollständigem Hex** behoben.
  Reproduktion: Im Dashboard `/dashboard/<slug>/business` tippt der
  Nutzer in eines der Farb-Override-Felder. Während des Tippens
  enthält das Feld kurzzeitig einen unvollständigen Wert wie `#`,
  `#1` oder `#1f`. Die Live-Vorschau hört über `useWatch` auf jeden
  Tastendruck, reicht den Zwischen-Wert direkt an `themeToCssVars`
  → `hexToRgbTriplet` warf → React rendert die Fehler-Boundary
  („Application error: a client-side exception has occurred").
  Besonders auf Mobile durch Auto-Vervollständigung sofort
  triggerbar.

  **Fix in zwei Lagen** (defense in depth):
  1. `business-edit-preview.tsx`: `applyColorOverrides` validiert
     den Wert per Hex-Regex, bevor er das Theme überschreibt. Bei
     ungültigem Wert bleibt die Basis-Farbe stehen — die Vorschau
     sieht „eine Tippstelle lang" unverändert aus statt zu sterben.
  2. `theme-resolver.ts`: `hexToRgbTriplet` wirft nicht mehr.
     Stattdessen Fallback-Triplet `"0 0 0"` + `console.warn`. Falls
     irgendwo anders ein Theme-Override durchschlüpft, crasht React
     trotzdem nicht mehr.
- `src/tests/themes.test.ts` entsprechend angepasst: invalides Hex
  liefert Fallback statt zu werfen. 3 neue Asserts (`not-a-hex`,
  `#`, `#1f`).

### Notes
- Reine Maintenance-Session — kein Feature, keine neue Recherche
  über die existierenden Recherche-Quellen hinaus, keine
  Roadmap-Erweiterung.
- Diff ~3 KB. Alle Verifikationen grün.

## [0.15.1] – Code-Session 22 – 2026-04-27

### Added
- **OpenAI-Provider zweite Live-Methode**: `improveServiceDescription`
  ist jetzt scharf. Gleiches Muster wie Code-Session 21:
  - `src/core/ai/providers/openai/service-description.ts` (neu)
    nutzt den gemeinsamen Client-Builder aus `_client.ts` mit
    Structured Outputs via
    `zodResponseFormat(ServiceDescriptionOutputSchema, "service_description")`.
  - **System-Prompt** (~1.500 Token, cache-tauglich) mit Role-
    Prompting, expliziten Längen-Regeln pro `targetLength`
    (short/medium/long), USP-Würdigung und Fallback-Verhalten
    bei sinnlosem Input.
  - **Saatzeilen-Strategie**: bestehende `currentDescription` wird
    als Saat an das Modell übergeben mit der expliziten Anweisung
    „polieren, nicht komplett neu schreiben". Damit bleibt die
    Stimme des Betriebs erhalten.
  - **`prompt_cache_key`** = `lp:service-desc:${industryKey}:${targetLength}`
    bündelt Calls über alle Betriebe einer Branche mit gleicher
    Längen-Stufe (90 % Token-Rabatt nach OpenAI-Recherche).
  - **Doppelte Validierung** durch `ServiceDescriptionOutputSchema.parse`
    nach SDK-`parsed`-Output.
- `src/core/ai/providers/openai-provider.ts` komponiert jetzt zwei
  Live-Methoden + Stub für die übrigen 5.
- Smoketest `src/tests/ai-openai-provider.test.ts` erweitert
  (~14 Strukturelle Assertions, +2 Stub-Asserts entfernt):
  - `improveServiceDescription` ohne Key → `no_api_key`.
  - `improveServiceDescription` mit zu kurzem `serviceTitle` →
    `invalid_input`.
  - Stub-Assert für `improveServiceDescription` entfernt — die
    Methode ist jetzt scharf.
  - Live-Mode-Block ergänzt einen zweiten Live-Call gegen
    `improveServiceDescription` mit `targetLength=long`.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu Role-Prompting für
  Service-Pages, 2026-Local-SEO-Empfehlungen (250 Wörter,
  Service + Service-Area + Why-Choose-Us) und Prompt-Template-
  Strukturen im RUN_LOG-Eintrag „Code-Session 22".
- **Kein UI-Diff**, keine neuen Dependencies — der Helper aus
  Code-Session 21 trägt sauber durch. Bundle bleibt 102 KB.
- Diff ~12 KB Code, ~2 KB Test, ~3 KB Doku. 1 neue Datei, 3
  geänderte. Alle Verifikationen grün.

## [0.15.0] – Code-Session 21 – 2026-04-27

### Added
- **OpenAI-Provider erste Live-Methode**: `generateWebsiteCopy` ist
  jetzt scharf. Ohne `OPENAI_API_KEY` fällt der Resolver weiterhin
  defensiv auf den Mock-Provider zurück, mit Key wird tatsächlich
  OpenAI angesprochen.
  - `src/core/ai/providers/openai/_client.ts` (neu) — gemeinsamer
    Client-Builder + Error-Mapper:
    - `getOpenAIApiKey(opts?)` mit defensiver Vor-Prüfung; ohne Key
      → `AIProviderError("no_api_key")` mit deutschsprachiger
      Nachricht.
    - `getOpenAIModel(opts?)` liest `OPENAI_MODEL` aus der ENV,
      Default ist `gpt-4o-mini` (günstig, strukturierte Outputs,
      schnell).
    - `buildOpenAIClient(opts?)` setzt `maxRetries: 2`, sodass
      429-Fehler automatisch mit exponential Backoff wiederholt
      werden (SDK-Default).
    - `mapOpenAIError(err)` mappt SDK-Fehler auf `AIErrorCode`:
      401/403 → `no_api_key`, 429 → `rate_limited`,
      5xx → `provider_unavailable`, 400 → `invalid_input`,
      sonst → `unknown`.
  - `src/core/ai/providers/openai/website-copy.ts` (neu) —
    `openaiGenerateWebsiteCopy(input)`:
    - **Structured Outputs** via `zodResponseFormat(WebsiteCopyOutputSchema,
      "website_copy")` aus `openai/helpers/zod`. Strict-JSON-Schema
      verhindert Halluzinationen, das SDK parst direkt nach
      Zod-Typ.
    - **Statischer System-Prompt** mit Stilrichtlinien (deutsch,
      keine Superlative, USPs würdigen, Fallback-Verhalten bei
      sinnlosem Input). Prompt-Caching greift automatisch ab
      ≥ 1024 Tokens.
    - **`prompt_cache_key`** pro `(industryKey, variant)` — ermöglicht
      Cache-Hits über mehrere Betriebe der gleichen Branche +
      Variante hinweg (90 % Token-Rabatt, ~80 % weniger Latenz
      laut OpenAI).
    - **User-Prompt** baut Branchen-Kontext, Tonalität, USPs,
      Variant und optionalen Hint zusammen.
    - **Doppelte Validierung**: SDK-`parsed`-Output wird
      zusätzlich durch `WebsiteCopyOutputSchema.parse` gejagt,
      bevor er zurückgegeben wird.
- `src/core/ai/providers/openai-provider.ts`: komponiert nun den
  Stub mit der neuen Live-Methode (`{ ...stub, generateWebsiteCopy }`).
  Die übrigen 6 Methoden bleiben Stubs und werfen
  `provider_unavailable`.
- Smoketest `src/tests/ai-openai-provider.test.ts` (neu) mit zwei
  Modi:
  - **Strukturell** (immer ausgeführt, kein Netzwerk): 12 Assertions
    — Provider-Key + alle 7 Methoden sind Funktionen, ohne Key →
    `no_api_key` (vor Netzwerk-Call), ungültiges Input →
    `invalid_input`, Resolver routet mit Key auf openai, übrige 6
    Methoden werfen `provider_unavailable`.
  - **Live** (opt-in via `LP_TEST_OPENAI_LIVE=1` + `OPENAI_API_KEY`):
    echter API-Call mit Hairdresser-Hero-Input, Output gegen
    `WebsiteCopyOutputSchema` validiert.

### Dependencies
- **`openai@^5`** als erste externe AI-SDK-Dependency hinzugefügt.
  Version 5 statt 6, weil OpenAI-SDK v6 als peer-dep
  `zod ^3.25 || ^4` verlangt — wir bleiben bei `zod 3.24.1`
  (Konsistenz mit React-Hook-Form + bestehenden Schemas). Bump
  auf v6 wird in einer separaten DX-Session geprüft, sobald wir
  Anthropic ergänzen und sowieso einen Dependency-Audit fahren.
- `node_modules/openai` wird in Client-Bundle **nicht** mit-
  gepackt (Tree-Shaking funktioniert sauber, First-Load-JS bleibt
  bei 102 KB).

### Notes
- **Recherche** (Session-Protokoll): Quellen zu 2026-Patterns für
  OpenAI Structured Outputs, Prompt-Caching (statisches zuerst,
  variables zuletzt; ≥ 1024 Token automatisch; `prompt_cache_key`
  für Routing) und Error-Handling (429-Auto-Retry im SDK,
  selektives Re-Throw bei 401/5xx) im RUN_LOG-Eintrag
  „Code-Session 21".
- **Keine UI-Änderung**, keine API-Route, kein Cost-Tracking — die
  scharfe OpenAI-Methode ist serverseitig isoliert verwendbar.
  Dashboard-Integration kommt in einer späteren Session.
- Diff ~25 KB Code, ~3 KB Test, ~5 KB Doku. 4 neue Dateien, 2
  geänderte Dateien (+ `package.json` / `package-lock.json` durch
  Dependency-Install).
- Alle Verifikationen grün: `typecheck`, `lint`, `build:static`,
  alle drei Smoketests.

## [0.14.0] – Code-Session 20 – 2026-04-27

### Added
- **Mock-Provider `generateOfferCampaign` ist scharf** — letzte von
  sieben Mock-Methoden. Damit ist die **Mock-Phase abgeschlossen**:
  alle 7 Methoden des `AIProvider`-Interfaces sind deterministisch
  belegt.
  - `src/core/ai/providers/mock/offer-campaign.ts` (neu):
    - `headline` ≤ 120 — `${offerTitle} — bei ${businessName}`.
    - `subline` ≤ 280 — Branchen-Label + Stadt + Tonalität, ohne
      Superlative.
    - `bodyText` ≤ 2000 — bis zu 3 Absätze (Inhalt + USP-Trust-Block
      + optionaler „Gültig bis …"-Hinweis, wenn `validUntil`
      mitkommt).
    - `cta` ≤ 120 — zeit-orientiert: `Jetzt sichern — gültig bis …`
      mit `validUntil`, `Jetzt unverbindlich anfragen.` ohne.
    - Saatzeile aus `details` (≥ 10 Zeichen) wird übernommen,
      sonst generischer Lückentext mit Branchen-Label.
    - 2026-Recherche zu Limited-Time-Offers berücksichtigt: echte
      Knappheit (nur wenn `validUntil`), Kunden-Nutzen vor Druck,
      keine „letzte Chance"-Floskeln.
- `src/core/ai/providers/mock-provider.ts`: alle 7 Methoden
  komponiert. Status-Header: **Mock-Phase abgeschlossen**.
- Smoketest `src/tests/ai-mock-provider.test.ts` um Block 12a–12i
  erweitert (~30 zusätzliche Assertions, ~380 gesamt):
  Längen-Checks, Wirkung von `validUntil` auf Body+CTA,
  neutraler CTA ohne `validUntil`, Headline mit offerTitle+
  businessName, Subline mit city+industryLabel, `details` als
  Saatzeile, USPs als Trust-Bullets, Determinismus, zu kurzer
  `offerTitle` → `invalid_input`. **Block 13 prüft, dass alle 7
  Mock-Methoden Funktionen sind** (keine verbleibenden Stubs).
  Helper `expectUnavailable` entfernt — wird durch keinen Test mehr
  benötigt.

### Changed
- **README.md komplett überarbeitet** — selbst-tragendes
  Roadmap-Konzept (rolling, kein Endpunkt). Konkret:
  - Hero mit 9 Badges (Status, Methodology, No-Endpoint, Next.js,
    TypeScript, Tailwind, Zod, License, Built-for).
  - Programm-Konzept-Sektion erklärt, **warum es kein „fertig"
    gibt** — und warum die README sich praktisch nicht mehr ändern
    muss: Konkrete Session-Nummern stehen nur noch in CHANGELOG/
    RUN_LOG, nicht im README.
  - Rollende Status-Tabelle mit allen 7 Meilensteinen.
  - Neue „Mitwirkende & Verantwortlichkeiten"-Tabelle
    (Claude · Codex · Auftraggeber).
  - Veraltete „Status nach Session 3"-Liste entfernt.
- `docs/PROGRAM_PLAN.md` Meilenstein-2-Block aktualisiert
  (Mock-Phase abgeschlossen, Live-Provider-Phase startet) und um
  4 neue Backlog-Items in Tracks A/F/**G (neu)** erweitert.

### Added (Methodik · Codex-Junior-Workflow)
- **`codex.md`** (neu) — verbindlicher Verhaltenskodex für Codex
  als Junior-Mitarbeiter:
  - Harte Boundaries (NEVER-Zone): `Claude.md`,
    `docs/PROGRAM_PLAN.md`, `docs/SESSION_PROTOCOL.md`, `codex.md`
    selbst, alle Schemas, Provider-Code, Pricing, Industries,
    Themes, Tooling-Configs, CI/CD.
  - Komfortzone: Tippfehler, JSDoc, Trailing-Newlines, aria-labels
    auf Icon-Only-Buttons, alt-Texte in Demo-Daten,
    Charakterisierungs-Tests (nur ergänzend).
  - Workflow: eigener `codex/<slug>`-Branch, Diff-Cap 20 KB / 8
    Dateien, Pflicht-Verifikation (typecheck/lint/build/smoketests),
    Commit-Format `chore(codex): …` mit Footer
    `codex-backlog: #N`, kein Auto-Merge.
  - 10 Abschnitte mit Tag-für-Tag-Spickzettel, Eskalations-
    Kriterien, Konsequenzen bei Verstößen.
- **`docs/CODEX_BACKLOG.md`** (neu) — vorab freigegebene Junior-
  Aufgaben mit Status (`[pre-approved]`, `[in-progress]`, `[done]`,
  `[needs-review]`, `[blocked]`). 9 Starter-Einträge:
  1. JSDoc für `clamp`-Helper sammeln (alle 6 Mock-Files).
  2. Tippfehler-Pass durch Marketing-Sektionen.
  3. `aria-label` an Icon-Only-Buttons.
  4. Trailing-Newline in allen Quelldateien.
  5. `alt`-Texte in Demo-Daten.
  6. **`[blocked]`** Prettier-Plugin-Tailwind aktivieren (Prettier
     ist noch nicht eingeführt).
  7. Glossar `docs/GLOSSARY.md` anlegen.
  8. Konsistente deutsche Anführungszeichen in Doku.
  9. README-Tippfehler nachpflegen.
- **`docs/CODEX_LOG.md`** (neu) — append-only-Tagebuch für
  Codex-Sessions mit striktem Format. Ermöglicht Claude beim
  Reinkommen sofort einen Überblick, was Codex zwischendurch gemacht
  hat.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu 2026-Limited-Time-
  Offer-Mustern (echte Knappheit, klare Deadline, Kunden-Nutzen)
  im RUN_LOG-Eintrag „Code-Session 20".
- **Doppel-Schritt-Session**: Code (Session 20) + drei
  Methodik-Dokumente (README, codex.md, Codex-Backlog/Log) +
  Roadmap-Selbstaktualisierung. Der Diff ist deshalb größer als
  sonst (~70 KB).
- 5 neue Dateien (`mock/offer-campaign.ts`, `codex.md`,
  `docs/CODEX_BACKLOG.md`, `docs/CODEX_LOG.md`,
  `mock-provider.ts` Bonus-Header), 4 geänderte Dateien.
  Alle Verifikationen grün (`typecheck`, `lint`, `build:static`,
  beide Smoketests, ~380 Assertions).

## [0.13.7] – Code-Session 19 – 2026-04-27

### Added
- **Mock-Provider `generateSocialPost` ist scharf** (sechste von
  sieben Mock-Methoden — atomarer Schritt unter dem
  Session-Protokoll):
  - `src/core/ai/providers/mock/social-post.ts` — deterministische
    Implementierung. Erzeugt für jede Plattform/Goal/Length-Kombi
    einen vollständigen `SocialPostOutput`.
  - **Saatzeile**: Preset-Match in `preset.socialPostPrompts` auf
    `goal` (Plattform-Match bevorzugt). `ideaShort` wird als
    Inhalts-Saat genutzt; ohne Match greift ein goal-spezifisches
    Default-Pattern (`more_appointments`, `promote_offer`,
    `new_service`, `collect_review`, `seasonal`, `before_after`,
    `trust_building`, `team_intro`).
  - **Plattform-Stilhinweise** (`platformFlavor`):
    LinkedIn formal-fachlich, Google-Business sachlich-Eckdaten,
    Facebook hinter-den-Kulissen, Instagram visuell-Moment,
    WhatsApp-Status Stammkund:innen-Update.
  - **Hashtag-Pattern nach Plattform** (2026-Recherche):
    Instagram 5, LinkedIn 4, Facebook 2, Google-Business 0,
    WhatsApp-Status 0. Pool: hyperlokal (`#Bremen`,
    `#LokalBremen`) + Branche (`#Friseur`) + Betrieb
    (`#SalonSophia`) + Topic-Wort + Community
    (`#KleineBetriebe`, `#Empfehlung`, `#Lokal`). `tagify`
    macht NFKD-bereinigte Slugs. `includeHashtags=false` →
    leeres Array.
  - **CTA**: goal-spezifisch, deutsch, knapp, ohne Superlative
    (≤ 160 Zeichen).
  - **`shortPost`** ≤ 280 Zeichen (Saatzeile + CTA).
  - **`longPost`** je nach `length`:
    - `short`: Saat + CTA (~2 Absätze).
    - `medium`: Saat + Plattform-Flavor + CTA (~3 Absätze).
    - `long`: Saat + Plattform-Flavor + USP-Trust-Block (Bullets
      aus `context.uniqueSellingPoints`, max. 3) + CTA (~4
      Absätze).
  - **`imageIdea`**: aus `preset.imageGuidance.recommendedSubjects`
    + Topic, mit Stilhinweis „Natürliches Licht, kein Stockfoto-
    Stil".
  - Output gegen `SocialPostOutputSchema` validiert; `clamp` als
    Sicherheitsnetz.
- `mock-provider.ts` komponiert die sechste Methode dazu
  (`{ ...stub, generateWebsiteCopy, improveServiceDescription,
  generateFaqs, generateCustomerReply, generateReviewRequest,
  generateSocialPost }`). Nur noch `generateOfferCampaign`
  bleibt Stub.
- Smoketest `src/tests/ai-mock-provider.test.ts` um Block 11a–11k
  erweitert (~220 zusätzliche Assertions, ~350 gesamt):
  5 Plattformen × 8 Goals = 40 Kombinationen mit je 6 Längen-Checks,
  plattform-spezifische Hashtag-Anzahlen (3–5 / 1–2 / 0 / 3–5 / 0),
  `includeHashtags=false`, hyperlokales+industry-Hashtag-Pattern,
  Tag-Eindeutigkeit, goal-abhängiger CTA, `longPost` wächst
  monoton mit `length`, USPs im long-Trust-Block, Preset-Match
  (`trust_building` → „Team"), `imageIdea` referenziert Topic,
  Determinismus, zu kurzes Topic → `invalid_input`. Block 12
  zählt nur noch 1 Stub-Methode.

### Changed (Roadmap-Selbstaktualisierung)
- `docs/PROGRAM_PLAN.md` um 4 neue Punkte erweitert (Tracks A, D, E):
  - Track A: Social-Media-Forwarding (Buffer/Hootsuite/Meta-Graph),
    Visual-Companion für `imageIdea`.
  - Track D: `clamp` nun 5× dupliziert, `tagify`/`normalizeQuestion`
    teilen NFKD-Logik, Smoketest auf >900 Zeilen.
  - Track E: dedizierte `socialPostPrompts` für alle 8 Goals pro
    Branche (Synthese springt aktuell zu oft ein).

### Notes
- **Recherche** (Session-Protokoll): Quellen zu 2026-Hashtag-Patterns
  (Instagram 3–5, Facebook 1–2, LinkedIn 3–5, GBP keine, hyperlokal
  + Branche + Community) im RUN_LOG-Eintrag „Code-Session 19".
- Diff ~30 KB. 1 neue Datei Code, 4 geänderte. Alle Verifikationen
  grün (`typecheck`, `lint`, `build:static`, beide Smoketests).

## [0.13.6] – Code-Session 18 – 2026-04-27

### Added
- **Mock-Provider `generateReviewRequest` ist scharf** (fünfte von
  sieben Mock-Methoden — atomarer Schritt unter dem
  Session-Protokoll):
  - `src/core/ai/providers/mock/review-request.ts` —
    deterministische Implementierung. Liefert pro Aufruf 3 Varianten
    für den angefragten Channel: requested-Tone an Index 0, dann
    die zwei übrigen in kanonischer Reihenfolge (`short`, `friendly`,
    `follow_up`).
  - **Quellen-Strategie** je Variante:
    1. Match in `preset.reviewRequestTemplates` auf
       `(channel, tone)` → diese Vorlage wird verwendet.
    2. Synthese über eine Channel-Tone-Matrix:
       - **whatsapp**: kurz/locker, dezentes Emoji nur in `friendly`.
       - **sms**: sehr kurz, kein Emoji, klar.
       - **email**: längere Form, Anrede + Absatz-Struktur.
       - **in_person**: gesprochener Stil mit deutschen
         Anführungszeichen.
  - **Substitution** für `{{customerName}}`, `{{reviewLink}}`,
    `{{businessName}}`. Fehlt `customerName`/`reviewLink`, kommen
    neutrale Platzhalter (`und Hallo` / `[Bewertungs-Link einfügen]`)
    zum Einsatz, die der Anwender vor dem Versand füllt.
  - Output gegen `ReviewRequestOutputSchema` validiert; `clamp` als
    Sicherheitsnetz auf das 1000-Zeichen-Body-Limit.
- `mock-provider.ts` komponiert die fünfte Methode dazu
  (`{ ...stub, generateWebsiteCopy, improveServiceDescription,
  generateFaqs, generateCustomerReply, generateReviewRequest }`).
  Die übrigen 2 Methoden bleiben Stubs.
- Smoketest `src/tests/ai-mock-provider.test.ts` um einen Block
  10a–10h erweitert (~52 zusätzliche Assertions, ~130 gesamt):
  4 Channels × 3 Tones → 3 Varianten/Aufruf, alle im Limit, alle
  drei Tones je Aufruf vertreten, kein Platzhalter-Rest;
  Substitution greift; Fallback-Platzhalter ohne `reviewLink`;
  Preset-Match greift bei (whatsapp, friendly) für Friseur
  („der neue Schnitt"); Synthese greift bei sms (Friseur-Preset
  hat keine sms-Vorlage); in_person hat „…"-Stil; Determinismus;
  ungültige `reviewLink`-URL → `invalid_input`.
  Block 11 zählt jetzt nur noch 2 Stub-Methoden.

### Changed (Programm-Methodik)
- **Roadmap erweitert sich ab sofort selbst.** Ohne weiteres Zutun
  des Auftraggebers. Verbindlich ab Code-Session 18:
  - **`Claude.md`** — neuer Punkt 7 in der Programm-Philosophie
    (Roadmap erweitert sich selbst, jede Session muss
    mindestens einen Punkt zu `PROGRAM_PLAN.md` hinzufügen).
  - **`docs/SESSION_PROTOCOL.md`** — neuer Schritt 6
    „Roadmap-Selbstaktualisierung", Commit/Push wandert auf
    Schritt 7.
  - **`docs/PROGRAM_PLAN.md`** — neue Sektion „Self-Extending
    Backlog" mit 6 Tracks (A: Innovation, B: Security & Compliance,
    C: Observability & Qualität, D: DX & Refactor,
    E: Vertikalisierung, F: Doku & Onboarding). Erste Punkte aus
    Code-Session 18 sind eingetragen.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu 2026-Review-Request-
  Conversion-Rates und Channel-Effektivität (WhatsApp ~98 % Open
  Rate, SMS-Response 45 %, in_person höchste Conversion, single
  Follow-Up verdoppelt Antwort) im RUN_LOG-Eintrag „Code-Session 18".
- **Bewusst klein gehalten**: nur eine zusätzliche Mock-Methode plus
  die Methodik-Erweiterung. Keine UI-Änderung, keine neuen
  Dependencies, kein Bundle-Zuwachs.
- Diff ~30 KB (mehr als sonst, weil zusätzlich 3 Methodik-Doc-
  Dateien aktualisiert wurden), 1 neue Datei Code, 5 geänderte.
  Alle Verifikationen grün (`typecheck`, `lint`, `build:static`,
  beide Smoketests).

## [0.13.5] – Code-Session 17 – 2026-04-27

### Added
- **Mock-Provider `generateCustomerReply` ist scharf** (vierte von
  sieben Mock-Methoden — atomarer Schritt unter dem
  Session-Protokoll):
  - `src/core/ai/providers/mock/customer-reply.ts` –
    deterministische Implementierung mit drei Tonalitäten:
    - **`short`** (1–2 Sätze, formelles „Sie"): „Guten Tag" +
      Themen-Spiegel + nächster Schritt + „Beste Grüße,
      {{businessName}}".
    - **`friendly`** (3–4 Sätze, persönlich, „Sie"): „Hallo" +
      Dank für Mirror + city-Bezug („wir freuen uns, dass Sie sich
      an uns in {{city}} wenden") + nächster Schritt + Einladung
      zur Rückfrage + „Herzliche Grüße, {{businessName}}".
    - **`professional`** (3–4 Sätze, sachlich, „Sie"):
      „Sehr geehrte Damen und Herren" + ausführlicher Dank mit
      Branchenlabel-Bezug + nächster Schritt + Hinweis auf
      Footer-Kontaktwege + „Mit freundlichen Grüßen,
      {{businessName}}".
  - **Themen-Erkennung** über Wortstamm-Regex, Reihenfolge nach
    Häufigkeit und Priorität (Reklamation vor allgemeinem Problem,
    Stornierung vor Termin):
    - Reklamation/Beschwerde → „faire Lösung" zugesagt.
    - Stornierung/Absage → Änderung übernommen.
    - Termin/Buchung → Slots werden geprüft.
    - Angebot/KVA → nachvollziehbares Angebot zugesagt.
    - Preis/Kost → transparente Preisübersicht zugesagt.
    - Öffnung/Sprechzeit → Verweis auf Startseite.
    - Sonst: generischer Fallback („wir melden uns innerhalb eines
      Werktags").
  - **Spiegel-Phrasen** (z. B. „Ihre Terminanfrage", „Ihre
    Frage zu den Preisen") werden in jede Anrede eingewoben, damit
    die Antwort nachweislich auf die Nachricht reagiert.
  - **Positive Sprache** ohne „leider"/„nicht" – entspricht
    aktuellen 2026-Customer-Service-Best-Practices.
  - Output gegen `CustomerReplyOutputSchema` validiert; `clamp`
    schneidet bei überraschend langen Texten auf Wortgrenze.
- `mock-provider.ts` komponiert die vierte Methode dazu
  (`{ ...stub, generateWebsiteCopy, improveServiceDescription,
  generateFaqs, generateCustomerReply }`). Die übrigen 3 Methoden
  bleiben Stubs.
- Smoketest `src/tests/ai-mock-provider.test.ts` um einen
  Block 9a–9k erweitert (~18 zusätzliche Assertions, ~78 gesamt):
  3 Tonalitäten × 2 Branchen mit Längen-Checks, Anreden-Match
  („Guten Tag" / „Hallo" / „Sehr geehrte"), Themen-Tests
  (Preis, Termin, Reklamation vor Termin, Stornierung vor Termin,
  generischer Fallback), city erscheint im friendly-Anschreiben,
  Branchenlabel im professional-Text, Signatur enthält
  `businessName`, Determinismus, leere Nachricht → `invalid_input`.
  Block 10 zählt jetzt nur noch 3 Stub-Methoden.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu 2026-Customer-Service-
  Tone-Mustern und Mirror-/Keyword-Strategien im RUN_LOG-Eintrag
  „Code-Session 17".
- **Bewusst klein gehalten**: nur eine zusätzliche Mock-Methode.
  Keine UI-Änderung, keine neuen Dependencies, kein Bundle-Zuwachs.
  Diff ~14 KB, 1 neue Datei, 2 geänderte. Alle Verifikationen grün
  (`typecheck`, `lint`, `build:static`, beide Smoketests).

## [0.13.4] – Code-Session 16 – 2026-04-27

### Added
- **Mock-Provider `generateFaqs` ist scharf** (dritte von sieben
  Mock-Methoden — atomarer Schritt unter dem Session-Protokoll):
  - `src/core/ai/providers/mock/faqs.ts` – deterministische
    Implementierung mit dreistufiger Quellen-Strategie:
    1. `preset.defaultFaqs` als Saat (branchen-typische Standard-
       fragen, ~4 pro Preset),
    2. aus `topics` abgeleitete Q/A-Paare über Stichwort-Templates
       (Preis, Termin, Öffnungszeiten, Stornierung, Zahlung,
       Anfahrt, Garantie) plus generischer Fallback,
    3. lokale „Sind Sie auch in {{city}} und Umgebung aktiv?"-
       Frage, sobald `city` gesetzt ist und Platz übrig ist.
  - **Deduplizierung** über `normalizeQuestion`: lowercase, NFKD-
    Diakritika entfernt, alles außer Buchstaben/Zahlen entfernt.
    Doppelte Fragen werden verworfen, auch wenn sich Schreibweise
    oder Satzzeichen unterscheiden.
  - Antwort-Längen orientieren sich an aktuellen AEO-/AI-Search-
    Empfehlungen (~30–60 Wörter pro Antwort) und bleiben unter dem
    Schema-Limit. `clamp` schneidet auf Wortgrenze als Sicherheits-
    netz.
  - Output gegen `FaqGenerationOutputSchema` validiert.
- `mock-provider.ts` komponiert die dritte Methode dazu
  (`{ ...stub, generateWebsiteCopy, improveServiceDescription,
  generateFaqs }`). Die übrigen 4 Methoden bleiben Stubs.
- Smoketest `src/tests/ai-mock-provider.test.ts` um einen
  ~15-Assertions-Block für `generateFaqs` erweitert (~60 Assertions
  gesamt): 2 Branchen × 2–3 `count`-Werte mit Längen-Checks,
  Preset-Saatfrage erscheint, Topic „Stornierung"/„Preise" wählen
  spezialisierte Templates, lokale Frage greift mit `city` und
  fehlt ohne, Deduplizierung bei doppelten Topics, `count=1` →
  genau 1 Q/A, Determinismus, `count=0` → `invalid_input`.
  Block für die jetzt nur noch 4 Stub-Methoden entsprechend
  angepasst.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu 2026-FAQ-Schema-
  Best-Practices, AEO-/AI-Search-Patterns und Local-SEO-Q/A-
  Formaten im RUN_LOG-Eintrag „Code-Session 16".
- **Bewusst klein gehalten**: nur eine zusätzliche Mock-Methode.
  Keine UI-Änderung, keine neuen Dependencies, kein Bundle-Zuwachs
  (Mock-Modul bleibt tree-shaken solange noch keine Seite es
  importiert). Diff ~15 KB, 1 neue Datei, 2 geänderte. Alle
  Verifikationen grün (`typecheck`, `lint`, `build:static`,
  beide Smoketests).

## [0.13.3] – Code-Session 15 – 2026-04-27

### Added
- **Mock-Provider `improveServiceDescription` ist scharf** (zweite
  von sieben Mock-Methoden — atomarer Schritt unter dem
  Session-Protokoll):
  - `src/core/ai/providers/mock/service-description.ts` –
    deterministische Implementierung mit Saatzeilen-Strategie:
    1. `currentDescription` (≥ 10 Zeichen) wird poliert übernommen,
    2. sonst sucht ein fuzzy Match in `preset.defaultServices`
       (bidirektionaler Substring) den passenden Service und
       übernimmt dessen `shortDescription`,
    3. letzter Fallback: generische, aber konkrete Zeile aus
       Service-Titel + Tonalität + Betriebsnamen.
  - Kurzversion (`shortDescription`, ≤ 240) ergänzt einen kurzen
    Standort-Hinweis und ist Google-Business-Profile-tauglich
    (lokal verankert, konkret statt superlativ).
  - Langversion (`longDescription`, ≤ 2000) ist je nach
    `targetLength` 1, 2 oder 3 Absätze:
    - „short": Inhalt (Saatzeile + optional Preis/Dauer).
    - „medium": Inhalt + Ablauf (aus `preset.defaultProcessSteps`,
      Fallback generisch).
    - „long": Inhalt + Ablauf + Trust-Block (aus den USPs des
      Betriebs, Fallback nicht-superlativ).
  - `clamp` schneidet auf Wortgrenze, `polish` sorgt für sauberen
    Satzanfang/-abschluss. Output gegen `ServiceDescriptionOutputSchema`
    validiert.
- `mock-provider.ts` komponiert die zweite Methode dazu
  (`{ ...stub, generateWebsiteCopy, improveServiceDescription }`).
  Die übrigen 5 Methoden bleiben Stubs.
- Smoketest `src/tests/ai-mock-provider.test.ts` um einen
  ~15-Assertions-Block für `improveServiceDescription` erweitert
  (~45 Assertions gesamt): 2 Branchen × 3 `targetLength`-Werte,
  long > short, Preset-Match-Saatzeile, City-Hinweis,
  `currentDescription` als Vorrang-Saat, Process-Steps und USPs
  in der long-Variante, Determinismus, `invalid_input` bei zu
  kurzem `serviceTitle`. Block für die jetzt nur noch 5 weiteren
  Methoden mit `provider_unavailable` entsprechend angepasst.

### Notes
- **Recherche** (Session-Protokoll): Quellen zu 2026-Best-Practices
  für Service-Page-Copy (lokal verankert, konkret statt superlativ,
  GBP-tauglich) und deterministische Mock-LLM-Server im RUN_LOG-
  Eintrag „Code-Session 15".
- **Bewusst klein gehalten**: nur eine zusätzliche Mock-Methode.
  Keine UI-Änderung, keine neuen Dependencies, kein Bundle-Zuwachs
  (Mock-Modul bleibt tree-shaken solange noch keine Seite es
  importiert). Diff ~14 KB, 1 neue Datei, 2 geänderte. Alle
  Verifikationen grün (`typecheck`, `lint`, `build:static`,
  beide Smoketests).

## [0.13.2] – Code-Session 14 – 2026-04-27

### Added
- **Mock-Provider `generateWebsiteCopy` ist scharf** (atomarer Schritt
  unter dem neuen Session-Protokoll):
  - `src/core/ai/providers/mock/website-copy.ts` – deterministische
    Implementierung von `mockGenerateWebsiteCopy(input)`. Liest das
    `IndustryPreset` über `getPresetOrFallback`, befüllt
    `heroTitle` / `heroSubtitle` aus den Branchen-Defaults und
    formuliert den `aboutText` aus Tonalität, USPs und Standort.
    Vier Varianten (`hero`, `about`, `services_intro`,
    `benefits_intro`) verändern die Schwerpunktsetzung.
  - `{{city}}`-Platzhalter werden ersetzt, fehlt `city`, greift ein
    neutraler Fallback. `hint` wird als „Ihre Vorgabe: …" an den
    `aboutText` angehängt.
  - Defensive Längenbegrenzung (`clamp` an Wortgrenze) plus
    abschließende Validierung gegen `WebsiteCopyOutputSchema` —
    eine Mock-Antwort kann später keine strengeren Schema-Checks
    brechen.
  - `src/core/ai/providers/mock-provider.ts` komponiert jetzt den
    Stub mit der neuen Methode (`{ ...stub, generateWebsiteCopy }`).
    Die übrigen 6 Methoden bleiben am Stub und werfen weiterhin
    `AIProviderError("provider_unavailable")` mit klarer Nachricht.
- Smoketest `src/tests/ai-mock-provider.test.ts` (~30 Assertions):
  2 Branchen × 4 Varianten → vollständige Outputs, Längen-Limits
  eingehalten, `{{city}}`-Substitution greift, ohne `city` keine
  Template-Reste, USPs/businessName landen im `aboutText`,
  Mock ist deterministisch (zweimal identisch), `hint` wird
  übernommen, ungültiges Input wirft `invalid_input`,
  zu kurzer `businessName` ebenfalls, alle 6 anderen Methoden
  werfen weiterhin `provider_unavailable`, `mockProvider.key === "mock"`.

### Notes
- **Recherche** (Session-Protokoll): siehe RUN_LOG-Eintrag
  „Code-Session 14" für die Quellen zu deterministischen Mock-LLM-
  Providern und template-basierten Lokalbetrieb-Texten 2026.
- **Bewusst klein gehalten**: nur eine von sieben Mock-Methoden. Keine
  UI-Änderung, keine neuen Dependencies, kein Bundle-Zuwachs (Mock-
  Modul wird tree-shaken solange noch keine Seite es importiert).
- Diff-Größe ~16 KB, 2 neue Dateien (`mock/website-copy.ts`, Smoketest),
  1 geänderte Datei (`mock-provider.ts`). Alle Verifikationen grün
  (`typecheck`, `lint`, `build:static`, beide Smoketests).
- Folge-Sessions ergänzen Schritt für Schritt die übrigen 6 Methoden,
  jeweils mit eigenem Smoketest. Roadmap in `docs/PROGRAM_PLAN.md`.

## [0.13.1] – Code-Session 13 – 2026-04-27

### Added
- **AI-Provider-Scaffold** (klein nach neuem Protokoll):
  - `src/core/ai/providers/_stub.ts` – `buildStubProvider(key, message)`-
    Helper, baut einen `AIProvider`, dessen 7 Methoden alle
    `AIProviderError("provider_unavailable")` werfen.
  - `mock-provider.ts`, `openai-provider.ts`, `anthropic-provider.ts`,
    `gemini-provider.ts` – jeweils eine Stub-Instanz mit eigener
    Fehlermeldung („Folgt in Code-Session 14+/21+/23+/später").
  - `src/core/ai/ai-client.ts` mit `getAIProvider(opts?)`-Resolver:
    liest `AI_PROVIDER`, prüft den jeweils nötigen API-Key
    (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`/`GEMINI_API_KEY`), fällt
    defensiv auf `mock` zurück bei jedem Problem (kein Wert, ungültiger
    Wert, leerer Key). Wirft niemals.
  - `describeActiveProvider(opts?)` für Diagnose-Anzeigen
    (welcher Provider würde geladen, mit welchem Grund?).
  - `AI_PROVIDERS`-Lookup-Map exportiert für Tests/Debug.
  - Barrel `src/core/ai/index.ts`.
- Smoketest `src/tests/ai-provider-resolver.test.ts` (~22 Assertions):
  Default → mock, explizit mock, ungültig → mock, jeder Provider ohne
  API-Key → mock, jeder Provider mit Key → korrekt, leerer Key zählt
  als „kein Key", `providerKey`-Argument hat Vorrang vor ENV,
  `AIProviderError` korrekt konstruierbar, `describeActiveProvider`
  gibt sprechende Diagnose-Strings zurück.

### Notes
- **Bewusst NICHT in dieser Session**: konkrete Mock-Texte,
  echte API-Calls, Dashboard-UI, Caching, Cost-Tracking. Folgen
  inkrementell in Code-Sessions 14+ je ein Mini-Schritt.
- Diff-Größe ~30 KB, 7 neue Dateien, keine Source-Datei der UI
  geändert. Bundle bleibt unverändert (~13 prerenderte Routen,
  AI-Modul ist tree-shaken solange noch keine UI es importiert).
- Keine neuen Dependencies. SDKs (`openai`, `@anthropic-ai/sdk`,
  `@google/generative-ai`) ziehen wir erst dann ein, wenn die
  jeweiligen Provider scharf gemacht werden.

Folge-Meilensteine (Engagement, Backend, Production-Readiness,
Vertikalisierung, Innovation Loop) sind in `docs/PROGRAM_PLAN.md`
beschrieben — dieses Programm hat **keinen Endpunkt**.

## [0.13.0] – Methodik-Wechsel (vor Code-Session 13) – 2026-04-27

### Changed
- **Programm-Modell auf rollende Meilensteine umgestellt.**
  Ursprüngliche „22 Sessions, dann fertig"-Sicht ist ersetzt durch ein
  dauerhaftes Programm mit kleineren atomaren Code-Sessions, jeder mit
  Recherche-Step, Tests und Deploy.
- **`Claude.md`** – neuer Abschnitt 0 „PROGRAMM-PHILOSOPHIE" als
  verbindliche Vorgabe vor allen anderen Anweisungen. Abschnitt 22
  („Session-Plan") ist jetzt explizit als Inhaltsverzeichnis (nicht
  Zeitplan) markiert.
- **README.md** – Aktueller-Stand-Block reframt von „Session N von 22"
  auf „Meilenstein N (rollend)" plus Link zu `PROGRAM_PLAN.md` /
  `SESSION_PROTOCOL.md`.

### Added
- **`docs/PROGRAM_PLAN.md`** – 7 Meilensteine (Foundation ✅,
  KI-Schicht 🔄, Engagement, Backend, Production, Vertikalisierung,
  Innovation Loop ♾️). Jeder Meilenstein mit eigenem Erfolgskriterium,
  ohne fixe Session-Anzahl.
- **`docs/SESSION_PROTOCOL.md`** – verbindlicher Ablauf jeder
  Code-Session: Größenbegrenzung (30–80 KB Diff), Recherche-Step
  (WebSearch + Quellen im RUN_LOG), Verifikation (typecheck/lint/build/
  smoke), Doku, Commit. 6 gleichberechtigte Session-Typen (Feature,
  Refactor, Polish, A11y, Performance, Security, DX, Doku, Research).

### Notes
- Recherche-Quellen, die diesen Wechsel motiviert haben, im RUN_LOG-
  Eintrag „Methodik-Wechsel" mit Markdown-Links zitiert.
- Kein Code-Diff im Produkt selbst – die Änderung ist organisatorisch.
  Build/Typecheck/Lint bleiben grün, weil keine Source-Datei berührt
  wurde.

## [0.12.0] – Session 12 – 2026-04-27

## [0.12.0] – Session 12 – 2026-04-27

### Added
- **Public-Site-Anfrageformular** ist jetzt **interaktiv**
  (`<PublicLeadForm>`). Felder kommen aus `preset.leadFormFields` der
  jeweiligen Branche, manuelle Validierung deckt Pflichtfelder, E-Mail-
  Format, Telefon-Mindestlänge und die Geschäftsregel „Telefon ODER
  E-Mail" ab. Eingehende Leads werden via `appendLead` in den Browser-
  Storage geschrieben; nach erfolgreichem Submit zeigt das Formular einen
  Bestätigungs-Block mit „Weitere Anfrage senden"-Button.
- **Dashboard `/dashboard/[slug]/leads`** zeigt jetzt `<LeadsView>` mit:
  - Status-Filter-Pills (Alle, Neu, Kontaktiert, Qualifiziert, Gewonnen,
    Verloren, Archiviert) inkl. Live-Counter pro Status,
  - Volltextsuche über Name, Telefon, E-Mail, Nachricht,
  - Listen-/Detail-Layout (Listen-Click öffnet Detail-Pane in der
    Sidebar bzw. unter der Liste auf Mobile),
  - Direktkontakt-Buttons (`tel:`, `wa.me`, `mailto:`), Status-Pill-
    Buttons (Wechsel mit einem Klick), Notizen-Textarea mit
    Speichern/Verwerfen,
  - 3 Antwort-Vorlagen (kurz, freundlich, Detail) mit Copy-to-Clipboard
    und Live-Vorschau bereits aufgelöster Platzhalter (`{{name}}`,
    `{{betrieb}}`),
  - „Lokale Anfragen leeren"-Button (entfernt nur Browser-Einträge,
    Demo-Leads bleiben).
- **Mock-Store** `src/lib/mock-store/leads-overrides.ts` mit
  `appendLead`, `updateStoredLead`, `getStoredLeads`, `hasStoredLeads`,
  `clearStoredLeads`, `getEffectiveLeads(slug, fallback)` (mergt
  Demo-Mock + Browser-Storage, sortiert nach `createdAt` absteigend),
  `countByStatus(leads)` und `generateLeadId(slug)`.
- `<LeadDetail>`-Component mit Inline-Notizen-Editor und
  Antwort-Vorlagen.
- `reply-templates.ts` mit 3 branchen-neutralen Vorlagen + `fillTemplate`-
  Helper.
- Sidebar zeigt `Anfragen` jetzt als produktive Sektion (kein
  „Vorschau"-Badge mehr für Silber/Gold).
- Smoketest `src/tests/leads-system.test.ts` (~15 Assertions): alle
  Demo-Leads valide, Pflicht-Lead-Felder im Preset, Mock-Store SSR-
  sicher, `countByStatus` exhaustive, Vorlagen-Platzhalter-Substitution.
- `docs/LEAD_SYSTEM.md` mit Architektur, Datenfluss, Persistierungs-API,
  Compliance-Notes und Paket-Gating-Tabelle.

### Changed
- **`<PublicContact>`** ersetzt das deaktivierte Vorschau-Formular durch
  `<PublicLeadForm>`. Die Direktkontakt-Karte links bleibt unverändert.
- **`/dashboard/[slug]/leads`-Page** rendert für Bronze weiterhin
  `<ComingSoonSection>` (kein `lead_management`); Silber/Gold sehen
  `<LeadsView>`.
- **`src/components/dashboard/nav-config.ts`** – `leads`-Eintrag ohne
  `comingInSession`.
- **`src/tests/dashboard.test.ts`** – akzeptiert jetzt ≥ 4 produktive
  Sektionen.
- **`src/lib/mock-store/index.ts`** re-exportiert `leads-overrides`.

### Notes
- Bundle-Größe: Public-Site-Bundle wächst auf ~5,7 KB First-Load JS
  (vorher 161 B, weil die Lead-Form jetzt client-seitig ist).
  Dashboard-Leads-Bundle: 16,4 KB First-Load JS.
- Persistierung läuft client-only; eine Anfrage, die in Browser A
  abgeschickt wurde, ist in Browser B nicht sichtbar. Echte Sync folgt
  in Session 19 (Supabase). Für Demo und Vertrieb reicht das aktuelle
  Modell.
- Branchenneutralität gewahrt: keine `if`-Verzweigungen je Branche, alle
  Felder kommen aus dem Preset, alle Vorlagen aus generischen
  `{{name}}`/`{{betrieb}}`-Platzhaltern.
- **Compliance**: Demo-Hinweis unterhalb der Felder, keine sensiblen
  Pflichtfelder (kein Geburtstag, keine Adresse, keine Kontonummer).

## [0.11.0] – Session 11 – 2026-04-27

### Added
- **Services-Editor** unter `/dashboard/[slug]/services` – CRUD für
  Leistungen. Nutzt RHF + zod (gleiches Pattern wie Session 10) plus
  `useFieldArray` für die Service-Liste:
  - **`<ServicesEditForm>`** – top-level Client-Form mit Status-Bar
    (lokaler Override-Hinweis, Fehlerzähler, Speichern/Verwerfen/
    Demo-Defaults laden), `useFieldArray` für append/remove/swap und
    Block-Speichern bei Limit-Überschreitung.
  - **`<ServiceCard>`** – kollabierbare `<details>`-Karte pro Service
    mit Titel, Kategorie, Preis-Label, Dauer, Kurzbeschreibung,
    Aktiv-/Hervorgehoben-Toggles, Inline-Entfernen-Bestätigung,
    Reihenfolge-Pfeilen (↑↓) und versteckten System-Feldern (id,
    businessId, sortOrder).
  - **`<ServicesSummary>`** – Live-Indikator mit Fortschrittsbar,
    Active-/Featured-Countern und Warnungen für „Limit erreicht" /
    „Über Limit" plus Upgrade-Link nach `/pricing`.
- **Mock-Store** `src/lib/mock-store/services-overrides.ts`:
  `getServicesOverride` / `setServicesOverride` /
  `clearServicesOverride` / `hasServicesOverride` mit versionierten
  localStorage-Schlüsseln (`lp:services-override:v1:<slug>`) und
  defensiver Schema-Validierung. Plus `getEffectiveServices(slug,
  fallback)` für die spätere Public-Site-Integration.
- **Empty-State** bei leerer Liste: zwei Wege – „Erste Leistung
  anlegen" oder „Aus Branchen-Preset übernehmen" (konvertiert
  `preset.defaultServices` zu vollständigen `Service`-Objekten mit
  frischen IDs).
- **Sortierungs-Normalisierung**: Beim Laden und Speichern werden
  `sortOrder`-Werte auf 0..n-1 zurückgeschrieben.
- **Paket-Gating**: Bronze (`service_management` nicht enthalten) zeigt
  weiterhin `<ComingSoonSection>` plus Public-Site-Hinweis. Silber/Gold
  bekommen den vollen Editor. Limit-Logik nutzt `isLimitExceeded()`,
  Speichern ist bei Über-Limit blockiert.
- Smoketest `src/tests/services-edit.test.ts` (~12 Assertions):
  Form-Schema akzeptiert alle 6 Demo-Listen, `sortOrder` pro Business
  eindeutig und nicht-negativ ganzzahlig, Service-IDs projektweit
  eindeutig, Paket-Limits stimmen, Mock-Store SSR-sicher.
- `docs/SERVICES_EDITOR.md` mit Architektur, Datenfluss, Funktionen,
  Persistierungs-API, Paket-Gating-Tabelle.

### Changed
- **`src/components/dashboard/nav-config.ts`** – `services`-Eintrag
  ohne `comingInSession` (jetzt produktiv für Silber/Gold). Sidebar
  markiert ihn nicht mehr als „Vorschau".
- **`src/tests/dashboard.test.ts`** – akzeptiert jetzt ≥ 3 produktive
  Sektionen (Übersicht + Betriebsdaten + Leistungen).
- **`src/lib/mock-store/index.ts`** re-exportiert `services-overrides`.

### Notes
- Bundle-Größe der Services-Page: 5,09 KB First-Load JS plus geteilte
  Chunks (RHF wird mit dem Business-Editor geteilt).
- Persistierung läuft client-only, kein Backend nötig. Public Site
  zeigt weiterhin die Demo-Services – Sync via Repository-Layer
  (Session 19).
- Branchenneutralität gewahrt: keine `if (industryKey === "...")`-
  Verzweigungen, der „Aus Preset übernehmen"-Knopf liest
  `preset.defaultServices` aus dem aktuellen `IndustryPreset`.

## [0.10.0] – Session 10 – 2026-04-27

### Added
- **Business-Editor** unter `/dashboard/[slug]/business`:
  React-Hook-Form + Zod-Resolver, validiert gegen
  `BusinessProfileSchema` (neuer Subset von `BusinessSchema` mit den
  editierbaren Feldern). 6 Sektionen:
  1. **Basisdaten** – Name, Tagline (`{{city}}`-Platzhalter), Beschreibung
  2. **Branche & Paket** – Branchen-Select aus 13 Presets, Paket nur
     anzeigen mit Link auf `/pricing`
  3. **Adresse** – Street, PLZ, Stadt, ISO-Land
  4. **Kontakt** – Telefon, WhatsApp, E-Mail, Website, Google-Maps-URL,
     Google-Bewertungslink
  5. **Öffnungszeiten** – 7-Tage-Editor mit `useFieldArray` für
     mehrere Slots pro Tag (z. B. Mittagspause), „geschlossen"-Toggle
     pro Tag
  6. **Branding & Design** – visueller `<ThemePickerField>` (10 Themes
     als Karten mit Color-Swatches), optionale Override-Felder für
     Primär-/Sekundär-/Akzentfarbe, Logo-/Cover-URL-Felder
- **`<BusinessEditPreview>`** – Live-Vorschau mit `<ThemeProvider>`
  und `useWatch()`. Reagiert sofort auf Änderungen von Name, Tagline,
  Theme und Farb-Overrides. Sticky-Sidebar auf Desktop, oben auf
  Mobile.
- **Mock-Store** in `src/lib/mock-store/`:
  - `business-overrides.ts` – `getOverride` / `setOverride` /
    `clearOverride` / `hasOverride` mit localStorage-Persistierung.
    Versionierter Schlüssel `lp:business-override:v1:<slug>`,
    defensive Validierung gegen Schema-Drift.
  - `business-profile.ts` – `profileFromBusiness` (Extraktion aus
    `Business`) und `mergeBusinessWithProfile` (für die Preview).
- **Form-Primitive** in `src/components/forms/`:
  `<FormSection>` (3-Spalten-Layout mit Eyebrow + Header links),
  `<FormField>` (Label + Hilfetext + Inline-Fehler),
  `<FormInput>` / `<FormTextarea>` / `<FormSelect>` mit konsistenter
  Error-State-Visualisierung.
- **Dashboard-Status**: Sidebar zeigt `Betriebsdaten` jetzt als
  produktive Sektion (kein „Vorschau"-Badge mehr, kein
  `comingInSession`).
- **Smoketest** `src/tests/business-edit.test.ts`: alle 6 Demo-Profile
  parsen, Merge erhält System-Felder (id, slug, packageTier, services),
  Schema-Regeln greifen mit sprechenden Fehlern, leere Override-
  Strings werden zu `undefined` transformiert.
- `docs/BUSINESS_EDITOR.md` mit Architektur, Datenfluss,
  Persistierungs-API, Static-Export-Notes, Erweiterungsanleitung.
- Dependencies: `react-hook-form@7.54.2`, `@hookform/resolvers@3.10.0`.

### Changed
- **`src/components/dashboard/nav-config.ts`** – `business`-Eintrag
  ohne `comingInSession` (jetzt produktiv). Sidebar markiert ihn nicht
  mehr als „Vorschau".
- **`src/tests/dashboard.test.ts`** – akzeptiert jetzt ≥ 2 produktive
  Sektionen statt exakt 1.
- **`src/core/validation/index.ts`** re-exportiert das neue
  `BusinessProfileSchema`.

### Notes
- Bundle-Größe der Editor-Page: ~66 KB First-Load JS
  (RHF + Resolver + Form-Felder). Andere Routen unverändert.
- Persistierung läuft **client-only** über localStorage. Kein Backend,
  keine Telemetrie. Andere Demo-Besucher:innen sehen die Anpassungen
  nicht – Supabase folgt in Session 19.
- Statisches Prerendering bleibt grün – die Editor-Page ist Server
  Component, das interaktive Form ist eine `"use client"`-Komponente,
  die mit der bekannten Hydration-Strategie nachlädt.
- Branchenneutralität: alle Branchen-spezifischen Inhalte kommen aus
  dem zugewiesenen `IndustryPreset` (für die Branchenauswahl) bzw. aus
  dem Theme (für Design). Keine `if`-Verzweigung im Form-Code.

## [0.9.0] – Session 9 – 2026-04-27

### Added
- **Dashboard-Grundstruktur** unter `/dashboard`:
  - **`/dashboard`** – Demo-Picker mit 6 Karten (Counter für Anfragen,
    Bewertung, Leistungen + Tier-Badge + Branche/Stadt + aktiver Link
    auf `/dashboard/<slug>`).
  - **`/dashboard/[slug]`** – per-Business-Übersicht mit
    `<DashboardShell>` (Sidebar + Mobile-Nav + BusinessHeader). 5 Cards:
    `<PackageStatusCard>` (Tier, Preise, Bronze→Gold-Fortschritt, nächste
    Stufe), `<PreviewLinkCard>` (Veröffentlichungsstatus + Public-Site-
    Öffnen), `<LeadsSummaryCard>` (Status-Counts), `<QuickActionsCard>`
    (4 Quick-Actions, paketabhängig gegated), `<RecentLeadsList>` (5
    jüngste Anfragen mit Status, Quelle, Anrufen-Link).
  - **7 Sub-Routen** als statisch prerendete Vorschauen mit
    `<ComingSoonSection>` (Roadmap-Bullets, Paket-Gating-Hinweis):
    `business`, `services`, `leads`, `ai`, `reviews`, `social`, `settings`.
  - **`/dashboard/[slug]/not-found.tsx`** – 404 im Marketing-Layout.
- **`<DashboardShell>`** – Layout-Hülle mit Sticky-`<BusinessHeader>`
  (Tier-Badge, `<details>`-basierter Demo-Switcher, Public-Site-Button),
  persistenter Sidebar (md+), horizontalem Mobile-Nav-Strip.
- **`nav-config.ts`** – Single Source of Truth `DASHBOARD_NAV` für
  Sidebar, Mobile-Nav und Quickactions plus `dashboardHref(slug, key)`-
  Helper.
- **`<DashboardCard>`** und **`<EmptyState>`** als wiederverwendbare
  Primitive.
- **Header-Nav** zeigt jetzt einen „Dashboard"-Link, damit der Picker
  von der Marketing-Seite aus erreichbar ist.
- Smoketest `src/tests/dashboard.test.ts`: Nav-Konfiguration vollständig
  und konsistent, jede Sub-Route hat eine `comingInSession`-Nummer im
  sinnvollen Bereich, `dashboardHref()` löst korrekt auf, alle
  Demo-Slugs sind erreichbar.
- `docs/DASHBOARD.md` mit Routenbaum, Komponenten-Übersicht,
  UX-Konventionen, Static-Export-Notes und Erweiterungsanleitung.

### Notes
- Build:static produziert jetzt deutlich mehr Routen
  (1× Picker + 6 Slugs × 8 Sektionen = 49 Dashboard-Pages; insgesamt
  **62 prerendete Routen**).
- Reine Server Components – kein Client-JS für die Navigation,
  Demo-Switcher nutzt natives `<details>`. Static-Export-tauglich.
- Alle Dashboard-Routen tragen `robots: { index: false, follow: false }`.
- Branchenneutrale, nicht-technische Sprache: „Anfragen" statt „Leads",
  „Aktiver Demo-Betrieb" statt „Tenant", „Letzte Anfragen" statt
  „Recent submissions".
- Quick-Actions sind paketabhängig (`hasFeature` / `requiredTierFor`):
  in Bronze sind die KI-Aktionen optisch gedimmt mit Hinweis
  „Verfügbar ab Silber".

## [0.8.0] – Session 8 – 2026-04-27

### Added
- **Eigene `/pricing`-Seite** mit:
  - PricingGrid (Bronze/Silber/Gold-Karten),
  - **`<LimitsTable>`** – numerische Limits Bronze/Silber/Gold im Vergleich,
    nutzt `formatLimit()` für „unbegrenzt"-Werte,
  - **`<FeatureComparisonMatrix>`** – 31 Capabilities × 3 Tiers, gruppiert
    nach `FeatureGroup` (Website / Design / Anfragen / Bewertungen / KI /
    Social / Verwaltung). Reihen aus `FEATURE_LABELS`, Werte über
    `hasFeature()` – keine Doppelpflege, keine Drift.
  - Pricing-spezifische FAQ (Mindestlaufzeit, Upgrade/Downgrade, MwSt.,
    Kündigung, KI-Pflicht, Platin-Status),
  - Schluss-CTA mit Beratung-Mail + Demo-Link + 4-Schritte-Onboarding-Karte.
- **Live-Demo-Showcase** auf der Startseite (`<DemoShowcase>`) –
  6 Mini-Karten mit `<ThemeProvider>`-Vorschau, jede als aktiver Link
  zur Public Site.
- **`<ValueRoi>`** – 4 ROI-Karten mit Mini-„Proof-Label" (z. B. „Eingebaut:
  Bewertungs-Booster ab Bronze"), gibt jedem Nutzen einen technischen Beleg.
- **`<Testimonials>`** – Beispiel-Stimmen aus den Demo-Personas (Lena H.,
  Stefan M., Sophie L., Petra W.). Footnote macht klar: keine echten
  Kund:innen.
- **`<OnboardingPromise>`** – „In 4 Schritten startklar" mit zwei finalen
  CTAs (Pakete vergleichen / Demos ansehen).
- `docs/MARKETING.md` mit Funnel-Tabelle, Komponenten-Übersicht,
  Sprache- & Compliance-Regeln und Erweiterungs-Checkliste.

### Changed
- **Hero** zeigt jetzt zwei aktive CTAs: „Live-Demos ansehen" (primary)
  und „Pakete vergleichen" (outline) statt der bisherigen Anker-Links.
- **PricingTeaser** verlinkt unten zentral auf `/pricing` für die
  vollständige Funktions-Vergleichsliste; CTA der Karten geht ebenfalls
  nach `/pricing`.
- **IndustriesGrid**: Branchenkarten mit Demo-Preset werden zu aktiven
  Links auf die jeweilige Public Site (Friseur, Werkstatt, Reinigung,
  Kosmetik, Handwerk, Fahrschule). Restliche Karten bleiben statisch
  (Demos noch nicht hinterlegt).
- **CtaContact** ist konversionsstärker formuliert: „Sehen Sie es live
  oder schreiben Sie uns direkt" + zwei Direkt-Kontaktwege (E-Mail,
  Demo-Telefonnummer) statt der vorigen Onboarding-Liste, die jetzt in
  die eigene `<OnboardingPromise>`-Sektion gewandert ist.
- **Site-Header-Nav** vereinfacht: Lösung / Demos / Pakete / Designs /
  FAQ. Header-CTAs zeigen „Live-Demos" + „Pakete" und führen zu
  `/demo` bzw. `/pricing`.
- **Startseite** als 11-Schritt-Funnel komponiert (Hero → Problem/Lösung →
  ROI → Branchen → Demo-Showcase → Pakete-Teaser → Onboarding → Vorteile →
  Stimmen → FAQ → Schluss-CTA).

### Notes
- Build:static produziert jetzt **13 statisch prerenderte Routen**:
  `/`, `/_not-found`, `/demo`, `/pricing`, `/themes`,
  `/site/<6 slugs>`. Die neuen Sektionen sind reine Server Components,
  kein Client-JS.
- Branchenneutralität gewahrt: Pricing-Tabellen lesen `FEATURE_KEYS` /
  `FEATURE_LABELS`, kein Branchen-Hardcoding. Demo-Showcase nutzt
  vorhandene Mock-Businesses.
- Klar gekennzeichnete Demo-Inhalte: Telefon `+49 30 9000 9999`
  (Demo-Nummer), Testimonials als „Beispiel-Stimmen aus der Demo-Welt"
  ausgezeichnet.

## [0.7.0] – Session 7 – 2026-04-27

### Added
- **Public Site Generator** unter `/site/[slug]` mit
  `generateStaticParams(listMockBusinessSlugs())`. Build:static prerendered
  jetzt **alle 6 Demo-Slugs** als statische HTML-Seiten – funktioniert
  ohne Server, ideal für GitHub Pages.
- **Pro-Business `generateMetadata`**: Title, Description, OpenGraph
  und Canonical kommen aus dem Business-Datensatz (kein Branchen-Hardcoding).
- **13 Public-Site-Komponenten** unter `src/components/public-site/`:
  `<PublicSection>` (theme-aware Wrapper), `<PublicSiteHeader>`,
  `<PublicSiteFooter>`, `<PublicHero>`, `<PublicServices>`,
  `<PublicBenefits>`, `<PublicProcess>`, `<PublicReviews>`,
  `<PublicFaq>`, `<PublicTeam>`, `<PublicOpeningHours>`,
  `<PublicLocation>`, `<PublicContact>`, `<PublicMobileCtaBar>`.
- **Sticky Mobile-CTA-Bar** mit Anrufen / WhatsApp / Anfrage – jede
  Schaltfläche nur sichtbar, wenn der Betrieb die jeweiligen Daten hat.
- **`<PublicContact>` Direktkontakt** mit funktionierenden `tel:`-,
  `wa.me`- und `mailto:`-Deeplinks plus einer **Anfrageformular-Vorschau**
  aus den `preset.leadFormFields`. Felder sind aktuell `disabled` (echte
  Submission folgt in Session 12).
- **`src/lib/contact-links.ts`**: E.164-normalisierte Helfer
  (`telLink`, `whatsappLink`, `mailtoLink`, `formatPhoneDisplay`).
- **`<ThemeProvider>` umrahmt jede Public Site** – CSS-Variablen
  kaskadieren durch alle Sektionen, jede Site sieht spürbar anders aus,
  ohne dass eine einzelne Branche im Code auftaucht.
- **`/site/[slug]/not-found.tsx`** – freundliche 404-Seite im
  Marketing-Layout, mit Links zur Demo-Übersicht und Startseite.
- **`/demo`-Karten** verlinken jetzt aktiv auf die jeweilige Public Site.
- **Section-Reihenfolge** kommt aus `preset.recommendedSections`,
  Standard-Reihenfolge plus defensive Fallbacks (Contact / Öffnungszeiten /
  Standort kommen immer ans Ende).
- **`lp-theme-section`-CSS-Klasse** ergänzt – nutzt `--theme-section-padding`.
- Smoketest `src/tests/public-site.test.ts`: Kontakt-Link-Normalisierung,
  Slug-Konsistenz, Pflicht „Telefon ODER WhatsApp" pro Betrieb.
- `docs/PUBLIC_SITE.md` mit Architektur, Datenfluss, Static-Export-Regeln,
  SEO-Pattern, Mobile-First-Notes, Erweiterungsanleitung.

### Notes
- Build:static produziert jetzt **12 statisch prerenderte Routen**:
  `/`, `/_not-found`, `/demo`, `/themes`, `/site/<6 slugs>`.
- Static-Export-kompatibel: keine API-Routen, keine Server Actions, kein
  Client-JS auf der Public Site (außer dem Mobile-Detail-Toggle der FAQs
  über native `<details>`).
- Branchenneutralität gewahrt: kein `if (industryKey === "...")` im
  Komponenten-Code; Texte und Felder kommen ausschließlich aus dem Preset.

## [0.6.0] – Session 6 – 2026-04-27

### Added
- **6 vollständig validierte Demo-Betriebe** unter
  `src/data/businesses/`:
  Studio Haarlinie (Friseur, Silber, warm_local),
  AutoService Müller (Werkstatt, Gold, automotive_strong),
  Glanzwerk Reinigung (Reinigung, Silber, medical_clean),
  Beauty Atelier (Kosmetik, Gold, beauty_luxury),
  Meisterbau Schneider (Handwerk, Bronze, craftsman_solid),
  Fahrschule Stadtmitte (Fahrschule, Silber, education_calm).
  Jeder Betrieb mit eigener Branche, eigenem Theme; alle drei aktiv
  vermarkteten Pakete vertreten. Insgesamt: 37 Services, 25 Reviews,
  22 FAQs, 5 TeamMembers, 25 Beispiel-Leads.
- `src/data/mock-helpers.ts`: `makeBusinessId`/`makeServiceId`/etc.
  für stabile Slug-prefixed-IDs, `MOCK_NOW`-Konstante für reproduzierbare
  Builds, `daysAgo()`, `buildOpeningHours()` (kompakte Schreibweise:
  `{ tuesday: "09:00-18:00", thursday: ["09:00-12:30", "13:30-20:00"] }`).
- `src/data/mock-businesses.ts`: Aggregation, `businessesBySlug`-Index,
  `getMockBusinessBySlug()`, `listMockBusinessSlugs()`,
  Konsistenz-Check (eindeutige Slugs).
- `src/data/mock-services.ts`: flache `mockServices`-Liste,
  `servicesByBusiness`, `getMockServiceById()`.
- `src/data/mock-reviews.ts`: flache `mockReviews`-Liste,
  `reviewsByBusiness`, `averageRatingByBusiness` (gerundet auf 0,1).
- `src/data/mock-leads.ts`: 25 realistische Beispiel-Leads mit
  branchenspezifischen `extraFields` (`vehicleModel`, `objectType`,
  `drivingClass`, …) und Status-Mix (`new`/`contacted`/`qualified`/`won`/
  `lost`). Validiert via `LeadSchema.parse(...)`.
- `src/data/mock-dataset.ts`: validiertes `MockDataset` über
  `validateMockDataset()` (`MockDatasetSchema`), `leadsByBusiness`,
  Konsistenz-Check (Lead → existierender Betrieb).
- `src/data/index.ts` Barrel.
- **`/demo`-Übersichtsseite**: rendert pro Betrieb eine Karte mit
  Themed-Vorschau (über `<ThemeProvider>`), Branchen-Etikett, Paket-Badge,
  Counts (Services/FAQs/Anfragen) und einem Hinweis auf die Public Site
  (folgt Session 7). Statisch prerendert, kein Client-JS.
- Nav-Eintrag „Demo" in `<SiteHeader>`.
- Smoketest `src/tests/mock-data.test.ts` mit 30+ Assertions
  (Mindestabdeckung, eindeutige IDs, Branchen-/Theme-/Paket-Diversität,
  Service-/Review-Konsistenz, Paket-Limits, Lead-Status-Mix,
  Verbot echter Mail-Provider, Lookup-Verhalten).
- `docs/MOCK_DATA.md` mit Tabellen, Architektur, Compliance-Regeln und
  Erweiterungsanleitung.

### Notes
- Stabile, demoerkennbare Daten: Telefon `+49 XX 9000 XXXX`-Muster,
  Mails auf `@<slug>-demo.de` oder `@example.org`, Städte
  *Musterstadt*/*Beispielstadt*/*Demostadt*/*Beispieldorf*. Smoketest
  blockt aktiv `gmail.com`, `gmx.de`, `web.de`, `hotmail.com`, `yahoo.com`.
- Stabile Zeitstempel via `MOCK_NOW = "2026-04-27T09:00:00Z"` und
  `daysAgo()` – Builds bleiben reproduzierbar.
- Kein Betrieb überschreitet sein Paket-Limit (Bronze 10, Silber 30,
  Gold 100 Services). Smoketest greift auf `isLimitExceeded()` zurück.

## [0.5.0] – Session 5 – 2026-04-27

### Added
- 10 Theme-Datensätze unter `src/core/themes/themes/`:
  `clean_light` (Default), `premium_dark`, `warm_local`, `medical_clean`,
  `beauty_luxury`, `automotive_strong`, `craftsman_solid`, `creative_studio`,
  `fitness_energy`, `education_calm`. Jedes Theme bringt 10 Farb-Tokens,
  Typografie, Radius, Schatten, Section-/Button-/Card-Stil und eine
  Liste passender Branchen mit. Jedes Theme wird beim Module-Load via
  `ThemeSchema.parse(...)` validiert.
- `src/core/themes/theme-resolver.ts`: `themeToCssVars(theme)` wandelt
  einen Theme-Datensatz in ein `Record<\`--theme-...\`, string>` für
  inline `style`. `hexToRgbTriplet()` konvertiert `#1f47d6` → `"31 71 214"`,
  passend zur Tailwind-`<alpha-value>`-Syntax.
- `src/core/themes/registry.ts` mit `THEME_REGISTRY`, `DEFAULT_THEME`
  (clean_light), `getTheme`, `getThemeOrFallback`, `getAllThemes`,
  `listThemeKeys`, `getThemesForIndustry`, `UnknownThemeError`,
  Konsistenz-Check beim Module-Load (Map-Key === theme.key).
- `src/core/themes/index.ts` Barrel.
- `<ThemeProvider>` (`src/components/theme/theme-provider.tsx`):
  Server-Component-tauglicher Wrapper, der die CSS-Variablen per inline
  `style` setzt und optional `bg-theme-background`/`text-theme-foreground`
  via `lp-theme-surface`-Klasse anwendet. Kein React Context, kein
  useEffect, kein Client-JS – kompatibel mit Static Export.
- `<ThemePreviewCard>` für die Galerie (Hero-Mini mit Buttons, Service-Card).
- Statische Galerie-Seite **`/themes`** rendert alle 10 Themes als Vorschau
  – serverseitig, ohne Client-JS, statisch exportierbar.
- Tailwind-Integration: `theme.*`-Color-Set (primary, primary-fg, secondary,
  secondary-fg, accent, background, foreground, muted, muted-fg, border)
  via `rgb(var(--theme-...) / <alpha-value>)`. `borderRadius.theme`,
  `borderRadius.theme-button`, `borderRadius.theme-card`, `boxShadow.theme`,
  `fontFamily.theme-heading`, `fontFamily.theme-body`.
- `src/app/globals.css` setzt Default-Theme-Variablen im `:root`, sodass
  Seiten ohne expliziten ThemeProvider trotzdem theme-Klassen nutzen können.
- Smoketest `src/tests/themes.test.ts` mit ~25 Assertions
  (Mindestabdeckung, Hex-Validierung, RGB-Konvertierung, Lookup-Verhalten,
  Branchenempfehlungen).
- `docs/THEMES.md`: Galerie-Übersicht, Architektur, Code-Beispiele,
  Erweiterungsanleitung.

### Changed
- `<LinkButton>` (`src/components/ui/button.tsx`) ist jetzt basePath-aware:
  Bei internen absoluten Pfaden (`/themes`, `/#kontakt`) wird automatisch
  `next/link` verwendet, sonst weiterhin nativer `<a>`. Damit funktionieren
  Header-Buttons von jeder Seite aus auf GitHub Pages korrekt.
- `<SiteHeader>` enthält jetzt einen Nav-Link auf `/themes`.
- `tailwind.config.ts` und `globals.css` mit Theme-Tokens erweitert
  (Marketing-Optik bleibt unberührt – `brand-*` und `ink-*` bleiben).

## [0.4.0] – Session 4 – 2026-04-27

### Added
- 13 Branchen-Presets unter `src/core/industries/presets/` mit kompletten,
  validierten Datensätzen: Friseur, Barbershop, Autowerkstatt,
  Reinigungsfirma, Kosmetikstudio, Nagelstudio, Handwerker, Elektriker,
  Malerbetrieb, Fahrschule, Restaurant, Fotograf, Personal Trainer.
- `src/core/industries/preset-helpers.ts`: wiederverwendbare Lead-Felder
  (`NAME_FIELD`, `PHONE_FIELD`, `EMAIL_FIELD`, `MESSAGE_FIELD`,
  `PREFERRED_DATE_FIELD`), Standard-CTAs (`CTA_APPOINTMENT_PRIMARY`,
  `CTA_CALL`, `CTA_WHATSAPP`, `CTA_QUOTE`, `CTA_CALLBACK`) und
  Compliance-Bausteine (`COMPLIANCE_NO_MEDICAL_PROMISE`,
  `COMPLIANCE_NO_LEGAL_ADVICE`, `COMPLIANCE_NO_FINANCE_GUARANTEE`,
  `COMPLIANCE_NO_AGE_RESTRICTED_PROMISE`).
- `src/core/industries/fallback-preset.ts` mit
  `getFallbackPreset(originalKey)` – branchenneutrales Universal-Preset, das
  den ursprünglich angefragten `key` spiegelt.
- `src/core/industries/registry.ts` mit:
  - `PRESET_REGISTRY`-Lookup-Map.
  - `getPreset`, `getPresetOrFallback`, `getAllPresets`, `listPresetKeys`,
    `listMissingPresetKeys`, `hasPreset`, `getPresetsForTheme`.
  - `UnknownIndustryError` für sprechende Fehler.
  - Konsistenz-Check beim Module-Load (Map-Key === preset.key).
- `src/core/industries/index.ts` Barrel.
- `src/tests/industry-presets.test.ts` mit umfangreichem Smoketest:
  Mindestabdeckung ≥ 10, Schema-Validierung, Pflichtfelder im Lead-Formular
  (`name`, `phone`), Platzhalter in Bewertungs-Vorlagen
  (`{{customerName}}`, `{{reviewLink}}`), Compliance-Hinweise für medizin-
  /pflegenahe Branchen (Kosmetik, Nail, Trainer).
- `docs/INDUSTRY_PRESETS.md` mit Übersichtstabelle, Zugriffs-API,
  Validierungs-Regeln, Konvention zur 30-Min-Branchenergänzung und
  Beziehung zu späteren Sessions.

### Notes
- `getPresetOrFallback()` ist die Standardvariante für Public Site und
  Dashboard – nie wieder weiße Seite, falls eine Branche noch nicht
  modelliert ist.
- Lücken in `INDUSTRY_KEYS` (`tutoring`, `local_shop`, `dog_grooming`,
  `wellness_practice`, `real_estate_broker`, `garden_landscaping`) sind
  bewusst noch nicht modelliert – `listMissingPresetKeys()` macht sie zur
  Laufzeit sichtbar.
- Der Core bleibt branchenneutral: Public Site, Dashboard und KI-System
  greifen ausschließlich über das Preset auf branchenspezifische Inhalte zu.

## [0.3.1] – Hotfix – 2026-04-27

### Added
- `.github/workflows/deploy.yml`: GitHub Pages Deployment via Actions.
  Trigger auf `main` und `claude/**`, baut mit `STATIC_EXPORT=true`,
  `NEXT_PUBLIC_BASE_PATH=/<repo-name>` und einem `.nojekyll`-File für
  `_next/`-Assets.
- `npm run build:static`: lokaler Static-Export-Build (`STATIC_EXPORT=true`).
- `docs/DEPLOYMENT.md`: vollständige Anleitung für GitHub Pages und
  geplanter Vercel-Pfad.
- `Claude.md` Abschnitt 28 "DEPLOYMENT" als persistenter Eintrag im
  Master-Briefing.

### Changed
- `next.config.mjs` schaltet `output: "export"`, `trailingSlash`, `basePath`
  und `assetPrefix` konditioniert auf `STATIC_EXPORT=true`. Lokaler
  `npm run dev` und normaler `npm run build` bleiben damit voll
  SSR-fähig.

## [0.3.0] – Session 3 – 2026-04-27

### Added
- `src/core/pricing/pricing-tiers.ts` mit konkreten `BRONZE_TIER`,
  `SILBER_TIER`, `GOLD_TIER`-Datensätzen. Jeder Datensatz wird beim
  Module-Load via `PricingTierSchema.parse(...)` validiert – Tippfehler in
  Features oder Limits brechen sofort den Build.
- Vererbungslogik Bronze ⊂ Silber ⊂ Gold (Silber erbt alle Bronze-Features,
  Gold erbt alle Silber-Features).
- Konkrete Feature-Limits pro Stufe (`maxServices`, `maxLandingPages`,
  `maxLanguages`, `maxLocations`, `maxThemes`, `maxAiGenerationsPerMonth`,
  `maxLeads`); `TIER_UNLIMITED` für unbegrenzte Limits.
- `src/core/pricing/feature-labels.ts` – deutsches Klartext-Label und
  Beschreibung pro `FeatureKey`. Erzwungen vollständig über
  `Record<FeatureKey, FeatureLabel>` (Compile-Zeit-Check).
- `src/core/pricing/feature-helpers.ts` – reine Funktionen:
  `getTier`, `tryGetTier`, `getAllTiers`, `hasFeature`, `isFeatureLocked`,
  `requiredTierFor`, `getTierLimits`, `isLimitExceeded`, `compareTiers`,
  `isAtLeastTier`, `nextHigherTier`, `formatPrice`, `formatLimit`.
  Plus `UnknownTierError` für sprechende Fehler bei unbekannten Stufen.
- `src/core/pricing/index.ts` Barrel.
- Pricing-Komponenten unter `src/components/pricing/`:
  - `<PricingCard>` mit `currentTier`-Markierung ("Aktuelles Paket"-Badge),
    "Beliebt"-Badge für hervorgehobene Stufen, lokalisierte Preise via
    `Intl.NumberFormat`.
  - `<PricingGrid>` – rendert konfigurationsgesteuert alle aktiven Stufen.
  - `<FeatureLock>` – sperrt Bereiche paketabhängig
    (`variant="overlay"`/`"replace"`).
  - `<UpgradeHint>` – kompakter Inline-Hinweis "Verfügbar ab Silber/Gold".
- `marketingHighlights`-Feld in `PricingTierSchema` ergänzt – getrennt von
  technischem `features`-Array, damit Marketing-Bullets unabhängig vom
  internen Capability-Modell formuliert werden können.
- `src/tests/pricing-helpers.test.ts` – Smoketest mit ~40 Assertions
  (Vererbung, Lookup, Limits, Reihenfolge, Formatierung, Konsistenz von
  `FEATURE_LABELS`).
- `docs/PRICING.md` – vollständige Pricing-Dokumentation für Entwickler:innen
  und Vertrieb.

### Changed
- `src/components/marketing/pricing-teaser.tsx` rendert jetzt aus der
  Code-Konfiguration (`<PricingGrid>`) statt aus hartcodierten Karten.
  Marketing-Sektion bleibt visuell identisch, ist aber an die zentrale
  Pricing-Konfiguration gebunden.
- README, RUN_LOG, TECHNICAL_NOTES aktualisiert.

### Notes
- Platin-Stufe ist bewusst noch nicht modelliert; `getTier("platin")` wirft
  `UnknownTierError`. Die Marketing-Fußnote weist auf "Platin auf Anfrage"
  hin. Volle Modellierung folgt nach Session 22.
- Die Helfer sind seiteneffektfrei und in Server-/Client-Komponenten nutzbar.

## [0.2.0] – Session 2 – 2026-04-27

### Added
- Zentrales Konstanten-Modul `src/types/common.ts` mit allen String-Literal-Schlüsseln
  (`PackageTier`, `IndustryKey`, `ThemeKey`, `FeatureKey`, `LeadStatus`,
  `LeadSource`, `SocialPlatform`, `ReviewSource`, `WeekDay`, `AIProviderKey`,
  `SupportedLocale`, `SupportedCurrency` u. v. m.) – `as const`-Tupel als Single
  Source of Truth, daraus abgeleitete Typen.
- Zod-Schemas in `src/core/validation/`:
  - `common.schema.ts` – Primitive (Id, IsoDate, Slug, ColorHex, Phone, Email,
    Url, Money, OpeningHours) und Enum-Schemas.
  - `service.schema.ts`, `review.schema.ts`, `faq.schema.ts`, `lead.schema.ts`
    inkl. `LeadFormFieldSchema`.
  - `theme.schema.ts` mit `ThemeColorsSchema`, `ThemeTypographySchema`.
  - `pricing.schema.ts` mit `PricingTierSchema`, `TierLimitsSchema` und
    `TIER_UNLIMITED`-Konstante.
  - `industry.schema.ts` für vollständige `IndustryPreset`-Validierung
    (CTAs, Services, FAQs, Benefits, Process Steps, Lead-Felder, Review-
    Vorlagen, Social-Prompts, Website-Copy-Prompts, Compliance-Notes).
  - `business.schema.ts` als "fettes" Aggregat inkl. Address, Contact,
    OpeningHours, Services, Reviews, FAQs, TeamMembers.
  - `ai.schema.ts` mit Eingaben/Ausgaben für alle 7 AI-Methoden, plus
    `AIProvider`-Interface und `AIProviderError`-Klasse.
  - `index.ts` Barrel.
- Re-Export-Schicht `src/types/{business,service,lead,review,faq,industry,
  theme,pricing,ai,index}.ts` mit per `z.infer` abgeleiteten Typen, damit
  Schema und Typ nicht driften können.
- `src/data/mock-types.ts` mit `MockDatasetSchema`, `BusinessSlugIndex`,
  `LeadsByBusiness` und `validateMockDataset()` als Plan für Session 6.
- `src/tests/schema-validation.test.ts`: Compile-Zeit-Smoketest, der jedes
  Schema einmal mit realistischen Beispieldaten parst – schlägt schon bei
  `tsc --noEmit` fehl, falls Typ und Schema auseinanderlaufen.
- Dependency: `zod@3.24.1`.

### Changed
- `README.md`: Abschnitt zur Datenmodell-Architektur aktualisiert.
- `docs/RUN_LOG.md`, `docs/TECHNICAL_NOTES.md`: Stand nach Session 2 ergänzt.

### Notes
- Es gibt noch keine konkreten Inhalte: Mock-Daten kommen in Session 6,
  Branchen-Presets in Session 4, Themes in Session 5, Pricing-Konfiguration in
  Session 3. Session 2 stellt nur das Modell- und Validierungsfundament bereit.
- Strict-Mode-kompatibel: keine `any`, alle Felder typsicher,
  `noUncheckedIndexedAccess` aktiv.

## [0.1.0] – Session 1 – 2026-04-27

### Added
- Next.js 15 (App Router), TypeScript strict, Tailwind CSS, ESLint Setup.
- Root-Layout mit deutschsprachigen Metadaten und Open-Graph-Defaults.
- Globale Styles, Tailwind-Theme (Brand- und Ink-Farbpaletten, Container, Schatten, Radius).
- UI-Primitive: `Container`, `Section`, `Button`, `LinkButton`.
- Layout-Komponenten: `SiteHeader`, `SiteFooter`.
- Marketing-Landingpage (`/`) mit Sektionen Hero, Problem, Lösung, Branchen, Pakete (Teaser), Vorteile, FAQ, Kontakt-CTA.
- Ordnerstruktur für `src/app`, `src/components`, `src/core`, `src/data`, `src/lib`, `src/types`, `src/tests`, `docs/`.
- Dokumentation: `README.md`, `CHANGELOG.md`, `.env.example`, `docs/PRODUCT_STRATEGY.md`, `docs/TECHNICAL_NOTES.md`, `docs/RUN_LOG.md`.
- `.gitignore` für Next.js-Standardartefakte.

### Notes
- Pricing-Karten auf der Marketing-Seite sind aktuell statische Teaser. Die echte Produkt-Logik (Feature-Locks, `hasFeature`, Limits) folgt in Session 3.
- KI-Provider, Branchen-Presets, Themes, Mock-Daten, Dashboard und Public Sites sind in der Ordnerstruktur vorbereitet, aber bewusst noch nicht implementiert.
