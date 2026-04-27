import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { EmptyState } from "../empty-state";
import type { Lead } from "@/types/lead";
import type { LeadStatus } from "@/types/common";

type RecentLeadsListProps = {
  slug: string;
  leads: readonly Lead[];
  limit?: number;
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
  new: "bg-brand-100 text-brand-800",
  contacted: "bg-amber-100 text-amber-800",
  qualified: "bg-violet-100 text-violet-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-rose-100 text-rose-800",
  archived: "bg-ink-100 text-ink-700",
};

const SOURCE_LABEL: Record<string, string> = {
  website_form: "Website",
  phone: "Telefon",
  whatsapp: "WhatsApp",
  email: "E-Mail",
  walk_in: "Vor Ort",
  referral: "Empfehlung",
  social: "Social",
  other: "Sonstiges",
};

const FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string): string {
  try {
    return FORMATTER.format(new Date(iso));
  } catch {
    return "";
  }
}

export function RecentLeadsList({
  slug,
  leads,
  limit = 5,
}: RecentLeadsListProps) {
  const recent = [...leads]
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .slice(0, limit);

  return (
    <DashboardCard
      title="Letzte Anfragen"
      description="Die jüngsten Einträge aus dem Anfrage-Postfach."
      action={
        <Link
          href={`/dashboard/${slug}/leads`}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          Alle ansehen
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
      padding="none"
    >
      {recent.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={Inbox}
            variant="compact"
            title="Noch keine Anfragen"
            description="Sobald Anfragen über die Public Site eintreffen, erscheinen sie hier."
          />
        </div>
      ) : (
        <ul className="divide-y divide-ink-200">
          {recent.map((lead) => (
            <li
              key={lead.id}
              className="flex items-start justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-ink-900">
                    {lead.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_TONE[lead.status]}`}
                  >
                    {STATUS_LABEL[lead.status]}
                  </span>
                </div>
                {lead.message && (
                  <p className="mt-1 line-clamp-1 text-xs text-ink-600">
                    {lead.message}
                  </p>
                )}
                <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-500">
                  {SOURCE_LABEL[lead.source] ?? lead.source} ·{" "}
                  {formatDate(lead.createdAt)}
                </p>
              </div>
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone.replace(/[^+0-9]/g, "")}`}
                  className="flex-none text-xs font-medium text-brand-700 hover:text-brand-800"
                >
                  Anrufen
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
