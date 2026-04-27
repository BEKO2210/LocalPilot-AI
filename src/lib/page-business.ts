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
 * Lädt einen Betrieb anhand des Slugs. Falls nicht vorhanden,
 * wirft `notFound()` (Next.js Server-Convention) — der Pfad
 * landet automatisch auf der 404-Page.
 *
 * Im Static-Export-Build und in SSR mit `LP_DATA_SOURCE=mock`
 * liest der Resolver aus den Mock-Daten. Mit `LP_DATA_SOURCE=
 * supabase` (und gesetzten ENVs) liest er aus der Tabelle
 * `public.businesses`. RLS aus Migrationen 0001/0007 sorgt
 * dafür, dass anon-Aufrufer nur veröffentlichte Betriebe sehen.
 */
export async function loadBusinessOrNotFound(
  slug: string,
  repo: BusinessRepository = getBusinessRepository(),
): Promise<Business> {
  const business = await repo.findBySlug(slug);
  if (!business) notFound();
  return business;
}

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
