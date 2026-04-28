import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { LocalPilotLockup } from "@/components/brand";

const NAV = [
  { href: "/#loesung", label: "Lösung" },
  { href: "/demo", label: "Demos" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pakete" },
  { href: "/themes", label: "Designs" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <Container className="flex h-16 items-center justify-between gap-6">
        <LocalPilotLockup className="text-brand-700" size="sm" />
        <nav className="hidden items-center gap-7 text-sm text-ink-700 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LinkButton
            href="/login"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Login
          </LinkButton>
          <LinkButton href="/onboarding" size="sm">
            Jetzt starten
          </LinkButton>
        </div>
      </Container>
    </header>
  );
}
