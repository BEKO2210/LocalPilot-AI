import { DashboardShell } from "@/components/dashboard";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
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
  title: "Einstellungen",
  robots: { index: false, follow: false },
};

export default async function DashboardSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);
  return (
    <DashboardShell business={business} active="settings">
      <SettingsForm business={business} />
    </DashboardShell>
  );
}
