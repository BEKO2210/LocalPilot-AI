import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { listMockBusinessSlugs, mockBusinesses } from "@/data";
import { getPresetOrFallback } from "@/core/industries";
import { getTier } from "@/core/pricing";
import type { Business } from "@/types/business";

type BusinessHeaderProps = {
  business: Business;
};

const TIER_BADGE_CLASS: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-900 border-amber-200",
  silber: "bg-slate-100 text-slate-900 border-slate-200",
  gold: "bg-yellow-100 text-yellow-900 border-yellow-300",
};

/**
 * Top-Bar fürs Dashboard: zeigt aktiven Demo-Betrieb, Paket, Vorschau-Link
 * und ein `<details>`-basiertes Switcher-Menü (kein Client-JS).
 */
export function BusinessHeader({ business }: BusinessHeaderProps) {
  const preset = getPresetOrFallback(business.industryKey);
  const tier = getTier(business.packageTier);
  const slugs = listMockBusinessSlugs();

  return (
    <div className="border-b border-ink-200 bg-white">
      <div className="lp-container flex flex-wrap items-center gap-3 py-4">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold"
        >
          {business.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Aktiver Demo-Betrieb
          </p>
          <p className="truncate text-base font-semibold text-ink-900">
            {business.name}
          </p>
          <p className="truncate text-xs text-ink-600">
            {preset.label} · {business.address.city}
          </p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${TIER_BADGE_CLASS[tier.key] ?? ""}`}
        >
          {tier.label}
        </span>

        {/* Switcher (CSS-only, via <details>) */}
        <details className="relative">
          <summary className="lp-focus-ring inline-flex h-9 cursor-pointer list-none items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 hover:bg-ink-50 [&::-webkit-details-marker]:hidden">
            Demo wechseln
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </summary>
          <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-ink-200 bg-white p-1 shadow-soft">
            <ul className="max-h-72 overflow-y-auto">
              {slugs.map((slug) => {
                const b = mockBusinesses.find((x) => x.slug === slug);
                if (!b) return null;
                const isActive = slug === business.slug;
                return (
                  <li key={slug}>
                    <Link
                      href={`/dashboard/${slug}`}
                      className={`lp-focus-ring flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                        isActive
                          ? "bg-ink-900 text-white"
                          : "text-ink-700 hover:bg-ink-100"
                      }`}
                    >
                      <span className="min-w-0 truncate">{b.name}</span>
                      <span className="text-[10px] uppercase tracking-wide opacity-70">
                        {b.packageTier}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </details>

        <Link
          href={`/site/${business.slug}`}
          className="lp-focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          Public Site
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
