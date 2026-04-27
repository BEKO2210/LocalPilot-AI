"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Link2,
  Loader2,
  Save,
} from "lucide-react";
import {
  submitSettingsUpdate,
  userMessageForResult,
  type Locale,
} from "@/lib/business-settings";
import type { Business } from "@/types/business";

/**
 * Settings-Form (Code-Session 52).
 *
 * Drei Pflicht-Operationen für den Live-Betrieb:
 *   1. Slug ändern (URL-Schlüssel) — bei Erfolg redirect auf
 *      `/dashboard/<neuerSlug>/settings`.
 *   2. Veröffentlichungsstatus toggeln — sichtbar als Switch mit
 *      direkter Wirkung (kein „Speichern" nötig, wenn nur das
 *      Toggle geändert wird, aber der Save-Button bleibt für
 *      Bulk-Änderungen verfügbar).
 *   3. Sprache der Public-Site (de | en).
 *
 * Designer-Hinweis: Slug-Wechsel ist gefährlich — alte Links
 * (geteilte URLs, Suchmaschinen, Bookmarks) werden 404. Wir
 * zeigen einen prominenten Warn-Hinweis, sobald der Wert vom
 * aktuellen abweicht.
 */
export function SettingsForm({ business }: { readonly business: Business }) {
  const router = useRouter();
  const [slugInput, setSlugInput] = useState(business.slug);
  const [isPublished, setIsPublished] = useState(business.isPublished);
  const [locale, setLocale] = useState<Locale>(business.locale);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  const slugIsDirty = slugInput.trim().toLowerCase() !== business.slug;
  const publishIsDirty = isPublished !== business.isPublished;
  const localeIsDirty = locale !== business.locale;
  const isDirty = slugIsDirty || publishIsDirty || localeIsDirty;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    setFieldErrors({});
    try {
      const result = await submitSettingsUpdate(business.slug, {
        ...(slugIsDirty ? { newSlug: slugInput } : {}),
        ...(publishIsDirty ? { isPublished } : {}),
        ...(localeIsDirty ? { locale } : {}),
      });

      const msg = userMessageForResult(result);

      if (result.kind === "validation") {
        setFieldErrors(result.fieldErrors);
        setFeedback({
          kind: "err",
          message: msg ?? "Bitte prüfe die markierten Felder.",
        });
        return;
      }

      if (result.kind === "server" || result.kind === "noop") {
        setFeedback({ kind: "ok", message: msg ?? "Gespeichert." });
        if (result.kind === "server" && result.slugChanged) {
          // Auf den neuen Slug redirecten — sonst landet der User
          // im 404 (alte URL existiert nicht mehr).
          setTimeout(
            () => router.push(`/dashboard/${result.slug}/settings`),
            900,
          );
        }
        return;
      }

      setFeedback({ kind: "err", message: msg ?? "Speichern fehlgeschlagen." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          URL-Schlüssel, Veröffentlichungsstatus und Sprache. Diese
          Werte ändern, wie der Betrieb von außen wahrgenommen wird —
          bitte bewusst speichern.
        </p>
      </header>

      {/* SLUG */}
      <section className="space-y-2 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <label
          htmlFor="slug-input"
          className="flex items-center gap-2 text-sm font-medium text-ink-800"
        >
          <Link2 className="h-4 w-4" aria-hidden /> Slug (URL-Schlüssel)
        </label>
        <p className="text-xs text-ink-500">
          Wird Teil deiner URL: <code className="font-mono">/site/{slugInput || business.slug}</code>.
          Aktueller Slug: <code className="font-mono">{business.slug}</code>.
        </p>
        <input
          id="slug-input"
          type="text"
          value={slugInput}
          onChange={(e) => setSlugInput(e.target.value)}
          aria-invalid={Boolean(fieldErrors["newSlug"])}
          className={`w-full rounded-lg border px-3 py-2 font-mono text-sm shadow-soft outline-none focus:ring-2 ${
            fieldErrors["newSlug"]
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
              : "border-ink-200 focus:border-brand-500 focus:ring-brand-200"
          }`}
        />
        {fieldErrors["newSlug"] ? (
          <p className="text-xs font-medium text-rose-600">
            {fieldErrors["newSlug"]}
          </p>
        ) : null}
        {slugIsDirty ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
            <div>
              <p className="font-semibold">Achtung: Slug-Wechsel</p>
              <p className="mt-0.5">
                Bestehende Links (geteilte URLs, Suchmaschinen-Index,
                Bookmarks) zeigen ins Leere. Logos und Bilder bleiben
                aber für den **alten** Pfad in Storage liegen —
                Cleanup-Job folgt. Nur ändern, wenn wirklich nötig.
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* PUBLISH */}
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-800">
          {isPublished ? (
            <Eye className="h-4 w-4 text-emerald-600" aria-hidden />
          ) : (
            <EyeOff className="h-4 w-4 text-ink-500" aria-hidden />
          )}
          Veröffentlichungsstatus
        </p>
        <p className="text-xs text-ink-500">
          Veröffentlicht: jeder kann <code className="font-mono">/site/{business.slug}</code>{" "}
          öffnen. Entwurf: Public-Site liefert 404 (RLS-gefiltert).
          Owner-Vorschau über das Dashboard bleibt jederzeit
          verfügbar.
        </p>
        <label
          htmlFor="published-toggle"
          className="inline-flex cursor-pointer items-center gap-3"
        >
          <input
            id="published-toggle"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-5 w-5 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
          />
          <span className="text-sm text-ink-800">
            {isPublished ? "Veröffentlicht (öffentlich sichtbar)" : "Entwurf (nicht öffentlich)"}
          </span>
        </label>
      </section>

      {/* LOCALE */}
      <section className="space-y-2 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <label
          htmlFor="locale-select"
          className="flex items-center gap-2 text-sm font-medium text-ink-800"
        >
          <Globe className="h-4 w-4" aria-hidden /> Sprache der Public-Site
        </label>
        <p className="text-xs text-ink-500">
          Steuert die Default-Sprache. Mehrsprachige Inhalte folgen
          mit Gold-Paket.
        </p>
        <select
          id="locale-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-soft outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </section>

      {feedback ? (
        <div
          role={feedback.kind === "err" ? "alert" : "status"}
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            feedback.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {feedback.kind === "ok" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          )}
          {feedback.message}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-500">
          Geplant: USt-IdNr., Aufsichtsbehörde, Datenschutzbeauftragte:r
          (Legal-Sektion).
        </p>
        <button
          type="submit"
          disabled={!isDirty || submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Speichere …
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden /> Speichern
            </>
          )}
        </button>
      </div>
    </form>
  );
}
