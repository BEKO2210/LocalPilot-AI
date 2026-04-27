import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Eye } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import type { Business } from "@/types/business";

type PreviewLinkCardProps = {
  business: Business;
};

export function PreviewLinkCard({ business }: PreviewLinkCardProps) {
  return (
    <DashboardCard
      title="Public Site"
      description="Ihre öffentliche Website unter dem aktuellen Slug."
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Eye className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-900">
            /site/{business.slug}/
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-emerald-700">
            <CheckCircle2 className="h-3 w-3" aria-hidden />
            {business.isPublished ? "Veröffentlicht" : "Vorschau"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/site/${business.slug}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Eye className="h-4 w-4" aria-hidden />
          Public Site öffnen
        </Link>
        <Link
          href={`/dashboard/${business.slug}/settings`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          Einstellungen
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </DashboardCard>
  );
}
