import { cache } from "react";
import { notFound } from "next/navigation";
import {
  getBusinessRepository,
  type BusinessRepository,
} from "@/core/database/repositories";
import type { Business } from "@/types/business";

/**
 * Page-Business-Loader (Code-Session 47).
 *
 * Zentraler Server-Side-Pfad zwischen Page-Komponenten und
 * `BusinessRepository`. Vorher griffen Pages direkt auf
 * `getMockBusinessBySlug` zu — damit war der Repository-Wechsel
 * (`LP_DATA_SOURCE`) wirkungslos für die UI. Diese Helper-Schicht
 * macht den Switch transparent für die Pages.
 *
 * **Wichtig**: nur in Server Components / Route Handlers
 * importieren. Im Client würde `notFound()` aus `next/navigation`
 * ohnehin nicht funktionieren — der Pfad ist server-only by design.
 */

/**
 * Test-Pfad: erlaubt, ein konkretes Repository zu injizieren,
 * z. B. `createMockBusinessRepository(...)` mit einer bestimmten
 * Liste. Wird im Production-Code NICHT direkt benutzt — das macht
 * `loadBusinessOrNotFound` mit React-Cache.
 */
export async function loadBusinessOrNotFoundWith(
  slug: string,
  repo: BusinessRepository,
): Promise<Business> {
  const business = await repo.findBySlug(slug);
  if (!business) notFound();
  return business;
}

/**
 * Lädt einen Betrieb anhand des Slugs. Falls nicht vorhanden,
 * wirft `notFound()` (Next.js Server-Convention) — der Pfad
 * landet automatisch auf der 404-Page.
 *
 * Im Static-Export-Build und in SSR mit `LP_DATA_SOURCE=mock`
 * liest der Resolver aus den Mock-Daten. Mit `LP_DATA_SOURCE=
 * supabase` (und gesetzten ENVs) liest er aus der Tabelle
 * `public.businesses`. RLS aus Migrationen 0001/0007 sorgt
 * dafür, dass anon-Aufrufer nur veröffentlichte Betriebe sehen.
 *
 * **Request-Scope-Dedup**: Mit `React.cache()` wird jeder Slug
 * pro Render-Pass nur einmal geladen — entscheidend, weil das
 * Dashboard layout.tsx + page.tsx beide aufrufen. Im Supabase-
 * Modus spart das pro Page-Render genau einen Roundtrip. Der
 * Cache-Key ist `slug` (single argument) — stabil pro Request.
 */
export const loadBusinessOrNotFound = cache(
  async (slug: string): Promise<Business> => {
    return loadBusinessOrNotFoundWith(slug, getBusinessRepository());
  },
);

/**
 * Liefert die Liste aller bekannten Slugs — für
 * `generateStaticParams`. Im Static-Export sind das die Mock-
 * Slugs. In SSR mit Supabase: Slugs aller veröffentlichten
 * Betriebe (RLS-gefiltert).
 *
 * Mit `dynamicParams = true` (Next.js-Default) werden zusätzliche
 * Slugs zur Laufzeit on-demand gerendert — neue Betriebe nach
 * Build-Zeit funktionieren also auch.
 */
export async function listBusinessSlugsForPages(
  repo: BusinessRepository = getBusinessRepository(),
): Promise<readonly string[]> {
  return repo.listSlugs();
}

/**
 * Convenience für `generateStaticParams`-Aufrufer:
 * `[{ slug: "studio-haarlinie" }, …]` direkt zurückliefern.
 */
export async function listSlugParams(): Promise<{ readonly slug: string }[]> {
  const slugs = await listBusinessSlugsForPages();
  return slugs.map((slug) => ({ slug }));
}
