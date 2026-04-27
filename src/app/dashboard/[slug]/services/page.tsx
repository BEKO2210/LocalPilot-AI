import Link from "next/link";
import { Lock } from "lucide-react";
import {
  ComingSoonSection,
  DashboardShell,
} from "@/components/dashboard";
import { ServicesEditForm } from "@/components/dashboard/services-edit";
import {
  listSlugParams,
  loadBusinessOrNotFound,
} from "@/lib/page-business";
import { hasFeature } from "@/core/pricing";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export async function generateStaticParams(): Promise<Params[]> {
  return listSlugParams();
}

export const metadata = {
  title: "Leistungen verwalten",
  robots: { index: false, follow: false },
};

export default async function DashboardServicesPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);

  // Bronze: kein Service-Management. Statt einer kaputten UI zeigen wir
  // den Coming-Soon-Block mit Upgrade-Hinweis – die Liste auf der
  // Public Site funktioniert weiterhin (read-only).
  const canManage = hasFeature(business.packageTier, "service_management");
  if (!canManage) {
    return (
      <DashboardShell business={business} active="services">
        <ComingSoonSection
          business={business}
          title="Leistungen verwalten"
          description="Volle CRUD-Verwaltung der Leistungen ist ab Silber freigeschaltet. Im Bronze-Paket sehen Sie die hinterlegten Leistungen nur lesend in der Public Site."
          comingInSession={11}
          gatingFeature="service_management"
          upcomingFeatures={[
            "Anlegen, Bearbeiten, Aktivieren/Deaktivieren, Löschen",
            "Sortierung über Pfeil-Buttons",
            "Featured-Markierung für die Public Site",
            "Aus Branchen-Preset übernehmen",
            "Paket-Limit-Anzeige in Echtzeit",
          ]}
        />
        <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-700 shadow-soft">
          <Lock className="h-4 w-4 text-ink-500" aria-hidden />
          {business.services.length} Leistungen sind aktuell hinterlegt –{" "}
          <Link className="font-medium text-brand-700" href={`/site/${slug}`}>
            Public Site ansehen
          </Link>
          .
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell business={business} active="services">
      <ServicesEditForm business={business} />
    </DashboardShell>
  );
}
