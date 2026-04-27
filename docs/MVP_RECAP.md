# MVP-Recap – LocalPilot AI

Architektur-Übersicht zum Stand „erstes Betrieb-fertiges
Produkt" (~99%, Sessions 1–70). Nach Session 70 startet
**Phase 1.5: End-to-End-Tests** über mehrere Sessions, danach
Phase 2 (UI/UX-Polish + Demo-Logo).

> Stand 2026-04-27 · Sessions 1–70.

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

## Code-Inventur (Stand S70)

| Schicht | Anzahl |
| --- | --- |
| Mutating API-Routes | **10** (alle CSRF-protected) |
| Read API-Routes | **3** (`auth/me`, `auth/callback`, `ai/health`) |
| DB-Migrations | **8** |
| Pure-Helper-Module | **21** |
| Smoketest-Files | **45** |
| Smoketest-Asserts | **~1.100+** |
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

## Was nach MVP kommt

### Phase 1.5 — End-to-End-Test-Block (Sessions 71–~76)
**Vor** der UI/UX-Polish-Phase: alles wie ein End-User
durchspielen. Pro Session ein User-Flow als Playwright-
Test, beginnend bei den kritischen Pfaden.

- 71: Setup `webapp-testing`-Skill (Playwright +
  next-Playwright-Konfiguration). Erster E2E-Test:
  Login → Account-Liste → Dashboard.
- 72: Onboarding-Flow E2E: Magic-Link → Onboarding-Form →
  Slug-Validation → erster Betrieb angelegt → Auto-Redirect
  zu Dashboard.
- 73: Business-Editor-E2E: alle Felder, alle Tabs,
  Logo+Cover-Upload, Speichern, Verwerfen, Demo-Defaults
  laden.
- 74: Service-Liste-E2E: Add/Edit/Delete/Reorder, Limit-
  Erreichen, Service-Bild-Upload mit UUID-Gating.
- 75: Settings-E2E: Slug-Wechsel mit Storage-Move,
  Publish-Toggle, Locale, Danger-Zone-Löschen mit
  Slug-Confirmation.
- 76: Public-Site-E2E: Lead-Form ausfüllen, Hero/Services/
  FAQ rendern, Mobile-CTA-Streifen, Theme-Switcher.

Ergebnis: ~25 E2E-Tests + Anleitung in `TESTING.md`. Erst
wenn alle End-User-Flows grün sind, startet Phase 2.

### Phase 2 — UI/UX-Polish (Sessions ~77–~86+)
- Public-Site-Audit, Dashboard-Audit, Editor-Audits, Form-
  Konsistenz, **Demo-Logo (algorithmic-art-Skill)**, Theme-
  Polish (theme-factory), A11y, Mobile, Lighthouse.
- Details siehe `PROGRAM_PLAN.md` Sektion „Phase 2".

---

## Verwandte Dokumente
- [PROGRAM_PLAN.md](./PROGRAM_PLAN.md) — Roadmap
- [STORAGE.md](./STORAGE.md) — Storage-Architektur
- [AI.md](./AI.md) — AI-Schicht
- [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md) — DB-Schema +
  RLS-Policies
- [RUN_LOG.md](./RUN_LOG.md) — pro-Session-Log seit S1
- [CHANGELOG.md](../CHANGELOG.md) — User-facing Releases
