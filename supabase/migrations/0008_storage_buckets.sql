-- ===========================================================================
-- LocalPilot AI · Migration 0008 · Storage-Bucket "business-images"
-- ===========================================================================
-- Code-Session 51 · 2026-04-27
--
-- Bucket für Logos und Hero-Bilder pro Betrieb.
--
-- Design-Entscheidungen:
--   - **public=true**: Logos erscheinen auf der öffentlichen Site,
--     anonyme Besucher müssen sie ohne Auth lesen können. Public-
--     Buckets bypassen RLS bei SELECT — kein explizites Read-Policy
--     nötig. Bei UPDATE/DELETE/INSERT greifen weiterhin Policies.
--   - **file_size_limit = 5 MB**: groß genug für hochauflösende
--     Logos, klein genug, um Missbrauch zu verhindern.
--   - **allowed_mime_types**: nur PNG, JPEG, WebP. SVG ist bewusst
--     ausgeschlossen — XSS-Risiko durch eingebetteten Script-Tag.
--   - **Schreibe-Pfad ausschließlich Service-Role**: keine
--     INSERT-/UPDATE-/DELETE-Policy auf `storage.objects` für
--     dieses Bucket. Damit kann anon NICHTS direkt hochladen oder
--     löschen — die Server-Route mit Auth-Gate ist der einzige
--     Schreibe-Pfad.
--
-- Pfad-Konvention:
--   `<slug>/<kind>.<ext>` — z. B. `studio-haarlinie/logo.png`.
--   Slug-basiert für saubere CDN-URLs. Bei Slug-Wechsel werden
--   die alten Dateien zu Waisen — Cleanup ist Folge-Plan-Item
--   (Session-Cluster „Slug-Rename-Cleanup" in PROGRAM_PLAN).
-- ===========================================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'business-images',
  'business-images',
  true,
  5242880, -- 5 MB
  array['image/png','image/jpeg','image/webp']
)
on conflict (id) do update
  set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Hinweis zu RLS auf storage.objects:
-- Public-Bucket → SELECT ist offen. INSERT/UPDATE/DELETE sind
-- ohne explizite Policy blockiert für anon und authenticated.
-- Server-Routen nutzen den Service-Role-Client — der bypasst RLS
-- und kann dadurch hochladen, ohne dass wir hier Policies pflegen
-- müssen.
--
-- Sobald wir client-side Direct-Upload erlauben wollen (z. B. für
-- große Dateien, signed URLs), kommt eine INSERT-Policy mit
-- `is_business_owner(...)`-Check über einen Helper, der den
-- business_slug aus dem Pfad extrahiert.

comment on column storage.buckets.id is
  'business-images: Logos + Hero-Bilder pro Betrieb. Code-Session 51.';
