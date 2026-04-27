# AI-Schicht – LocalPilot AI

Recap der KI-Pipeline nach den Code-Sessions 21–65. Alle
Provider-Pfade, Helper, UI-Konsumenten in einem Dokument.

> Stand 2026-04-27 · Sessions 21, 24–30, 61, 62, 65.

---

## Pipeline-Diagramm

```
                          ┌─────────────────────────┐
                          │  Browser (Client)       │
                          │                         │
                          │  ┌───────────────────┐  │
                          │  │ AIPlayground (S65)│  │
                          │  │ Reviews    (S61) │  │
                          │  │ Social     (S62) │  │
                          │  └─────────┬─────────┘  │
                          │            │            │
                          │            ▼            │
                          │  ┌───────────────────┐  │
                          │  │ lib/ai-client.ts  │  │
                          │  │ callAIGenerate()  │  │
                          │  └─────────┬─────────┘  │
                          └────────────┼────────────┘
                                       │
                              POST /api/ai/generate
                              (Bearer + Cookie-Session)
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │  Server (Edge / Node)   │
                          │                         │
                          │  ┌───────────────────┐  │
                          │  │ checkAuth (S28)   │  │
                          │  │ Cookie OR Bearer  │  │
                          │  └─────────┬─────────┘  │
                          │            ▼            │
                          │  ┌───────────────────┐  │
                          │  │ previewBudget     │  │
                          │  │ (Cost-Cap, S29)   │  │
                          │  └─────────┬─────────┘  │
                          │            ▼            │
                          │  ┌───────────────────┐  │
                          │  │ getAIProvider     │  │
                          │  │ (Resolver, S26)   │  │
                          │  └─────────┬─────────┘  │
                          │            ▼            │
                          │  ┌───────────────────────┐
                          │  │ Provider-Implementations
                          │  │  · mock-provider  S14
                          │  │  · openai-prov    S21
                          │  │  · anthropic-prov S24
                          │  │  · gemini-prov    S26
                          │  └─────────┬─────────┘  │
                          │            ▼            │
                          │  ┌───────────────────┐  │
                          │  │ sanitizeAIOutput  │  │
                          │  │ (Defense, S27)    │  │
                          │  └─────────┬─────────┘  │
                          │            ▼            │
                          │  ┌───────────────────┐  │
                          │  │ chargeBudget      │  │
                          │  │ (Cost-Track, S29) │  │
                          │  └─────────┬─────────┘  │
                          └────────────┼────────────┘
                                       │
                                       ▼
                              {output, cost} ← JSON
```

---

## 7 Methoden

`/api/ai/generate` versteht eine Discriminated-Union mit
diesen `method`-Werten (alle als `AIGenerateMethod` typisiert
in `lib/ai-client.ts`):

| Method                       | Verwendet von             | Schema                          |
| ---------------------------- | ------------------------- | ------------------------------- |
| `generateWebsiteCopy`        | AIPlayground              | `WebsiteCopyInputSchema`        |
| `improveServiceDescription`  | AIPlayground              | `ServiceDescriptionInputSchema` |
| `generateFaqs`               | AIPlayground              | `FaqGenerationInputSchema`      |
| `generateCustomerReply`      | AIPlayground              | `CustomerReplyInputSchema`      |
| `generateReviewRequest`      | AIPlayground + Reviews    | `ReviewRequestInputSchema`      |
| `generateSocialPost`         | AIPlayground + Social     | `SocialPostInputSchema`         |
| `generateOfferCampaign`      | AIPlayground              | `OfferCampaignInputSchema`      |

Jeder Eingabe-Typ ist Zod-validiert (`core/validation/ai.schema.ts`).

---

## Browser → Server (Code-Session 65)

`callAIGenerate(req, deps?)` ist die **einzige** Stelle, an der
der Browser die API aufruft. Drei Konsumenten:

- `AIPlayground` (`dashboard/[slug]/ai`) — alle 7 Methoden.
- `ReviewsRequestPanel` (`dashboard/[slug]/reviews`) — nur
  `generateReviewRequest`.
- `SocialPostPanel` (`dashboard/[slug]/social`) — nur
  `generateSocialPost`.

### Auth

- **Bearer-Token**: aus localStorage-Slot `lp:ai-api-token:v1`
  (geteilt zwischen allen drei Panels).
- **Cookie-Session**: automatisch via `credentials: same-origin`
  vom Browser mitgesendet, falls der User eingeloggt ist.

`checkAuth()` (Server, Session 28) akzeptiert beide Wege.

### Result-Kinds (`AIGenerateResult`)

| Kind          | HTTP-Status      | UI-Aktion                                    |
| ------------- | ---------------- | -------------------------------------------- |
| `server`      | 200 OK           | Output in Panel rendern                      |
| `not-authed`  | 401              | Hinweis „Login fehlt"                        |
| `forbidden`   | 403              | Hinweis „kein Zugriff"                       |
| `validation`  | 400 (selten)     | Field-Errors in UI mappen                    |
| `rate-limit`  | 429 + cost-Body  | Rate-Limit-Card mit Reset-Countdown          |
| `static-build`| 404              | Hinweis „nur SSR-Deploy" + Mock-Switch-Tipp  |
| `fail`        | 5xx + Throw      | Generischer Fehler-Banner                    |

`userMessageForResult(result)` mappt jeden Kind auf einen
deutschen User-Hinweis-String.

---

## Server-Pipeline

`/api/ai/generate` (Code-Session 28+):

1. `checkAuth(req)` — 401 wenn weder Bearer-Token noch
   Cookie-Session.
2. `RequestSchema.safeParse(body)` — 400 mit
   field-spezifischen Errors.
3. `previewBudget(estimateCost(...))` — 429 wenn
   Tages-Budget überschritten (mit Reset-Zeit).
4. `getAIProvider({providerKey})` — Dispatch an Provider-
   Implementation.
5. `sanitizeAIOutput(output)` — XSS-Schutz auf alle
   String-Felder (Defense-in-Depth, auch für Mock-Output).
6. `chargeBudget(actualCost)` — Cost-Tracking.
7. Response: `{ output, cost }`.

---

## Provider-Implementations

| Provider    | Datei                                  | Default-Modell           |
| ----------- | -------------------------------------- | ------------------------ |
| `mock`      | `core/ai/providers/mock-provider.ts`   | `default`                |
| `openai`    | `core/ai/providers/openai-provider.ts` | `gpt-4o-mini`            |
| `anthropic` | `core/ai/providers/anthropic-provider.ts` | `claude-sonnet-4-5`   |
| `gemini`    | `core/ai/providers/gemini-provider.ts` | `gemini-2.0-flash`       |

Mock liefert deterministische Texte ohne API-Call — funktioniert
in Tests, Static-Build, ohne ENV. Live-Provider brauchen
`OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` als
ENV.

Sechs Tests pro Live-Provider (`ai-openai-provider.test.ts`,
`ai-anthropic-provider.test.ts`, `ai-gemini-provider.test.ts`)
+ Resolver-Test + Cost-Test + Sanitize-Test = ~9 AI-Tests
gesamt.

---

## Code-Sessions in dieser Schicht

- **14**: Mock-Provider mit deterministischen Fixtures.
- **21–22**: OpenAI-Provider mit Structured Outputs +
  Prompt-Caching.
- **24–25**: Anthropic-Provider mit Tool-Use-Pattern.
- **26**: Gemini-Provider mit `responseJsonSchema`.
- **27**: AIPlayground-UI als interner Demo-Spielplatz.
- **28**: `/api/ai/generate`-Route mit Auth-Stub.
- **29**: Cost-Tracking + Tages-Budget-Cap.
- **30**: 429-UX mit Rate-Limit-Card.
- **61**: `lib/ai-client.ts` als zentraler Helper +
  Reviews-Panel als erster Konsument.
- **62**: Social-Panel als zweiter Konsument.
- **65** (Light-Pass): AIPlayground migriert auf den Helper.
  ~100 Zeilen inline-Error-Handling konsolidiert. **`callAIGenerate`
  ist jetzt der einzige Browser→Server-Pfad.**

---

## Tests

| Test-Datei                              | Asserts | Coverage                        |
| --------------------------------------- | ------- | ------------------------------- |
| `src/tests/ai-client.test.ts`           | ~38     | callAIGenerate, alle Result-Kinds |
| `src/tests/ai-mock-provider.test.ts`    | ~20     | Deterministisches Mock-Output   |
| `src/tests/ai-openai-provider.test.ts`  | ~15     | Structured Outputs + Errors     |
| `src/tests/ai-anthropic-provider.test.ts`| ~15    | Tool-Use-Roundtrip              |
| `src/tests/ai-gemini-provider.test.ts`  | ~15     | responseJsonSchema-Path         |
| `src/tests/ai-provider-resolver.test.ts`| ~10     | ENV-basierter Resolver          |
| `src/tests/ai-cost.test.ts`             | ~24     | Cost-Estimate + Budget          |
| `src/tests/ai-sanitize.test.ts`         | ~29     | XSS-Patterns                    |
| `src/tests/ai-health.test.ts`           | ~18     | Provider-Status                 |

Insgesamt ~184 Asserts auf der AI-Schicht.

---

## Verwandte Dokumente

- [PROGRAM_PLAN.md](./PROGRAM_PLAN.md) — Roadmap inkl. Phase 1
  (MVP) + Phase 2 (UI/UX-Polish).
- [STORAGE.md](./STORAGE.md) — Storage-Architektur (Sessions
  51–60), strukturell ähnliche Recap-Doku.
- [RESEARCH_INDEX.md](./RESEARCH_INDEX.md) — Track A für
  Provider-Quellen (OpenAI / Anthropic / Gemini Docs +
  Auth-Patterns).
