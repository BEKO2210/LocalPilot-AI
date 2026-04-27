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
| `package_tier`     | `text`       | `check (in 'bronze','silver','gold','platinum')` |
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

## Roadmap

- **0002** (Session 38) — `services`-Tabelle mit FK auf `businesses(id)`.
- **0003** (Session 38) — `reviews`-Tabelle.
- **0004** (Session 39) — `faqs`-Tabelle.
- **0005** (Session 39) — `leads`-Tabelle mit `consents`-Sub-Struktur (DSGVO-Audit-Trail aus Code-Session 32).
- **0006** (Session 40) — `business_owners`-Tabelle (Multi-Tenant-Auth via `auth.users`-FK), RLS-Policies werden Owner-bezogen.
- **0007+** — Storage-Buckets für Logos und Hero-Bilder, Backup-Policy.
