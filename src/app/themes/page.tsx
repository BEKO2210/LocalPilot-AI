import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemePreviewCard } from "@/components/theme";
import { getAllThemes } from "@/core/themes";

export const metadata: Metadata = {
  title: "Theme-Galerie",
  description:
    "Alle Designs, die für die Public Sites von LocalPilot AI verfügbar sind. " +
    "Bronze startet mit einem Theme, Silber bietet mehrere, Gold öffnet die Premium-Designs.",
};

export default function ThemesPage() {
  const themes = getAllThemes();

  return (
    <>
      <SiteHeader />
      <main>
        <Section bg="muted">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="lp-eyebrow">Designs</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {themes.length} Themes für lokale Betriebe.
              </h1>
              <p className="mt-4 text-ink-600">
                Jedes Theme legt Farben, Typografie, Buttons und Card-Stil fest.
                Die Auswahl passt sich automatisch an die Branche an –
                der Betrieb kann bei Bedarf wechseln.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => (
                <ThemePreviewCard key={theme.key} theme={theme} />
              ))}
            </div>
            <p className="mt-10 text-center text-xs text-ink-500">
              Themes lassen sich erweitern – Konvention und Anleitung in
              <code className="mx-1 rounded bg-white px-1.5 py-0.5">docs/THEMES.md</code>.
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
