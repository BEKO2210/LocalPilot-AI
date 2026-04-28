import Link from "next/link";
import type { Business } from "@/types/business";

type PublicSiteFooterProps = {
  business: Business;
};

export function PublicSiteFooter({ business }: PublicSiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "rgb(var(--theme-border))",
        backgroundColor: "rgb(var(--theme-secondary))",
        color: "rgb(var(--theme-secondary-fg))",
      }}
    >
      <div className="lp-container py-10">
        <div className="grid gap-6 sm:grid-cols-2 sm:items-end">
          <div>
            <p className="text-sm">
              &copy; {year} {business.name}
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: "rgb(var(--theme-secondary-fg) / 0.7)" }}
            >
              {business.address.street} · {business.address.postalCode} {business.address.city}
            </p>
          </div>
          <div
            className="flex flex-wrap justify-end gap-x-6 gap-y-2 text-xs"
            style={{ color: "rgb(var(--theme-secondary-fg) / 0.85)" }}
          >
            <Link
              className="lp-focus-ring rounded-sm hover:underline"
              href={`/site/${business.slug}/impressum/`}
            >
              Impressum
            </Link>
            <Link
              className="lp-focus-ring rounded-sm hover:underline"
              href={`/site/${business.slug}/datenschutz/`}
            >
              Datenschutz
            </Link>
            <a className="lp-focus-ring rounded-sm hover:underline" href="#kontakt">
              Kontakt
            </a>
          </div>
        </div>

        {/* Hinweise: Demo-Status + Powered-by */}
        <div
          className="mt-6 border-t pt-4 text-[11px]"
          style={{
            borderColor: "rgb(var(--theme-secondary-fg) / 0.18)",
            color: "rgb(var(--theme-secondary-fg) / 0.6)",
          }}
        >
          <p>
            Demo-Site, Inhalte sind fiktiv. Impressum und Datenschutz sind
            Platzhalter und müssen vor Veröffentlichung geprüft werden.
          </p>
          <p className="mt-1">
            Erstellt mit{" "}
            <Link href="/" className="underline hover:no-underline">
              LocalPilot AI
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
