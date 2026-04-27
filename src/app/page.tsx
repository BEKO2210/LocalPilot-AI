import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MarketingHero } from "@/components/marketing/hero";
import { ProblemSolution } from "@/components/marketing/problem-solution";
import { IndustriesGrid } from "@/components/marketing/industries";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { Benefits } from "@/components/marketing/benefits";
import { MarketingFAQ } from "@/components/marketing/faq";
import { CtaContact } from "@/components/marketing/cta-contact";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <MarketingHero />
        <ProblemSolution />
        <IndustriesGrid />
        <PricingTeaser />
        <Benefits />
        <MarketingFAQ />
        <CtaContact />
      </main>
      <SiteFooter />
    </>
  );
}
