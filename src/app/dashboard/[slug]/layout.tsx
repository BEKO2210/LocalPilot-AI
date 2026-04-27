import { loadBusinessOrNotFound } from "@/lib/page-business";

type LayoutProps = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

/**
 * Layout-Wrapper für `/dashboard/[slug]/*`. Validiert nur, dass der Slug
 * existiert; das eigentliche Shell-Rendering passiert in der jeweiligen
 * Page (damit Sub-Pages den `active`-Tab steuern können).
 *
 * **Dedup**: `loadBusinessOrNotFound` ist mit `React.cache()`
 * gewrappt — Layout und nachfolgende Page rufen es mit identischem
 * Slug, der zweite Aufruf trifft den Request-Scope-Cache und macht
 * keinen erneuten DB-Roundtrip.
 */
export default async function DashboardSlugLayout({
  params,
  children,
}: LayoutProps) {
  const { slug } = await params;
  await loadBusinessOrNotFound(slug);
  return <>{children}</>;
}
