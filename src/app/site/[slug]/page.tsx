import type { Metadata } from "next";
import {
  PublicBenefits,
  PublicContact,
  PublicFaq,
  PublicHero,
  PublicLocation,
  PublicMobileCtaBar,
  PublicOpeningHours,
  PublicProcess,
  PublicReviews,
  PublicServices,
  PublicSiteFooter,
  PublicSiteHeader,
  PublicTeam,
} from "@/components/public-site";
import { ThemeProvider } from "@/components/theme";
import { averageRatingByBusiness } from "@/data";
import { getPresetOrFallback } from "@/core/industries";
import { getThemeOrFallback } from "@/core/themes";
import {
  listSlugParams,
  loadBusinessOrNotFound,
} from "@/lib/page-business";
import { getBusinessRepository } from "@/core/database/repositories";

type Params = { slug: string };
type PageProps = {
  params: Promise<Params>;
};

/**
 * Erzeugt zur Build-Zeit eine statische Seite pro bekanntem Slug.
 *
 * Im Static-Export-Build und in SSR mit `LP_DATA_SOURCE=mock` sind
 * das die Mock-Slugs. In SSR mit `supabase` werden die Slugs aus
 * der Tabelle `public.businesses` gezogen (RLS-gefiltert). Mit
 * `dynamicParams = true` (Default) werden zusätzliche Slugs zur
 * Laufzeit on-demand gerendert — neue Betriebe nach Build-Zeit
 * funktionieren also auch.
 */
export async function generateStaticParams(): Promise<Params[]> {
  return listSlugParams();
}

/**
 * Pro-Business SEO-Meta. Title, Description und OpenGraph kommen direkt
 * aus dem Business-Datensatz, keine Branchen-Hardcodierung.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Hier nutzen wir das Repository direkt (statt
  // `loadBusinessOrNotFound`), weil Metadata bei unbekanntem Slug
  // nicht 404'en, sondern einfach leeres Metadata zurückgeben soll —
  // sonst kollidiert das mit dem 404-Pfad der Page selbst.
  const business = await getBusinessRepository().findBySlug(slug);
  if (!business) return {};

  const preset = getPresetOrFallback(business.industryKey);
  const title = `${business.name} – ${preset.label} in ${business.address.city}`;
  return {
    title,
    description: business.description,
    alternates: {
      canonical: `/site/${slug}/`,
    },
    openGraph: {
      type: "website",
      locale: "de_DE",
      title,
      description: business.description,
      siteName: business.name,
    },
    robots: { index: true, follow: true },
  };
}

const SECTION_ORDER = [
  "hero",
  "services",
  "benefits",
  "process",
  "reviews",
  "team",
  "faq",
  "contact",
  "opening_hours",
  "location",
] as const;

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);

  const preset = getPresetOrFallback(business.industryKey);
  const theme = getThemeOrFallback(business.themeKey);
  const averageRating = averageRatingByBusiness[business.id] ?? 0;

  // Reihenfolge bevorzugt aus Preset, mit defensivem Fallback.
  const recommended = preset.recommendedSections;
  const sectionOrder = SECTION_ORDER.filter(
    (s) =>
      recommended.includes(s as (typeof recommended)[number]) ||
      // immer am Ende sicherheitshalber zeigen, falls Daten vorhanden sind
      s === "contact" ||
      s === "opening_hours" ||
      s === "location",
  );

  return (
    <ThemeProvider theme={theme} as="div" className="min-h-screen">
      <PublicSiteHeader business={business} />
      <main id="main-content" className="pb-24 md:pb-0">
        {sectionOrder.map((sectionKey) => {
          switch (sectionKey) {
            case "hero":
              return (
                <PublicHero
                  key={sectionKey}
                  business={business}
                  preset={preset}
                  averageRating={averageRating}
                  reviewCount={business.reviews.length}
                />
              );
            case "services":
              return (
                <PublicServices key={sectionKey} services={business.services} />
              );
            case "benefits":
              return (
                <PublicBenefits
                  key={sectionKey}
                  benefits={preset.defaultBenefits}
                />
              );
            case "process":
              return (
                <PublicProcess
                  key={sectionKey}
                  steps={preset.defaultProcessSteps}
                />
              );
            case "reviews":
              return (
                <PublicReviews
                  key={sectionKey}
                  reviews={business.reviews}
                  averageRating={averageRating}
                />
              );
            case "team":
              return business.teamMembers.length > 0 ? (
                <PublicTeam key={sectionKey} members={business.teamMembers} />
              ) : null;
            case "faq":
              return <PublicFaq key={sectionKey} faqs={business.faqs} />;
            case "contact":
              return (
                <PublicContact
                  key={sectionKey}
                  business={business}
                  leadFormFields={preset.leadFormFields}
                />
              );
            case "opening_hours":
              return (
                <PublicOpeningHours
                  key={sectionKey}
                  openingHours={business.openingHours}
                />
              );
            case "location":
              return (
                <PublicLocation
                  key={sectionKey}
                  address={business.address}
                  contact={business.contact}
                />
              );
            default:
              return null;
          }
        })}
      </main>
      <PublicSiteFooter business={business} />
      <PublicMobileCtaBar business={business} />
    </ThemeProvider>
  );
}
