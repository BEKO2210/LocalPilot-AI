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

## Roadmap

- **0006** (Session 40) — `business_owners`-Tabelle (Multi-Tenant-Auth via `auth.users`-FK), RLS-Policies werden Owner-bezogen.
- **0006a** (Session 40) — Lead-Repository mit Insert-Pfad für das Public-Form (`createMockLeadRepository` + `createSupabaseLeadRepository`).
- **0007+** — Storage-Buckets für Logos und Hero-Bilder, Backup-Policy.
