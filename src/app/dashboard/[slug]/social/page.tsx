import { DashboardShell } from "@/components/dashboard";
import { SocialPostPanel } from "@/components/dashboard/social/social-post-panel";
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
  title: "Social-Media-Generator",
  robots: { index: false, follow: false },
};

export default async function DashboardSocialPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);
  return (
    <DashboardShell business={business} active="social">
      <SocialPostPanel business={business} />
    </DashboardShell>
  );
}
