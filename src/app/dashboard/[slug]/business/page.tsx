import { DashboardShell } from "@/components/dashboard";
import { BusinessEditForm } from "@/components/dashboard/business-edit";
import {
  listSlugParams,
  loadBusinessOrNotFound,
} from "@/lib/page-business";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export async function generateStaticParams(): Promise<Params[]> {
  return listSlugParams();
}

export const metadata = {
  title: "Betriebsdaten bearbeiten",
  robots: { index: false, follow: false },
};

export default async function DashboardBusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);

  return (
    <DashboardShell business={business} active="business">
      <BusinessEditForm business={business} />
    </DashboardShell>
  );
}
