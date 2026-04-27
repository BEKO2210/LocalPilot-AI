import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

const NAV = [
  { href: "/#loesung", label: "Lösung" },
  { href: "/#branchen", label: "Branchen" },
  { href: "/#pakete", label: "Pakete" },
  { href: "/themes", label: "Designs" },
  { href: "/demo", label: "Demo" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-ink-900"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold"
          >
            L
          </span>
          <span className="text-base">LocalPilot AI</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-700 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LinkButton href="/#kontakt" variant="outline" size="sm" className="hidden sm:inline-flex">
            Beratung anfragen
          </LinkButton>
          <LinkButton href="/#pakete" size="sm">
            Pakete ansehen
          </LinkButton>
        </div>
      </Container>
    </header>
  );
}
