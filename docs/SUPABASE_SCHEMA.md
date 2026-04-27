# Supabase-Schema – LocalPilot AI

> Lebendes Dokument. Jede neue Migration unter
> `supabase/migrations/<n>_<titel>.sql` bekommt hier einen Block.

## Strategie

- **Hybrid-Schema**: Top-Level-Felder als Spalten (für `WHERE` / `ORDER`),
  geschachtelte Strukturen (Adresse, Kontakt, Öffnungszeiten) als JSONB.
  Form ist im TypeScript-Code (`BusinessSchema` etc.) verbindlich, die DB
  speichert nur „freies" valides JSONB.
- **RLS aktiv überall** (Supabase-Best-Practice 2026). Read-only Policies
  zuerst, Write-Policies sobald Auth steht (Session 38+).
- **Migrations-Workflow**: nummeriert + idempotent (`if not exists`,
  `drop policy if exists`). Jede Migration ist einzeln per
  Supabase-Dashboard-SQL-Editor ausführbar — Supabase-CLI optional.

## Migrations

### 0001 — `businesses` (Code-Session 37)

Erste Tabelle. Spiegel der `Business`-Entität, ohne die Array-Kinder
(Services, Reviews, FAQs) — die folgen in eigenen Tabellen.

**Datei:** [`supabase/migrations/0001_businesses.sql`](../supabase/migrations/0001_businesses.sql)

**Spalten:**

| Spalte             | Typ          | Notizen                                          |
| ------------------ | ------------ | ------------------------------------------------ |
| `id`               | `uuid`       | PK, `default gen_random_uuid()`                  |
| `slug`             | `text`       | `unique`, indiziert                              |
| `name`             | `text`       | Pflicht                                          |
| `industry_key`     | `text`       | indiziert                                        |
| `package_tier`     | `text`       | `check (in 'bronze','silber','gold','platin')` (deutsch, matcht TS-Enum) |
| `locale`           | `text`       | Default `'de'`                                   |
| `tagline`          | `text`       | Pflicht                                          |
| `description`      | `text`       | Pflicht                                          |
| `logo_url`         | `text`       | optional                                         |
| `cover_image_url`  | `text`       | optional                                         |
| `theme_key`        | `text`       | Pflicht                                          |
| `primary_color`    | `text`       | optional, Hex                                    |
| `secondary_color`  | `text`       | optional, Hex                                    |
| `accent_color`     | `text`       | optional, Hex                                    |
| `address`          | `jsonb`      | Pflicht. Struktur: `{ street, city, postalCode, country }` |
| `contact`          | `jsonb`      | Default `'{}'`. Struktur: `ContactDetailsSchema` |
| `opening_hours`    | `jsonb`      | Default `'[]'`. Struktur: `OpeningHoursSchema`   |
| `is_published`     | `boolean`    | Default `false`, partial-indexed where true      |
| `created_at`       | `timestamptz`| Default `now()`                                  |
| `updated_at`       | `timestamptz`| Default `now()`, Trigger setzt bei UPDATE        |

**Indizes:**
- `businesses_slug_idx` (B-Tree, unique via `unique`-Constraint)
- `businesses_published_idx` (Partial: `where is_published = true`)
- `businesses_industry_idx` (B-Tree)

**RLS-Policies:**
- `Allow public read of published businesses` — `for select to anon, authenticated using (is_published = true)`. Public-Site darf ohne Auth.
- INSERT/UPDATE/DELETE: keine Policy → komplett blockiert. Wird in Session 38+ mit Owner-Tabelle + `auth.uid()` geöffnet.

**Trigger:**
- `businesses_set_updated_at` — `before update`, setzt `updated_at = now()`.

## Wie die Migration einspielen?

**Option A: Supabase-Dashboard** (am einfachsten)
1. https://supabase.com/dashboard/project/<dein-projekt>/sql/new
2. Inhalt von `supabase/migrations/0001_businesses.sql` einfügen
3. **Run**.

**Option B: Supabase-CLI** (für CI/CD)
```bash
npm i -g supabase
supabase login
supabase link --project-ref <ref>
supabase db push
```

## Repository-Layer

Der TypeScript-Code spricht **nicht** direkt mit Supabase-Tabellen, sondern
über das `BusinessRepository`-Interface in
[`src/core/database/repositories/business.ts`](../src/core/database/repositories/business.ts).

Der Resolver in `repositories/index.ts` wählt zwischen Mock und Supabase
anhand der `LP_DATA_SOURCE`-ENV:

```ts
LP_DATA_SOURCE=mock      // Default — liest aus mock-businesses.ts
LP_DATA_SOURCE=supabase  // liest aus public.businesses
```

Wenn `LP_DATA_SOURCE=supabase` aber kein Supabase-Client erstellbar ist
(`SUPABASE_URL` oder `SUPABASE_ANON_KEY` fehlt), fällt der Resolver hart
auf Mock zurück und loggt einen Hinweis nach `stderr`. Damit crasht
der Build nie.

### 0002 — `services` (Code-Session 38)

Eine Leistung gehört zu genau einem Betrieb (FK auf `businesses(id)` mit
`on delete cascade`).

**Datei:** [`supabase/migrations/0002_services.sql`](../supabase/migrations/0002_services.sql)

**Spalten (Auszug):**

| Spalte               | Typ            | Notizen                                    |
| -------------------- | -------------- | ------------------------------------------ |
| `id`                 | `uuid`         | PK                                         |
| `business_id`        | `uuid`         | FK → `businesses(id)` cascade, indiziert   |
| `category`, `title`  | `text`         | `title` Pflicht                            |
| `short_description`  | `text`         | Default `''`                               |
| `long_description`   | `text`         | Default `''`                               |
| `price_label`, `duration_label`, `image_url`, `icon` | `text` | optional |
| `tags`               | `text[]`       | Default `'{}'`                             |
| `is_featured`, `is_active` | `boolean`| Defaults `false` / `true`                  |
| `sort_order`         | `int`          | Default `0`                                |

**Indizes:**
- `services_business_id_idx`
- `services_active_sort_idx` (Partial: `where is_active = true`)
- `services_featured_idx` (Partial: `where is_featured = true`)

**RLS-Policy:** `Allow public read of active services on published businesses` —
Sub-Query `exists (select 1 from businesses where id = services.business_id and is_published)`.

### 0003 — `reviews` (Code-Session 38)

**Datei:** [`supabase/migrations/0003_reviews.sql`](../supabase/migrations/0003_reviews.sql)

**Spalten (Auszug):** `id`, `business_id` (FK cascade), `author_name`,
`rating int CHECK (1..5)`, `text`, `source CHECK (in 'google','facebook','internal')`,
`is_published`, `created_at`, `updated_at`.

**RLS-Policy:** `Allow public read of published reviews on published businesses`,
gleiche Form wie bei Services.

### 0004 — `faqs` (Code-Session 39)

**Datei:** [`supabase/migrations/0004_faqs.sql`](../supabase/migrations/0004_faqs.sql)

Read-only, FK auf `businesses(id)` cascade. RLS-Policy analog zu
Services + Reviews (`is_active = true and exists ...`).

**Spalten:** `id`, `business_id`, `question`, `answer`, `category`,
`sort_order`, `is_active`, `created_at`, `updated_at`.

### 0005 — `leads` (Code-Session 39)

**Datei:** [`supabase/migrations/0005_leads.sql`](../supabase/migrations/0005_leads.sql)

**Asymmetrische** RLS — anders als alle anderen Tabellen:

| Operation | anon                                                   | authenticated     |
| --------- | ------------------------------------------------------ | ----------------- |
| INSERT    | ✅ erlaubt, **nur** mit Consent + auf published-Betrieb | ✅                 |
| SELECT    | ❌ blockiert                                            | ✅ (alle, vorerst) |
| UPDATE    | ❌                                                      | ❌ (folgt Auth)    |
| DELETE    | ❌                                                      | ❌ (folgt Auth)    |

Anon-Submitter kann seinen eigenen Lead nicht zurücklesen — sonst könnte
ein bösartiges Form-Skript fremde Leads abgreifen. Der Form-Erfolgs-Pfad
muss ohne Re-Read auskommen.

**DSGVO-Audit-Trail**: `consent jsonb not null` mit
`CHECK (consent ? 'givenAt' AND consent ? 'policyVersion')`. Beide
Felder werden im Application-Layer gesetzt (ISO-Zeitstempel +
`PRIVACY_POLICY_VERSION` aus `src/core/legal.ts`). DSGVO Art. 7 Abs. 1
verlangt, dass der Verantwortliche nachweisen kann, gegen welchen
Stand der Datenschutzerklärung eingewilligt wurde — die `policyVersion`-
Spalte ist genau dieser Nachweis.

**Weitere CHECK-Constraints:**
- `leads_phone_or_email_required` — analog zum Zod-`refine`.
- `source` ∈ `{website_form, phone, whatsapp, email, walk_in, referral, social, other}`.
- `status` ∈ `{new, contacted, qualified, won, lost, archived}`.

## Embedding (PostgREST-Joins)

Das Repository (`src/core/database/repositories/business.ts`) lädt
Services, Reviews und FAQs **in einem einzigen Roundtrip** per FK-Embed:

```ts
.from("businesses")
.select(`${columns}, services(*), reviews(*), faqs(*)`)
.eq("slug", slug)
.maybeSingle();
```

RLS wird pro Embed automatisch ausgewertet — fehlende Permission liefert
ein leeres Array, kein Fehler. Damit verschwindet das N+1-Risiko, das
naive `for-each-business: select services` hätte.

`leads` wird **bewusst nicht** eingebettet: anon darf nicht SELECTen,
also wäre der Embed leer; auch für authenticated-User wollen wir Leads
nur explizit pro Anfrage laden, nicht als Beifang an jedem Business-Read.

## Lead-Repository (Code-Session 40)

Schreibe-Pfad für das Public-Form, parallel zum
`BusinessRepository`. Datei:
[`src/core/database/repositories/lead.ts`](../src/core/database/repositories/lead.ts).

```ts
const repo = getLeadRepository();
const lead = await repo.create({
  businessId: "...",
  name: "...",
  email: "...",
  consent: { givenAt: new Date().toISOString(), policyVersion: PRIVACY_POLICY_VERSION },
});
```

### RLS-Falle (wichtig!)

PostgREST macht nach `insert(...)` einen impliziten SELECT, um die
geschriebene Zeile zurückzugeben. Unter unserer **asymmetrischen RLS**
(anon darf nicht lesen, Migration 0005) scheitert dieser SELECT mit
`42501 row-level security violation` — der INSERT ist erfolgreich,
aber die Antwort ist ein Fehler.

**Lösung im Repository**: ID + Timestamps **client-side** generieren
(`randomUUID()`, `new Date().toISOString()`), INSERT **ohne**
`.select()`-Chain ausführen. Wir geben das selbst gebaute Lead-Objekt
zurück — inhaltsidentisch zur DB-Zeile.

### Error-Mapping

`LeadRepositoryError.kind` bündelt Postgres-Codes auf 5 stabile Kinds:

| Kind         | Postgres-Code       | Bedeutung                                     |
| ------------ | ------------------- | --------------------------------------------- |
| `validation` | (lokal, Zod)        | Eingabe genügt nicht `LeadSchema`             |
| `rls`        | `42501`, `PGRST116`, `PGRST301` | RLS-Verletzung (z. B. Betrieb nicht published, Consent fehlt) |
| `constraint` | `23502/23514/23503/23505` | NOT NULL / CHECK / FK / UNIQUE              |
| `network`    | (Fetch-Layer)       | Netzwerk-/Timeout-Fehler                      |
| `unknown`    | (sonst)             | Sonstige PostgREST-Fehler                     |

### 0006 — `business_owners` (Code-Session 41)

Multi-Tenant-Bindung User ↔ Betrieb. M:N via Junction-Table mit Rollen.

**Datei:** [`supabase/migrations/0006_business_owners.sql`](../supabase/migrations/0006_business_owners.sql)

**Spalten:** `id`, `business_id` (FK businesses cascade), `user_id`
(FK `auth.users` cascade), `role text CHECK (in 'owner','editor','viewer')`
default `'owner'`, `created_at`. Unique `(business_id, user_id)` —
ein User-Business-Paar nur einmal.

**Helper-Funktionen** (beide `security definer stable`, damit aus
nachgelagerten RLS-Policies aufrufbar ohne Recursion):

- `is_business_owner(business_id, user_id default auth.uid())` →
  `true` für Rollen `owner` oder `editor`. Schreibe-Pfad-Check.
- `has_business_access(business_id, user_id default auth.uid())` →
  `true` für jede Rolle (auch `viewer`). Lese-Pfad-Check für private
  Daten wie Leads.

**RLS auf `business_owners` selbst:**

| Operation | Policy                                                              |
| --------- | ------------------------------------------------------------------- |
| SELECT    | User sieht eigene Membership-Zeilen (`user_id = auth.uid()`)         |
| INSERT    | nur bestehender Owner darf Mitglieder hinzufügen (Initial via service-role) |
| UPDATE    | nur Owner darf Rollen ändern                                         |
| DELETE    | Owner ODER User selbst (Self-Service-Verlassen)                      |

### 0007 — Owner-scoped RLS-Policies (Code-Session 41)

**Datei:** [`supabase/migrations/0007_owner_rls_policies.sql`](../supabase/migrations/0007_owner_rls_policies.sql)

Erweitert `businesses`/`services`/`reviews`/`faqs`/`leads` um
Owner-scoped Policies. Public-Read-Policies bleiben unverändert,
mit einer Ausnahme: die temporäre `"Allow authenticated read of all
leads"` aus 0005 wird durch eine Owner-scoped Policy ersetzt.

**RLS-Operations-Matrix nach 0007:**

| Tabelle      | anon SELECT      | auth (Owner) SELECT | auth (Owner) INSERT | auth (Owner) UPDATE | auth (Owner) DELETE |
| ------------ | ---------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| `businesses` | ✅ wenn published | ✅ alle eigenen      | ❌ (service-role)    | ✅ eigene            | ✅ eigene            |
| `services`   | ✅ aktiv+pub      | ✅ alle eigene       | ✅ eigene            | ✅ eigene            | ✅ eigene            |
| `reviews`    | ✅ pub+pub        | ✅ alle eigene       | ✅ eigene            | ✅ eigene            | ✅ eigene            |
| `faqs`       | ✅ aktiv+pub      | ✅ alle eigene       | ✅ eigene            | ✅ eigene            | ✅ eigene            |
| `leads`      | ❌                | ✅ via `has_business_access` | ✅ (anon) mit Consent | ✅ (owner/editor) eigene | ✅ (nur owner) eigene |

`businesses INSERT` bleibt blockiert wegen Henne-Ei: ein neuer Betrieb
hat keine Owner, also keinen Insert-Berechtigten. Der Onboarding-Pfad
nutzt einen `service_role`-Client, der RLS umgeht (Code-Session 42+).

## SSR-Auth-Stack (Code-Session 42)

`@supabase/ssr` füllt die Auth-Cookies. Drei Berührungspunkte:

- **Server**: `createServerSupabaseClient()` in
  [`src/core/database/supabase-server.ts`](../src/core/database/supabase-server.ts).
  Wird in Server Components und Route Handlers benutzt.
  `getCurrentUser()` validiert via `auth.getUser()` (nicht
  `getSession()` — letzteres wäre spoof-bar).
- **Browser**: `getBrowserSupabaseClient()` in
  [`src/core/database/supabase-browser.ts`](../src/core/database/supabase-browser.ts).
  Singleton, liest `NEXT_PUBLIC_SUPABASE_*`.
- **Middleware**: [`middleware.ts`](../middleware.ts) refresht den
  Token vor jedem Request. Wenn die ENV nicht konfiguriert ist, ist
  die Middleware ein No-Op — die Plattform läuft im Mock-Modus weiter.

### Routes

- **`POST /api/auth/magic-link`** — Body `{ email, redirectTo? }`.
  Sendet Magic-Link via `signInWithOtp`. `redirectTo` wird gegen
  `^/[a-zA-Z0-9_\-/]*$` validiert (Open-Redirect-Schutz). Antwortet
  immer mit der gleichen 200-Message — kein User-Enumeration-Leak.
- **`GET /api/auth/callback?code=...&next=...`** — Tausch via
  `exchangeCodeForSession`, dann redirect auf `next` (gleiche
  Path-Validierung). Bei Fehler redirect auf `/login?error=...`.

### Pages (Code-Session 43)

- **`/login`** — Static-prerenderable Server Component. Enthält
  den `<LoginForm>` (Client) und `<LoginErrorBanner>` (Client mit
  `useSearchParams` in `<Suspense>`, damit der Server-Pfad ohne
  `await searchParams` auskommt — sonst Static-Export-Bruch).
- **`/account`** — Reine Client Component. Holt den User über
  `getBrowserSupabaseClient().auth.getUser()`. Vier Zustände:
  `loading`, `authed` (E-Mail + User-ID + Logout), `guest` (Link
  nach `/login`), `unconfigured` (Demo-Modus-Hinweis, falls
  `NEXT_PUBLIC_SUPABASE_*` nicht gesetzt).
- **Footer-Link**: bisher nicht ergänzt — folgt mit der Multi-
  Tenant-Wiring-Session, sobald „Mein Account" inhaltlich mehr
  zeigt als nur die User-ID.

### Business-Update-Pfad (Code-Session 50)

`PATCH /api/businesses/[slug]` ist scharf. Pfad:

1. `getCurrentUser()` → 401 wenn nicht eingeloggt.
2. Body als snake_case-Row akzeptiert (vom Form-Helper geliefert),
   intern wieder in camelCase gemappt und gegen
   `BusinessProfileSchema` validiert. Bei Failure: 400 mit
   `fieldErrors`.
3. **Server-Auth-Client** (`createServerSupabaseClient()`) führt
   das UPDATE aus — explizit NICHT der Service-Role-Client. Damit
   greift die Migration-0007-Policy „Allow owner to update own
   business" automatisch: ein User, der nicht im
   `business_owners`-Eintrag des Slugs ist, sieht das UPDATE auf
   0 Zeilen reduziert.
4. Trifft das UPDATE 0 Zeilen → 403 mit kombinierter „Owner oder
   Slug existiert nicht"-Meldung (kein Existenz-Leak).
5. Postgres `23505` (unique-violation auf Slug) → 409.

### Lead-Read-Pfad (Code-Session 49)

`LeadRepository.listForBusiness(businessId)` ergänzt den Schreibe-
Pfad aus Session 40. Drei Beobachtungen:

1. **Mock-Pfad** seedet beim Boot mit `leadsByBusiness` aus
   `src/data` — sodass Dashboard-Liste auch im Static-Build die
   Demo-Anfragen pro Betrieb zeigt.
2. **Supabase-Pfad** filtert via `eq("business_id", id)` +
   RLS (`has_business_access` aus Migration 0007). Sortierung
   `order("created_at", { ascending: false })`.
3. **Sort-Stabilität**: bei mehreren Leads mit gleichem
   `created_at` (z. B. Bulk-Import) ist die Reihenfolge
   undefined. Pagination werden wir mit `range()` und einem
   stabilen `order` über zwei Spalten ergänzen, sobald die
   Liste produktiv groß wird.

### Public-Lead-Form-Pfad (Code-Session 44)

`POST /api/leads` ist scharf. Form schreibt parallel:

1. **localStorage** (sofort, sync) — sorgt dafür, dass das Demo-
   Dashboard weiterhin Daten zeigt, bis dessen Read-Pfad ebenfalls
   auf Supabase migriert ist.
2. **Server** via `getLeadRepository().create(input)` — landet in
   Supabase, wenn `LP_DATA_SOURCE=supabase` UND ENV gesetzt sind.

Der Submit ist „server-tolerant": jeder Server-Fehler (404, 4xx,
5xx, Timeout) endet trotzdem in einem User-sichtbaren „Anfrage
gesendet". Bei `local-fallback` (Server warf, localStorage hat
funktioniert) erscheint zusätzlich ein dezenter Hinweis-Banner:
„Wir haben Ihre Anfrage gespeichert, der Versand an den Betrieb
läuft, sobald wir wieder online sind.".

Static-Pages-Build: `/api/leads` wird durch
`pageExtensions: ["tsx","jsx"]` ausgeschlossen, fetch liefert 404,
Form fällt **silent** auf den localStorage-Pfad zurück (kein
Hinweis nötig — das ist der erwartete Demo-Zustand).

### Onboarding-Pfad (Code-Session 45)

`POST /api/onboarding` ist scharf. Pfad:
1. `getCurrentUser()` (Cookie-Check, RLS-konform) → `userId`.
2. `validateOnboarding(input)` → field-genaue Errors oder
   `OnboardingValidInput`.
3. Reservierter-Slug-Check (`isReservedSlug`) gegen Liste der
   System-Pfade (admin, api, dashboard, login, …).
4. `createBusinessForUser(userId, validInput)` mit dem
   Service-Role-Client (`@/core/database/supabase-service.ts`,
   `import "server-only"`-gegated):
   - Insert in `businesses` (RLS via `service_role` bypassed).
   - Insert in `business_owners` mit `role='owner'`.
   - Bei `business_owners`-Fehler: Kompensations-DELETE auf
     `businesses` (kein dangling business ohne Owner).
5. 201 mit `{ ok, slug, businessId }`.

**Status-Mapping**:
- `OnboardingError.kind = "not_configured"` → 503.
- `kind = "slug_taken"` (Postgres 23505) → 409.
- `kind = "constraint"` (23xxx generic) → 422.
- `kind = "unknown"` → 500.

`SUPABASE_SERVICE_ROLE_KEY` darf NIEMALS im Client-Bundle landen.
Der Service-Client-File hat `import "server-only"` als statischen
Schutz — Next.js bricht den Build, wenn ein Client Component das
importiert.

### Account-Page-Read (Code-Session 46)

`/account` lädt nach erfolgreichem `auth.getUser()` die Liste der
Betriebe des aktuellen Users via PostgREST-Embed:

```ts
.from("business_owners")
.select("role, businesses(id, slug, name, industry_key, package_tier, tagline, is_published)")
.eq("user_id", userId);
```

RLS auf `business_owners` filtert bereits via Policy auf
`user_id = auth.uid()`. Der explizite `.eq("user_id", userId)` ist
redundant zur RLS, macht den Intent aber im Code sichtbar — und
schützt davor, dass jemand das Repo versehentlich mit dem
Service-Role-Client aufruft (der RLS bypassed).

Pure-Mapping-Schicht: `src/lib/account-businesses.ts`
mit `mapMembershipRow`, das defensiv beide Embed-Formen normalisiert:

- PostgREST many-to-one: liefert ein Single-Object oder `null`.
- supabase-js v2: typisiert konservativ als Array.

`unwrapEmbed` greift in beiden Fällen das erste Objekt heraus.

### Page-Loader (Code-Session 47/48)

`src/lib/page-business.ts` ist die zentrale Server-Side-Brücke
zwischen Page-Komponenten und `BusinessRepository`:

- `loadBusinessOrNotFound(slug)` — `React.cache()`-gewrappt,
  wirft `notFound()` aus `next/navigation`, wenn der
  Repository-Pfad nichts liefert. Pro Render-Pass max. ein
  Roundtrip pro Slug (Layout + Page sind dedupliziert).
- `loadBusinessOrNotFoundWith(slug, repo)` — Test-Variante
  mit injizierbarem Repository (kein Cache).
- `listSlugParams()` — direkt verwendbar in
  `generateStaticParams`. Liefert `[{slug:"…"}, …]` aus dem
  konfigurierten Repository.

Public-Site `/site/[slug]/*` und Dashboard `/dashboard/[slug]/*`
sind seit Session 48 vollständig auf diesen Pfad umgestellt.
`generateMetadata`-Funktionen rufen das Repository direkt auf
(statt `loadBusinessOrNotFound`) — Metadata darf bei unbekanntem
Slug nicht 404'en, sonst kollidiert das mit dem Page-404-Pfad.

### Roadmap

- **Session 49+** — Onboarding-Wizard mehrstufig (Adresse + Logo), Member-Verwaltung, Slug-Live-Check, Default-Redirect bei einem Betrieb, Lead-`leadsByBusiness`-Read aus DB (aktuell noch Mock-Direktzugriff im Dashboard).
- **0008+** — Storage-Buckets für Logos und Hero-Bilder, Backup-Policy.
