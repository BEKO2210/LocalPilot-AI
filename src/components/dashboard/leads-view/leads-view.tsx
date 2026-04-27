"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { telLink, whatsappLink, mailtoLink } from "@/lib/contact-links";
import { DashboardCard, EmptyState } from "@/components/dashboard";
import {
  clearStoredLeads,
  countByStatus,
  getEffectiveLeads,
  hasStoredLeads,
  updateStoredLead,
} from "@/lib/mock-store/leads-overrides";
import type { Business } from "@/types/business";
import type { Lead } from "@/types/lead";
import type { LeadStatus } from "@/types/common";
import { REPLY_TEMPLATES, fillTemplate } from "./reply-templates";

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
  website_form: "Website-Formular",
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
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(iso: string): string {
  try {
    return FORMATTER.format(new Date(iso));
  } catch {
    return "";
  }
}

const STATUS_FILTERS: ReadonlyArray<{
  key: "all" | LeadStatus;
  label: string;
}> = [
  { key: "all", label: "Alle" },
  { key: "new", label: "Neu" },
  { key: "contacted", label: "Kontaktiert" },
  { key: "qualified", label: "Qualifiziert" },
  { key: "won", label: "Gewonnen" },
  { key: "lost", label: "Verloren" },
  { key: "archived", label: "Archiviert" },
];

type LeadsViewProps = {
  business: Business;
  initialLeads: readonly Lead[];
};

export function LeadsView({ business, initialLeads }: LeadsViewProps) {
  // Server-Datensatz wird nach Mount mit dem Browser-Storage gemerged.
  const [leads, setLeads] = useState<Lead[]>(() => [...initialLeads]);
  const [hasLocal, setHasLocal] = useState(false);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLeads(getEffectiveLeads(business.slug, initialLeads));
    setHasLocal(hasStoredLeads(business.slug));
  }, [business.slug, initialLeads]);

  const counts = useMemo(() => countByStatus(leads), [leads]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filter !== "all" && lead.status !== filter) return false;
      if (!term) return true;
      const haystack =
        `${lead.name} ${lead.message ?? ""} ${lead.email ?? ""} ${lead.phone ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [leads, filter, search]);

  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId],
  );

  function refreshFromStore() {
    setLeads(getEffectiveLeads(business.slug, initialLeads));
    setHasLocal(hasStoredLeads(business.slug));
  }

  function handleStatusChange(leadId: string, status: LeadStatus) {
    const ok = updateStoredLead(business.slug, leadId, { status });
    if (ok) refreshFromStore();
    else {
      // Mock-Lead (server-seitig) → Update nicht persistierbar.
      // Wir aktualisieren wenigstens das lokale State für die Sicht.
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, status, updatedAt: new Date().toISOString() }
            : l,
        ),
      );
    }
  }

  function handleNotesChange(leadId: string, notes: string) {
    const ok = updateStoredLead(business.slug, leadId, { notes });
    if (ok) refreshFromStore();
    else {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, notes, updatedAt: new Date().toISOString() }
            : l,
        ),
      );
    }
  }

  function handleClearStored() {
    clearStoredLeads(business.slug);
    refreshFromStore();
    setSelectedId(null);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
          Anfragen
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          Eingegangene Anfragen
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-600">
          Filtern, durchsuchen, Status setzen, Antwort vorbereiten.{" "}
          {hasLocal
            ? "Lokale Anpassungen sind im Browser persistiert."
            : "Aktuell sehen Sie nur die Demo-Anfragen."}
        </p>
      </header>

      {/* Toolbar */}
      <DashboardCard padding="tight">
        <div className="flex flex-wrap items-center gap-2 px-2 py-1">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((item) => {
              const count =
                item.key === "all" ? leads.length : (counts[item.key] ?? 0);
              const isActive = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-brand-600 text-white"
                      : "bg-ink-100 text-ink-700 hover:bg-ink-200",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] tabular-nums",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white text-ink-600",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative ml-auto w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche nach Name, Telefon, Nachricht…"
              className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-8 pr-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          {hasLocal ? (
            <button
              type="button"
              onClick={handleClearStored}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
              title="Im Browser gespeicherte Anfragen entfernen (Demo-Daten bleiben)"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Lokale Anfragen leeren
            </button>
          ) : null}
        </div>
      </DashboardCard>

      {/* Liste + Detail */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <DashboardCard padding="none">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Inbox}
                title="Keine Anfragen mit diesem Filter"
                description={
                  search.trim()
                    ? "Suchbegriff anpassen oder Filter zurücksetzen."
                    : "Sobald über die Public Site eine Anfrage eingeht, erscheint sie hier."
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-ink-200">
              {filtered.map((lead) => {
                const isSelected = selected?.id === lead.id;
                return (
                  <li key={lead.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(lead.id)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 px-5 py-3 text-left transition-colors",
                        isSelected
                          ? "bg-brand-50/60"
                          : "hover:bg-ink-50",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-ink-900">
                            {lead.name}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              STATUS_TONE[lead.status],
                            )}
                          >
                            {STATUS_LABEL[lead.status]}
                          </span>
                        </div>
                        {lead.message ? (
                          <p className="mt-1 line-clamp-1 text-xs text-ink-600">
                            {lead.message}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-500">
                          {SOURCE_LABEL[lead.source] ?? lead.source} ·{" "}
                          {formatDateTime(lead.createdAt)}
                        </p>
                      </div>
                      <ChevronRight
                        className="mt-1 h-4 w-4 flex-none text-ink-400"
                        aria-hidden
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardCard>

        <aside>
          {selected ? (
            <LeadDetail
              key={selected.id}
              lead={selected}
              business={business}
              onClose={() => setSelectedId(null)}
              onChangeStatus={(status) => handleStatusChange(selected.id, status)}
              onChangeNotes={(notes) => handleNotesChange(selected.id, notes)}
            />
          ) : (
            <DashboardCard
              title="Detail"
              description="Wählen Sie eine Anfrage aus der Liste."
            >
              <p className="text-xs text-ink-500">
                Hier landet alles, was zur Anfrage gehört: Status, Notizen,
                Direktkontakt-Buttons und Antwort-Vorlagen mit Copy.
              </p>
            </DashboardCard>
          )}
        </aside>
      </div>
    </div>
  );
}

type LeadDetailProps = {
  lead: Lead;
  business: Business;
  onClose: () => void;
  onChangeStatus: (status: LeadStatus) => void;
  onChangeNotes: (notes: string) => void;
};

function LeadDetail({
  lead,
  business,
  onClose,
  onChangeStatus,
  onChangeNotes,
}: LeadDetailProps) {
  const [notesDraft, setNotesDraft] = useState(lead.notes);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleCopy(key: string, body: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(body).catch(() => undefined);
    }
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  }

  return (
    <DashboardCard padding="none">
      <header className="flex items-start justify-between gap-3 border-b border-ink-200 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-ink-500">Anfrage</p>
          <h3 className="mt-1 text-base font-semibold text-ink-900">
            {lead.name}
          </h3>
          <p className="mt-0.5 text-xs text-ink-500">
            {SOURCE_LABEL[lead.source] ?? lead.source} ·{" "}
            {formatDateTime(lead.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Detail schließen"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="space-y-5 px-5 py-5">
        {/* Direktkontakt */}
        <div className="grid gap-2 sm:grid-cols-3">
          {lead.phone ? (
            <a
              href={telLink(lead.phone)}
              className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
            >
              <Phone className="h-3.5 w-3.5 text-ink-500" aria-hidden />
              <span className="truncate">{lead.phone}</span>
            </a>
          ) : null}
          {lead.phone ? (
            <a
              href={whatsappLink(lead.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
            >
              <MessageCircle className="h-3.5 w-3.5 text-ink-500" aria-hidden />
              WhatsApp
            </a>
          ) : null}
          {lead.email ? (
            <a
              href={mailtoLink(lead.email, `Anfrage bei ${business.name}`)}
              className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
            >
              <Mail className="h-3.5 w-3.5 text-ink-500" aria-hidden />
              <span className="truncate">{lead.email}</span>
            </a>
          ) : null}
        </div>

        {/* Status */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Status
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((status) => {
              const isActive = lead.status === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onChangeStatus(status)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? STATUS_TONE[status]
                      : "bg-white text-ink-700 border border-ink-200 hover:bg-ink-50",
                  )}
                >
                  {STATUS_LABEL[status]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nachricht + Zusatzfelder */}
        {lead.message ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Nachricht
            </p>
            <p className="mt-1 whitespace-pre-line rounded-lg border border-ink-200 bg-white p-3 text-sm text-ink-800">
              {lead.message}
            </p>
          </div>
        ) : null}

        {Object.keys(lead.extraFields).length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Zusatzfelder
            </p>
            <ul className="mt-2 space-y-1 rounded-lg border border-ink-200 bg-white p-3 text-sm">
              {Object.entries(lead.extraFields).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3">
                  <span className="text-ink-500">{k}</span>
                  <span className="text-right font-medium text-ink-800">
                    {String(v)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Notizen */}
        <div>
          <label
            htmlFor={`notes-${lead.id}`}
            className="text-xs font-medium uppercase tracking-wide text-ink-500"
          >
            Notizen
          </label>
          <textarea
            id={`notes-${lead.id}`}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={3}
            placeholder="Interne Bemerkungen zur Anfrage…"
            className="mt-1 w-full rounded-lg border border-ink-200 bg-white p-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNotesDraft(lead.notes)}
              disabled={notesDraft === lead.notes}
              className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
            >
              Verwerfen
            </button>
            <button
              type="button"
              onClick={() => onChangeNotes(notesDraft)}
              disabled={notesDraft === lead.notes}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Notiz speichern
            </button>
          </div>
        </div>

        {/* Antwort-Vorlagen */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Antwort-Vorlagen
          </p>
          <ul className="mt-2 space-y-2">
            {REPLY_TEMPLATES.map((tpl) => {
              const filled = fillTemplate(tpl.body, {
                lead,
                businessName: business.name,
              });
              const copied = copiedKey === tpl.key;
              return (
                <li
                  key={tpl.key}
                  className="rounded-lg border border-ink-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-ink-900">
                      {tpl.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(tpl.key, filled)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors",
                        copied
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-ink-200 text-ink-700 hover:bg-ink-50",
                      )}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" aria-hidden />
                          Kopiert
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" aria-hidden />
                          Kopieren
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs text-ink-700">
                    {filled}
                  </pre>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </DashboardCard>
  );
}
