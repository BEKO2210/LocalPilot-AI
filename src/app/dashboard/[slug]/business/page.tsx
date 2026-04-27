import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard";
import { BusinessEditForm } from "@/components/dashboard/business-edit";
import {
  getMockBusinessBySlug,
  listMockBusinessSlugs,
} from "@/data";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return listMockBusinessSlugs().map((slug) => ({ slug }));
}

export const metadata = {
  title: "Betriebsdaten bearbeiten",
  robots: { index: false, follow: false },
};

export default async function DashboardBusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="business">
      <BusinessEditForm business={business} />
    </DashboardShell>
  );
}
