"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  type FieldPath,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Plus,
  Save,
  Sparkles,
  Undo2,
} from "lucide-react";
import { z } from "zod";
import { ServiceSchema } from "@/core/validation/service.schema";
import {
  clearServicesOverride,
  getServicesOverride,
  setServicesOverride,
} from "@/lib/mock-store";
import {
  submitServicesUpdate,
  userMessageForResult,
  type ServicesUpdateResult,
} from "@/lib/services-update";
import { getPresetOrFallback } from "@/core/industries";
import { isLimitExceeded } from "@/core/pricing";
import type { Business } from "@/types/business";
import type { Service } from "@/types/service";
import { ServiceCard } from "./service-card";
import { ServicesSummary } from "./services-summary";

export const ServicesFormSchema = z.object({
  services: z.array(ServiceSchema),
});
export type ServicesFormValues = z.infer<typeof ServicesFormSchema>;

type ServicesEditFormProps = {
  business: Business;
};

/**
 * Erzeugt eine echte UUID v4 für neue Services (Code-Session 58).
 *
 * Vorher: Pseudo-IDs wie `svc-<slug>-<random8>` — die Server-PUT-
 * Route ersetzte sie durch `crypto.randomUUID()`. Das funktionierte
 * für reine Stamm-Daten, aber nicht für Service-Bild-Uploads:
 * Bilder müssen unter ihrer endgültigen UUID liegen, sonst werden
 * sie beim ersten Save zur Storage-Waise. Mit echter UUID schon
 * im Form-State läuft Bild-Upload sofort, ohne erstes „Speichern".
 *
 * Fallback: Kleinwahrscheinlich nötig (alle modernen Browser haben
 * `crypto.randomUUID`), aber wenn die API fehlt, geben wir eine
 * Pseudo-ID — der Server lässt sie zu UUID promotieren, der
 * Bild-Upload bleibt dann bis zum ersten Save gesperrt.
 */
function generateNewServiceId(slug: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `svc-${slug}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Standard-Werte für eine neue, leere Leistung. */
function buildEmptyService(business: Business, sortOrder: number): Service {
  return {
    id: generateNewServiceId(business.slug),
    businessId: business.id,
    title: "",
    shortDescription: "",
    longDescription: "",
    tags: [],
    isFeatured: false,
    isActive: true,
    sortOrder,
  };
}

/**
 * Sortiert Services nach `sortOrder` und schreibt sie auf saubere
 * fortlaufende Werte (0..n-1) zurück. So bleibt die Reihenfolge stabil,
 * auch wenn der User mit den Pfeil-Buttons swappt.
 */
function normalizeOrder(services: readonly Service[]): Service[] {
  return [...services]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s, i) => ({ ...s, sortOrder: i }));
}

export function ServicesEditForm({ business }: ServicesEditFormProps) {
  const initial = useMemo<ServicesFormValues>(
    () => ({ services: normalizeOrder(business.services) }),
    [business.services],
  );
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [hasOverride, setHasOverride] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedTo, setSavedTo] = useState<"server" | "local" | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [serverNote, setServerNote] = useState<string | null>(null);

  const methods = useForm<ServicesFormValues>({
    resolver: zodResolver(ServicesFormSchema),
    defaultValues: initial,
    mode: "onBlur",
  });
  const { fields, append, remove, swap } = useFieldArray({
    control: methods.control,
    name: "services",
    keyName: "_rhfId",
  });

  // Hydrate aus localStorage, falls vorhanden.
  useEffect(() => {
    const stored = getServicesOverride(business.slug);
    if (stored) {
      methods.reset(
        { services: normalizeOrder(stored) },
        { keepDefaultValues: true },
      );
      setHasOverride(true);
    } else {
      setHasOverride(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.slug]);

  const tier = business.packageTier;
  const preset = getPresetOrFallback(business.industryKey);

  const watchedServices = methods.watch("services") ?? [];
  const count = watchedServices.length;
  const activeCount = watchedServices.filter((s) => s?.isActive).length;
  const featuredCount = watchedServices.filter((s) => s?.isFeatured).length;

  const overLimit = isLimitExceeded(tier, "maxServices", count);
  const atLimit = !overLimit && isLimitExceeded(tier, "maxServices", count - 1);
  const errors = methods.formState.errors;
  const errorCount = errors.services
    ? Object.keys(errors.services).filter((k) => /^\d+$/.test(k)).length
    : 0;
  const isDirty = methods.formState.isDirty;

  /**
   * Submit-Strategie (Code-Session 55) — symmetrisch zu Session 50:
   *
   *   1. Versuche Server-PUT `/api/businesses/<slug>/services`
   *      mit der gesamten Liste. Server diff't gegen `existing`
   *      und bulk-upserted/löscht.
   *   2. Bei `server`-Erfolg: localStorage-Override löschen
   *      (DB ist Wahrheit) und „Gespeichert in der Datenbank" zeigen.
   *   3. Bei `local-fallback` (404 / offline / Static-Build):
   *      Override schreiben, „Lokal gespeichert (Demo)" zeigen.
   *   4. Bei `validation`: Fehler pro Feld (`services.<i>.<feld>`)
   *      über `methods.setError` ins Form mappen.
   *   5. Bei `not-authed` / `forbidden` / `fail`: Hinweis, KEIN
   *      Local-Schreiben (würde Drift mit DB erzeugen).
   */
  const onSubmit: SubmitHandler<ServicesFormValues> = async (data) => {
    const normalized = normalizeOrder(data.services);
    if (isLimitExceeded(tier, "maxServices", normalized.length)) {
      // UI-Hinweis steht bereits über die Summary-Karte – wir blockieren
      // hier zusätzlich das Speichern, damit kein kaputter Zustand entsteht.
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);
    setServerNote(null);
    setSavedTo(null);
    try {
      const result: ServicesUpdateResult = await submitServicesUpdate(
        business.slug,
        normalized,
        business.id,
      );

      if (result.kind === "server") {
        clearServicesOverride(business.slug);
        setHasOverride(false);
        setSavedAt(new Date());
        setSavedTo("server");
        setServerNote(userMessageForResult(result));
        methods.reset({ services: normalized });
        return;
      }

      if (result.kind === "local-fallback") {
        const ok = setServicesOverride(business.slug, normalized);
        if (ok) {
          methods.reset({ services: normalized });
          setSavedAt(new Date());
          setSavedTo("local");
          setHasOverride(true);
        } else {
          setSubmitMessage("Speichern derzeit nicht möglich.");
        }
        return;
      }

      if (result.kind === "validation") {
        // Server-fieldErrors-Keys: `services.<index>.<feld>`. RHF
        // versteht denselben Pfad direkt — `setError` mappt 1:1.
        for (const [path, message] of Object.entries(result.fieldErrors)) {
          methods.setError(path as FieldPath<ServicesFormValues>, {
            type: "server",
            message,
          });
        }
        setSubmitMessage("Bitte prüfe die markierten Karten.");
        return;
      }

      const msg = userMessageForResult(result);
      if (msg) setSubmitMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  function handleResetOverride() {
    clearServicesOverride(business.slug);
    methods.reset(initial);
    setHasOverride(false);
    setSavedAt(null);
  }

  function handleDiscard() {
    const stored = getServicesOverride(business.slug);
    methods.reset({ services: normalizeOrder(stored ?? business.services) });
  }

  function handleAddEmpty() {
    if (overLimit || atLimit) return;
    append(buildEmptyService(business, count));
  }

  function handleImportPreset() {
    const next: Service[] = preset.defaultServices.map((s, i) => ({
      id: generateNewServiceId(business.slug),
      businessId: business.id,
      title: s.title,
      shortDescription: s.shortDescription,
      longDescription: "",
      category: s.category,
      priceLabel: s.defaultPriceLabel,
      durationLabel: s.defaultDurationLabel,
      tags: [],
      isFeatured: false,
      isActive: true,
      sortOrder: i,
    }));
    methods.reset(
      { services: next.slice(0, business.services.length || next.length) },
      { keepDefaultValues: true },
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Status-Bar */}
        <div className="sticky top-0 z-30 -mx-2 flex flex-wrap items-center gap-2 rounded-2xl border border-ink-200 bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">
              Leistungen verwalten
            </p>
            <p className="text-xs text-ink-600">
              {hasOverride
                ? "Lokale Anpassung aktiv – Demo-Defaults sind zurücksetzbar."
                : "Demo-Stand. Änderungen werden im Browser gespeichert."}
              {savedAt
                ? ` · Gespeichert um ${savedAt.toLocaleTimeString("de-DE")}.`
                : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {errorCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                <AlertCircle className="h-3 w-3" aria-hidden />
                {errorCount} Karten mit Fehlern
              </span>
            ) : null}
            {hasOverride ? (
              <button
                type="button"
                onClick={handleResetOverride}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden />
                Demo-Defaults laden
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
            >
              Verwerfen
            </button>
            <button
              type="submit"
              disabled={!isDirty || overLimit || submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" aria-hidden />
              {submitting ? "Speichere …" : "Speichern"}
            </button>
          </div>
        </div>

        {savedAt && savedTo === "server" ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <Cloud className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
            <span>
              Gespeichert in der Datenbank. Public-Site zeigt die neuen
              Leistungen beim nächsten Aufruf.
              {serverNote ? <> {" · "}{serverNote}</> : null}
            </span>
          </div>
        ) : null}
        {savedAt && savedTo === "local" ? (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Lokal gespeichert (Demo-Modus, kein Auth-Backend aktiv).
            Reihenfolge und Änderungen sind nur in diesem Browser persistiert.
          </div>
        ) : null}
        {submitMessage ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
            {submitMessage}
          </div>
        ) : null}

        <ServicesSummary
          tier={tier}
          count={count}
          activeCount={activeCount}
          featuredCount={featuredCount}
        />

        {/* Liste oder Empty State */}
        {fields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-ink-900">
              Noch keine Leistungen
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Starten Sie leer oder übernehmen Sie die typischen Leistungen aus
              dem Branchen-Preset <strong>{preset.label}</strong>.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleAddEmpty}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Erste Leistung anlegen
              </button>
              <button
                type="button"
                onClick={handleImportPreset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Aus Branchen-Preset übernehmen
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {fields.map((field, index) => (
              <li key={field._rhfId}>
                <ServiceCard
                  slug={business.slug}
                  index={index}
                  total={fields.length}
                  onMoveUp={() => index > 0 && swap(index, index - 1)}
                  onMoveDown={() =>
                    index < fields.length - 1 && swap(index, index + 1)
                  }
                  onRemove={() => remove(index)}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Footer-Aktion */}
        {fields.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-ink-300 bg-white p-4">
            <p className="text-xs text-ink-600">
              {atLimit || overLimit
                ? "Limit erreicht – Pakete vergleichen, um mehr Leistungen freizuschalten."
                : `Sie können noch ${
                    isLimitExceeded(tier, "maxServices", count)
                      ? 0
                      : Math.max(
                          0,
                          (() => {
                            const limit =
                              business.packageTier === "bronze"
                                ? 10
                                : business.packageTier === "silber"
                                  ? 30
                                  : 100;
                            return limit - count;
                          })(),
                        )
                  } Leistungen hinzufügen.`}
            </p>
            <button
              type="button"
              onClick={handleAddEmpty}
              disabled={overLimit || atLimit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Neue Leistung hinzufügen
            </button>
          </div>
        ) : null}
      </form>
    </FormProvider>
  );
}
