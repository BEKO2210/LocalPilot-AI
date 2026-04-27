import { DashboardShell } from "@/components/dashboard";
import { ReviewsRequestPanel } from "@/components/dashboard/reviews/reviews-request-panel";
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
  title: "Bewertungs-Booster",
  robots: { index: false, follow: false },
};

export default async function DashboardReviewsPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);
  return (
    <DashboardShell business={business} active="reviews">
      <ReviewsRequestPanel business={business} />
    </DashboardShell>
  );
}
