import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PublicSiteNotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section>
          <Container>
            <div className="mx-auto max-w-xl text-center">
              <span className="lp-eyebrow">404</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Diesen Betrieb gibt es nicht (mehr).
              </h1>
              <p className="mt-4 text-ink-600">
                Vielleicht ist die Adresse veraltet oder der Betrieb hat seine
                Seite noch nicht veröffentlicht. In der Demo-Übersicht sehen
                Sie, welche Beispiele aktuell verfügbar sind.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <LinkButton href="/demo" size="lg">
                  Zur Demo-Übersicht
                </LinkButton>
                <LinkButton href="/" variant="outline" size="lg">
                  Zur Startseite
                </LinkButton>
              </div>
              <p className="mt-8 text-xs text-ink-500">
                <Link className="underline" href="/themes">
                  Themes
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
