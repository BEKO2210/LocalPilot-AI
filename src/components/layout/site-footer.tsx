import { Container } from "@/components/ui/container";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink-200 bg-ink-50">
      <Container className="flex flex-col gap-4 py-10 text-sm text-ink-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} LocalPilot AI – Universelles Website- und KI-System für lokale Betriebe.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a className="hover:text-ink-900" href="#impressum">Impressum</a>
          <a className="hover:text-ink-900" href="#datenschutz">Datenschutz</a>
          <a className="hover:text-ink-900" href="#kontakt">Kontakt</a>
        </div>
      </Container>
    </footer>
  );
}
