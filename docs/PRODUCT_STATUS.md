# Produkt-Status – LocalPilot AI

Was das Produkt **JETZT** kann (Stand Session 85). Single-
Source-of-Truth für „können wir das, ja oder nein?". Wird
mit jeder Phase-3-Session aktualisiert.

**Phasen-Stand**:
- Phase 1 (Sessions 1–70) ✅ MVP-funktional
- Phase 1.5 (Sessions 71–76) ✅ E2E-Tests (116 grün)
- Phase 2 (Sessions 77–84) ✅ UI/UX-Polish + Brand + A11y + Mobile
- **Phase 3 (Sessions 85–100) → Verkaufsreife** (in Arbeit)

> Stand 2026-04-28 · Sessions 1–87.

---

## Verkaufs-Infrastruktur (Phase-3-Tracker)

Operative Verkaufsbereitschaft. Wird in S100 final zu 12/12
auditiert.

### Domain + Email

| Punkt                                | Status | Plan-Session | Wo dokumentiert |
| ------------------------------------ | ------ | ------------ | --------------- |
| Domain registriert                   | ❌     | S87 → S94    | `DOMAIN_SETUP.md` Schritt 1 |
| Vercel-Custom-Domain verbunden       | ❌     | S87 → S94    | `DOMAIN_SETUP.md` Schritt 2-5 |
| Email-Postfach `kontakt@<domain>`    | ❌     | S87 → S94    | `DOMAIN_SETUP.md` Schritt 6-7 |
| Magic-Link-Auth-Smoketest Production | ❌     | S87 → S94    | `DOMAIN_SETUP.md` Schritt 8 |

Anleitung steht (S87) — operative Durchführung wandert nach
S94 (Production-Deploy-Pipeline final), wo der Auftraggeber
die Schritte abarbeitet und die Häkchen setzt.

### Verkaufs-Checkpunkte (12 für S100)

| #  | Punkt                                                  | Status | Plan-Session |
| -- | ------------------------------------------------------ | ------ | ------------ |
| 1  | Pitch-PDF produktionsreif                              | ❌     | S88          |
| 2  | Pilot-Vertrag-Template DSGVO-konform                   | ❌     | S88 → S96    |
| 3  | Erstgespräch-Kalender-Link aktiv                       | ❌     | S88          |
| 4  | 3 Hero-Branchen klar fokussiert                        | ❌     | S91          |
| 5  | Demo-Sites prominent als „Demo" markiert               | ❌     | S90          |
| 6  | Echte Domain + Email-Inbox aktiv                       | ❌     | S87 → S94    |
| 7  | Onboarding < 60 Min real getestet                      | ❌     | S92          |
| 8  | Production-Deploy-Pipeline grün                        | ❌     | S94          |
| 9  | Vertrag + Legal final                                  | ❌     | S96          |
| 10 | Customer-Support-Inbox eingerichtet                    | ❌     | S97          |
| 11 | Sales-Material final (Screenshots/Video/PDF)           | ❌     | S98          |
| 12 | End-to-End-Verkauf-Probelauf bestanden                 | ❌     | S99          |

**Ziel S100**: 12/12 ✅.

---

## Was steht (MVP-Capability-Liste)

### Auth & Identity
- Magic-Link-Login (`/login` → `/api/auth/magic-link` →
  Email → `/api/auth/callback`).
- Cookie-Session via Supabase SSR + Bearer-Token-Pfad für
  CLI-Calls (`AI_TOKEN_STORAGE_KEY` geteilt zwischen
  AIPlayground / Reviews / Social).
- `getCurrentUser()` als RLS-Anker.

### Self-Service-Cycle (Owner-Pfad)
1. **Onboarding** (`/onboarding`, S38) — Branche, Name,
   Slug, Theme.
2. **Editor** (`/dashboard/<slug>/business`, S50): alle
   Stammdaten + Logo + Cover.
3. **Service-Liste** (`/dashboard/<slug>/services`,
   S55+58): Bulk-CRUD + Reorder + Service-Bilder.
4. **Settings** (`/dashboard/<slug>/settings`, S52+57+69):
   Slug-Wechsel mit Storage-Move + Publish-Toggle +
   Sprache + **Danger-Zone (Löschen)**.
5. **Public-Site** (`/site/<slug>`): Hero, Services,
   FAQ, Lead-Form, OpeningHours, Footer.
6. **Default-Redirect** (S63): bei genau 1 Betrieb springt
   `/account` direkt aufs Dashboard.

### AI-Schicht (siehe `AI.md`)
- `/api/ai/generate` mit 7 Methoden, 4 Providern (Mock /
  OpenAI / Anthropic / Gemini), Cost-Cap, Sanitizer.
- `lib/ai-client.ts` als zentraler Browser→API-Helper
  (3 Konsumenten: AIPlayground / Reviews / Social).

### Storage-Schicht (siehe `STORAGE.md`)
- Bucket `business-images` mit Layout
  `<slug>/{logo,cover,services/<id>}.<ext>`.
- 4 Hygiene-Pfade: Upload (S51+58), DELETE-Cleanup (S56),
  Slug-Wechsel-Move (S57+59), Recursive-Delete bei
  Business-Löschung (S69).

### Lead-System
- Public-Site-Form mit dual-write (DB + localStorage-
  Backup, S44).
- Retry-Queue (S64): bei `local-fallback` automatischer
  Re-Send beim nächsten `online`-Event.
- Dashboard-Übersicht für eingehende Leads.

### Security-Stack (Defense-in-Depth)
| Layer | Mechanismus | Session |
| --- | --- | --- |
| Cookies | `SameSite=Lax` + `Secure` in Prod | 33 |
| CSRF | Origin/Referer-Check, alle 10 mutating Routes | 66 |
| XSS | `sanitizeAIOutput` (S27) + `sanitizeUserText` (S67) | 27 + 67 |
| Auth | RLS auf jeder Table (Migration 0007) + `getCurrentUser` | 7 + 36 |
| Input-Limits | DoS-Cap 50 KB pro String-Feld | 67 |
| Error-Tracking | Sentry-Adapter mit console-Fallback | 68 |

**Pre-MVP-Security-Audit (S70): 🟢 alle 7 Bereiche clean.**

---

## Code-Inventur (Stand S76)

| Schicht | Anzahl |
| --- | --- |
| Mutating API-Routes | **10** (alle CSRF-protected) |
| Read API-Routes | **3** (`auth/me`, `auth/callback`, `ai/health`) |
| DB-Migrations | **8** |
| Pure-Helper-Module | **21** |
| Smoketest-Files | **45** (~1.100+ Asserts) |
| E2E-Spec-Files | **9** + 1 Helper (Phase 1.5) |
| E2E-Tests | **58** × 2 Browser = **116 Runs** in ~2:18 min |
| Bundle (shared) | **102 KB** |
| Bundle-Impact Sentry | **0 KB** (Adapter, lazy) |

---

## Helper-Module-Übersicht (`src/lib/`)

| Modul | Zweck | Sessions |
| --- | --- | --- |
| `account-businesses.ts` | Membership-Mapping + Single-Redirect | 43, 46, 63 |
| `ai-client.ts` | Browser → `/api/ai/generate` | 61 |
| `auth-status.ts` | Login-Status-Helper | 33 |
| `business-delete.ts` | DELETE-Submit-Wrapper | 69 |
| `business-image-upload.ts` | Logo/Cover/Service-Bild-Upload | 51, 58 |
| `business-settings.ts` | Settings-PATCH-Submit | 52 |
| `business-update.ts` | BusinessProfile-PATCH-Submit | 50 |
| `cn.ts` | Tailwind-Class-Merge | – |
| `csrf.ts` | Origin-Header-Check + enforceCsrf | 66 |
| `error-reporter.ts` | Sentry-Adapter / console-Fallback | 68 |
| `lead-retry-queue.ts` | localStorage-Retry mit Exp-Backoff | 64 |
| `lead-submit.ts` | Lead-POST-Submit | 44 |
| `mock-store/*` | Demo-Persistenz im Browser | 11–12 |
| `onboarding-validate.ts` | Slug-Regex + Reserved-List | 38 |
| `page-business.ts` | Layout↔Page-Dedup via React.cache | 48 |
| `review-request-template.ts` | Reviews-Channel-URLs | 53 |
| `services-storage-cleanup.ts` (sic in storage-cleanup.ts) | Storage-Walker | 56, 60, 69 |
| `services-update.ts` | Services-PUT-Submit | 55 |
| `social-post-format.ts` | Social-Plattform-Limits | 54 |
| `storage-cleanup.ts` | URL-Parse + Move + recursive-Remove | 56, 57, 60, 69 |
| `storage-slug-migration.ts` | Slug-Wechsel-Migration konsolidiert | 60 |
| `user-input-sanitize.ts` | XSS-Strip + Domain-Wrappers | 67 |

---

## Phase 1.5 — End-to-End-Test-Block ✅ (Sessions 71–76)

Komplette Demo-Mode-Coverage aller Owner- und Public-
Pages. Erfolgskriterium ≥25 mit **132 % Excess** erreicht.

| Session | Spec-File | Tests | Schwerpunkt |
| --- | --- | --- | --- |
| 71 | smoke-landing/login/public-site/account | 10 | Setup + Smoke |
| 72 | onboarding-flow | 7 | Onboarding-Flow (ID-Selektoren wegen Asterisk-Spans) |
| 73 | business-editor + dashboard-shell | 12 | Editor + Tab-Nav `:visible` |
| 74 | services-edit | 9 | Silber-CRUD + Bronze-Lock + `<details>`-DOM-API |
| 75 | settings-danger + `_helpers.ts` | 7 | Light-Pass + Firefox + Parallel |
| 76 | public-site | 13 | Render + Consent-Gating + `addInitScript` + Mobile-Viewport |
| **Σ** | **9 Files + 1 Helper** | **58** | **× 2 Browser = 116 Runs in 2:18 min** |

**Architektur-Lessons aus Phase 1.5**:
- ID-Selektoren > `getByLabel`, wenn Labels Asterisk-Spans haben.
- `:visible`-Filter für Mobile-Nav-Twins.
- `ul details` filtert Header-Switcher raus.
- DOM-API (`details.open = true`) statt Click bei sticky-Top-Bar-Overlay.
- `Promise.all([waitForURL, click])` für parallel-sichere Tab-Navigation.
- `addInitScript` für localStorage-Pre-Population (post-goto verpasst Mount).
- Singular/Plural-Regex bei deutschen UI-Texten (`(wartet|warten)`).

**Phase-2-Backlog aus Test-Findings**:
1. Default-Tier `silber` → `bronze`? (S72)
2. Branche → Theme-Auto-Empfehlung? (S72)
3. Verwerfen-isDirty-Reset (S73)
4. Status-Bar-Heading `<p>` → `<h2>` (A11y, S73)
5. Sticky-Status-Bar Touch/Mobile-UX (S74)
6. `beforeEach`-Migration für E2E-`goto()`-Wiederholung (S80-Light-Pass)

## Phase 2 — UI/UX-Polish (Sessions 77+, ≥10 Sessions)

- **77**: Public-Site-Audit (Hero, Service-Cards, Lead-Form, Footer, Theme-Tokens).
- **78**: Dashboard-Shell-Audit.
- **79**: Editor-Audits (alle 5 Editoren).
- **80** (Light-Pass): Form-System + Component-Reuse via `simplify`-Skill.
- **81**: **Demo-Logo + Brand-Identity** via `algorithmic-art` + `brand-guidelines`.
- **82**: Theme-Polish via `theme-factory` über alle 10 Themes.
- **83**: A11y-Audit (WCAG 2.2 AA, Focus, Reduced-Motion).
- **84**: Mobile/Tablet-Responsive-Audit.
- **85** (Light-Pass): Type-System-Pass.
- **86**: Lighthouse + Bundle-Cleanup + Production-Deploy-Doku.

Details: [`PROGRAM_PLAN.md`](./PROGRAM_PLAN.md) Sektion „Phase 2".

---

## Verwandte Dokumente
- [PROGRAM_PLAN.md](./PROGRAM_PLAN.md) — Roadmap
- [TESTING.md](./TESTING.md) — Smoketests + E2E-Anleitung
- [STORAGE.md](./STORAGE.md) — Storage-Architektur
- [AI.md](./AI.md) — AI-Schicht
- [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md) — DB-Schema + RLS
- [RUN_LOG.md](./RUN_LOG.md) — pro-Session-Log seit S1
- [CHANGELOG.md](../CHANGELOG.md) — User-facing Releases
