import { Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";

/**
 * Schluss-CTA der Marketing-Seite. Klar darauf ausgerichtet, dass die
 * nächste Aktion entweder Demo öffnen, Pakete vergleichen oder direkt
 * schreiben ist – kein abstrakter "Beratungstermin", sondern konkrete
 * nächste Schritte.
 */
export function CtaContact() {
  return (
    <Section id="kontakt" bg="brand">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
            Nächster Schritt
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Sehen Sie es live oder schreiben Sie uns direkt.
          </h2>
          <p className="mt-4 max-w-xl text-white/80">
            Sechs Demo-Sites und eine vollständige Funktions-Vergleichsliste
            stehen bereit. Wenn Sie konkret werden möchten, antworten wir
            innerhalb eines Werktags – ehrlich und unverbindlich.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/demo" size="lg" variant="secondary">
              Demo-Sites ansehen
            </LinkButton>
            <LinkButton
              href="/pricing"
              size="lg"
              variant="outline"
              className="bg-white text-ink-900"
            >
              Pakete vergleichen
            </LinkButton>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-wide text-white/70">
            Direkt sprechen
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/90">
            <li>
              <a
                href="mailto:hello@localpilot.ai"
                className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3 transition-colors hover:bg-white/10"
              >
                <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-ink-900">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">E-Mail</span>
                  <span className="block truncate text-xs text-white/70">
                    hello@localpilot.ai
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                href="tel:+493090009999"
                className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3 transition-colors hover:bg-white/10"
              >
                <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-ink-900">
                  <Phone className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">Telefon</span>
                  <span className="block truncate text-xs text-white/70">
                    +49 30 9000 9999 (Demo-Nummer)
                  </span>
                </span>
              </a>
            </li>
          </ul>
          <p className="mt-5 text-xs text-white/60">
            Erstgespräch unverbindlich. Wir empfehlen ehrlich, auch wenn das
            kleinere Paket reicht.
          </p>
        </div>
      </Container>
    </Section>
  );
}
