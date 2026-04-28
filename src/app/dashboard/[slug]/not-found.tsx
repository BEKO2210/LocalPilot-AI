import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function DashboardNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section>
          <Container>
            <div className="mx-auto max-w-xl text-center">
              <span className="lp-eyebrow">404</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Diesen Demo-Betrieb gibt es nicht.
              </h1>
              <p className="mt-4 text-ink-600">
                Vielleicht ein Tippfehler im URL? In der Demo-Auswahl sehen
                Sie alle aktuell hinterlegten Demo-Betriebe.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <LinkButton href="/dashboard" size="lg">
                  Zur Demo-Auswahl
                </LinkButton>
                <LinkButton href="/" variant="outline" size="lg">
                  Zur Startseite
                </LinkButton>
              </div>
              <p className="mt-8 text-xs text-ink-500">
                <Link className="underline" href="/demo">
                  Public-Site-Demos
                </Link>
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
