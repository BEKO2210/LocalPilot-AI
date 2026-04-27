import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MarketingHero } from "@/components/marketing/hero";
import { ProblemSolution } from "@/components/marketing/problem-solution";
import { ValueRoi } from "@/components/marketing/value-roi";
import { IndustriesGrid } from "@/components/marketing/industries";
import { DemoShowcase } from "@/components/marketing/demo-showcase";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { OnboardingPromise } from "@/components/marketing/onboarding-promise";
import { Benefits } from "@/components/marketing/benefits";
import { Testimonials } from "@/components/marketing/testimonials";
import { MarketingFAQ } from "@/components/marketing/faq";
import { CtaContact } from "@/components/marketing/cta-contact";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* 1. Hook + Versprechen */}
        <MarketingHero />
        {/* 2. Problem & Lösung – warum überhaupt? */}
        <ProblemSolution />
        {/* 3. Was bringt's konkret? (ROI) */}
        <ValueRoi />
        {/* 4. Welche Branchen? – Karten verlinken auf Demo-Sites */}
        <IndustriesGrid />
        {/* 5. Beweis: 6 echte Demo-Sites */}
        <DemoShowcase />
        {/* 6. Pakete – Bronze/Silber/Gold mit Link nach /pricing */}
        <PricingTeaser />
        {/* 7. Onboarding – wie wird's praktisch? */}
        <OnboardingPromise />
        {/* 8. Vorteile – Mobile, KI-Mock, Wachstum etc. */}
        <Benefits />
        {/* 9. Stimmen – Beispiel-Testimonials, klar markiert */}
        <Testimonials />
        {/* 10. FAQ – Einwände abräumen */}
        <MarketingFAQ />
        {/* 11. Schluss-CTA – konkrete nächste Schritte */}
        <CtaContact />
      </main>
      <SiteFooter />
    </>
  );
}
