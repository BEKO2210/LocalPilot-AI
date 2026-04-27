# Storage-Architektur – LocalPilot AI

Recap der Storage-Hygiene-Pipeline nach den Code-Sessions
51–60. Alle Bild-Uploads + Cleanup-Pfade in einem Dokument.

> Stand 2026-04-27 · Sessions 51, 56, 57, 58, 59, 60.

---

## Bucket-Layout

Ein einziger öffentlicher Bucket: **`business-images`**.
Konfiguration:

| Property             | Wert                                      |
| -------------------- | ----------------------------------------- |
| `public`             | `true` (SELECT bypasst RLS)               |
| `file_size_limit`    | 5 MB                                      |
| `allowed_mime_types` | `image/png`, `image/jpeg`, `image/webp`   |
| SVG-Policy           | bewusst NICHT erlaubt (XSS-Vektor)        |
| INSERT/UPDATE/DELETE | nur Service-Role-Client (RLS-Bypass)      |

Migration: `supabase/migrations/0008_business_images_bucket.sql`
(Code-Session 51).

### Pfad-Konventionen

```
business-images/
├── <slug>/
│   ├── logo.<ext>           Code-Session 51
│   ├── cover.<ext>          Code-Session 51
│   └── services/
│       └── <serviceId>.<ext>  Code-Session 58
```

`<slug>` ist der aktuelle Business-Slug; `<serviceId>` ist eine
echte UUID v4 (kein Pseudo-`svc-…`-Prefix; Pseudo-IDs werden in
der UI gegated, siehe Session 58).

---

## Hygiene-Pipeline (alle vier Pfade)

```
                       ┌──────────────────────────────────┐
                       │   business-images/<slug>/...     │
                       │                                  │
              UPLOAD   │   logo.png   cover.jpg           │   DELETE
              ────────►│   services/<id>.png  …           │◄────────
              S51+S58  │                                  │   S56
                       └──────────────────────────────────┘
                                       ▲
                                       │ MOVE
                                       │ S57 + S59
                                       │ (konsolidiert in S60)
                                       │
                       ┌───────────────┴──────────────────┐
                       │   business-images/<new-slug>/    │
                       │   logo.png   cover.jpg           │
                       │   services/<id>.png  …           │
                       └──────────────────────────────────┘
```

### 1) Upload (Code-Sessions 51 + 58)

**Wer**: Owner über Dashboard.

**Wie**: `POST /api/businesses/[slug]/image`, multipart/form-data
mit `kind`, `file`, optional `serviceId`.

**Auth**: `getCurrentUser()` → 401, dann Server-Auth-Client
liest `businesses.id` (RLS prüft Owner) → 403 wenn 0 Zeilen.
Anschließend Service-Role-Client schreibt nach Bucket
(`upsert: true`).

**Pfad-Bau**: `buildStoragePath(slug, kind, mime, { serviceId })`
in `src/lib/business-image-upload.ts`.

**UI-Component**: `ImageUploadField` in
`src/components/dashboard/business-edit/image-upload-field.tsx`,
parametrisiert über `kind`, optional `serviceId`, `disabled`,
`compact`.

**Service-Image-Gating**: bei `kind="service"` ist `serviceId`
Pflicht und muss eine UUID v4 sein (Path-Injection-Schutz).
Pseudo-IDs aus der ServiceCard sperren das Feld mit Hint
„erst speichern, dann hochladen".

**Persistenz der URL**: NICHT durch die Upload-Route — die
liefert nur `publicUrl`/`path` zurück. Das Form
(`BusinessEditForm` / `ServiceCard`) ruft `setValue(...)` und
schreibt erst beim regulären „Speichern" in die DB
(`businesses.{logo_url, cover_image_url}` bzw.
`services.image_url`).

### 2) DELETE-Cleanup (Code-Session 56)

**Wer**: Owner entfernt einen Service über
`PUT /api/businesses/[slug]/services` (Bulk-Diff, Session 55).

**Wie**: Vor dem DB-DELETE der orphan-Services werden ihre
`image_url`-Werte über `extractStoragePath` auf den Bucket
gemappt; passende Pfade werden mit
`removeStoragePaths(adminClient, "business-images", paths)`
gelöscht.

**Graceful**: Storage-Errors werden nur `console.warn`-geloggt,
DB-DELETE läuft trotzdem. Sonst wäre der User aus seiner UI
gesperrt (Karte nicht löschbar).

**Response**: `imagesRemoved`, `imagesFailed`.

### 3) Slug-Wechsel-Move (Code-Sessions 57 + 59, konsolidiert in 60)

**Wer**: Owner ändert Slug via
`PATCH /api/businesses/[slug]/settings`.

**Wie**: Two-Phase-Pattern.
1. **Phase 1**: DB-UPDATE auf `businesses` (Slug + Published +
   Locale, fängt Postgres `23505` → 409). Atomic.
2. **Phase 2** (nur bei `slugChanged`):
   `migrateBusinessImagesOnSlugChange(deps, input)` läuft
   parallel über zwei Sub-Aufgaben:
   - **Logo + Cover**: zwei `storage.move()`-Calls, ein
     gesammelter `UPDATE businesses SET ...`.
   - **Service-Bilder**: SELECT alle `services` mit
     `image_url`, pro Row `Promise.all(move + URL-Build)`,
     dann `Promise.all(per-Row UPDATE services …)`.

**Pfad-Rewrite**: `rewritePathPrefix(path, oldSlug, newSlug)`
mit strikter `/`-Boundary, damit verwandte Slugs
(`studio-haarlinie-old` vs. `studio-haarlinie`) nicht
versehentlich kollidieren.

**Graceful**: Move-Failure → URL auf `null` gesetzt (kein
404-Bild auf der Public-Site, User muss neu hochladen).
DB-Errors nur geloggt. Helper liefert
`{ logoCover: {moved, failed}, services: {moved, failed} }`.

**Response der Route**: `imagesMoved`, `imagesFailed`,
`serviceImagesMoved`, `serviceImagesFailed`.

---

## Helper-Module

| Datei                                         | Verantwortung                                                  |
| --------------------------------------------- | -------------------------------------------------------------- |
| `src/lib/business-image-upload.ts`            | Upload-Validation, Pfad-Bau, `submitImageUpload` (S51+S58)     |
| `src/lib/storage-cleanup.ts`                  | URL-Parsing, `moveStoragePath`, `removeStoragePaths` (S56+S57) |
| `src/lib/storage-slug-migration.ts`           | High-level Slug-Migration über alle Spalten (S60)              |

Alle drei sind **pure** im Sinn von „dependency-injectable" —
Tests nutzen Stub-`SupabaseClient`-Objekte.

## Tests

| Test-Datei                                  | Asserts | Coverage                        |
| ------------------------------------------- | ------- | ------------------------------- |
| `src/tests/business-image-upload.test.ts`   | ~40     | Upload-Pfade, Service-FormData  |
| `src/tests/storage-cleanup.test.ts`         | ~52     | URL-Parse, Move, Remove         |
| `src/tests/storage-slug-migration.test.ts`  | ~38     | Helper end-to-end mit Stubs     |

Insgesamt ~130 Asserts auf der Storage-Schicht.

---

## Bekannte Lücken (Stand Session 69)

- ~~**Storage-Cleanup beim Business-Löschen**~~ ✅ erledigt
  in Session 69. `listAllPathsByPrefix` + `removeAllByPrefix`
  in `storage-cleanup.ts` löschen rekursiv alles unter
  `<slug>/` beim `DELETE /api/businesses/<slug>`. Stack-
  basierter Walker mit Pagination + Hard-Cap auf 10.000
  Files.
- **Service-DELETE während Bild-Upload läuft**: theoretische
  Race Condition. Falls der Upload schneller ist als der
  DELETE-Trigger, könnte ein Bild *nach* dem DELETE im Storage
  liegen. Nicht beobachtet, aber dokumentiert.
- **Race auf Slug-Wechsel + Service-Edit**: wenn ein Owner
  parallel den Slug ändert und einen neuen Service mit Bild
  speichert, kann das Bild unter dem *alten* Slug liegen.
  Akzeptierter Edge-Case (sehr selten, manuelles Re-Upload
  löst es).

---

## Verwandte Dokumente

- [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md) — `services.image_url`
  + `businesses.{logo_url, cover_image_url}` Spalten-Kontext.
- [BUSINESS_EDITOR.md](./BUSINESS_EDITOR.md) — Logo/Cover-UX.
- [SERVICES_EDITOR.md](./SERVICES_EDITOR.md) — Service-Image-UX.
- [RESEARCH_INDEX.md](./RESEARCH_INDEX.md) — Track A für
  Supabase-Storage-Quellen.
