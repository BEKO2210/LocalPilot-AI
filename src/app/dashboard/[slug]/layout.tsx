import { notFound } from "next/navigation";
import { getMockBusinessBySlug } from "@/data";

type LayoutProps = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

/**
 * Layout-Wrapper für `/dashboard/[slug]/*`. Validiert nur, dass der Slug
 * existiert; das eigentliche Shell-Rendering passiert in der jeweiligen
 * Page (damit Sub-Pages den `active`-Tab steuern können).
 */
export default async function DashboardSlugLayout({
  params,
  children,
}: LayoutProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();
  return <>{children}</>;
}
