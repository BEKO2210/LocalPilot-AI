import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LocalPilotMark } from "@/components/brand";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink-200 bg-ink-50">
      <Container className="flex flex-col gap-4 py-10 text-sm text-ink-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2">
          <LocalPilotMark className="h-5 w-5 text-brand-700" aria-hidden />
          <span>
            &copy; {year} LocalPilot AI – Universelles Website- und KI-System
            für lokale Betriebe.
          </span>
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link className="lp-focus-ring rounded-sm hover:text-ink-900" href="/impressum">
            Impressum
          </Link>
          <Link className="lp-focus-ring rounded-sm hover:text-ink-900" href="/datenschutz">
            Datenschutz
          </Link>
          <a className="lp-focus-ring rounded-sm hover:text-ink-900" href="#kontakt">
            Kontakt
          </a>
        </div>
      </Container>
    </footer>
  );
}
