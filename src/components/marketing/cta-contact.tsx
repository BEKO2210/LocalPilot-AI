import { Calendar, Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";

/**
 * Schluss-CTA der Marketing-Seite. Konkretes „Pilot-Slot
 * reservieren" statt abstrakter Beratung. Demo-Kontaktdaten
 * klar als Demo gekennzeichnet (Phase 3, S85). Echter
 * Kontakt-Kanal kommt mit S87 (Domain + Email-Setup).
 */
export function CtaContact() {
  return (
    <Section id="kontakt" bg="brand">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
            Pilotwelle 2026
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Reservieren Sie einen 7-Tage-Pilot-Slot.
          </h2>
          <p className="mt-4 max-w-xl text-white/80">
            3 Monate kostenlos, Setup-Fee 50 % reduziert, gegen
            schriftliche Case-Study-Erlaubnis nach 30 Tagen Live-
            Betrieb. Plätze sind begrenzt — wir machen pro Welle
            3–5 Betriebe gleichzeitig, damit jeder die Aufmerksamkeit
            bekommt, die er braucht.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/demo" size="lg" variant="secondary">
              Erst Demo-Sites ansehen
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
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-white/70">
            <Calendar className="h-4 w-4" aria-hidden />
            Erstgespräch: 15–30 Min. Wir empfehlen ehrlich, auch wenn
            das kleinere Paket reicht.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-100/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-200">
            Demo-Kontakt
          </span>
          <p className="mt-3 text-sm font-medium uppercase tracking-wide text-white/70">
            Direkt sprechen
          </p>
          <p className="mt-2 text-xs text-white/70">
            Aktuell laufen die ersten Pilotkunden-Onboardings.
            Echter Kontakt-Kanal kommt mit Phase 3 (bis Session 100).
            Bis dahin: GitHub-Issue oder direkter Auftraggeber-Kontakt.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3">
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-ink-900">
                <Mail className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">E-Mail (Demo)</span>
                <span className="block truncate text-xs text-white/70">
                  hello@localpilot.ai · noch nicht aktiv
                </span>
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3">
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-ink-900">
                <Phone className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">Telefon (Demo)</span>
                <span className="block truncate text-xs text-white/70">
                  Echte Hotline ab Session 87 (Domain-Setup)
                </span>
              </span>
            </li>
          </ul>
        </div>
      </Container>
    </Section>
  );
}
