import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { EmptyState } from "../empty-state";
import type { Lead } from "@/types/lead";
import type { LeadStatus } from "@/types/common";

type LeadsSummaryCardProps = {
  slug: string;
  leads: readonly Lead[];
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  won: "Gewonnen",
  lost: "Verloren",
  archived: "Archiviert",
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "bg-brand-50 text-brand-800 border-brand-100",
  contacted: "bg-amber-50 text-amber-800 border-amber-100",
  qualified: "bg-violet-50 text-violet-800 border-violet-100",
  won: "bg-emerald-50 text-emerald-800 border-emerald-100",
  lost: "bg-rose-50 text-rose-800 border-rose-100",
  archived: "bg-ink-100 text-ink-700 border-ink-200",
};

const ORDER: readonly LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
  "archived",
];

export function LeadsSummaryCard({ slug, leads }: LeadsSummaryCardProps) {
  const counts: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    won: 0,
    lost: 0,
    archived: 0,
  };
  for (const lead of leads) {
    counts[lead.status] += 1;
  }
  const newCount = counts.new;
  const totalOpen = counts.new + counts.contacted + counts.qualified;

  return (
    <DashboardCard
      title="Anfragen"
      description={
        totalOpen > 0
          ? `${totalOpen} offen, davon ${newCount} neu.`
          : "Aktuell keine offenen Anfragen."
      }
      action={
        <Link
          href={`/dashboard/${slug}/leads`}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          Alle ansehen
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
    >
      {leads.length === 0 ? (
        <EmptyState
          icon={Inbox}
          variant="compact"
          title="Noch keine Anfragen"
          description="Sobald Anfragen über die Public Site eintreffen, erscheinen sie hier."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ORDER.map((status) => (
            <li
              key={status}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${STATUS_TONE[status]}`}
            >
              <span className="font-medium">{STATUS_LABEL[status]}</span>
              <span className="text-base font-semibold tabular-nums">
                {counts[status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
