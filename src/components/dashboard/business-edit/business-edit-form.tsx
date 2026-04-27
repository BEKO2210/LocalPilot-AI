"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FormProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CheckCircle2,
  Cloud,
  Crown,
  MapPin,
  Palette,
  Phone,
  Save,
  Undo2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  FormField,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from "@/components/forms";
import {
  BusinessProfileSchema,
  type BusinessProfile,
} from "@/core/validation/business-profile.schema";
import { getAllPresets, getPresetOrFallback } from "@/core/industries";
import { getTier } from "@/core/pricing";
import {
  clearOverride,
  getOverride,
  profileFromBusiness,
  setOverride,
} from "@/lib/mock-store";
import {
  submitBusinessUpdate,
  userMessageForResult,
  type BusinessUpdateResult,
} from "@/lib/business-update";
import type { Business } from "@/types/business";
import type { IndustryKey } from "@/types/common";
import { OpeningHoursEditor } from "./opening-hours-editor";
import { ThemePickerField } from "./theme-picker-field";
import { BusinessEditPreview } from "./business-edit-preview";

type BusinessEditFormProps = {
  business: Business;
};

export function BusinessEditForm({ business }: BusinessEditFormProps) {
  const initialProfile = useMemo(() => profileFromBusiness(business), [business]);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [hasLocalOverride, setHasLocalOverride] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedTo, setSavedTo] = useState<"server" | "local" | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const methods = useForm<BusinessProfile>({
    resolver: zodResolver(BusinessProfileSchema),
    defaultValues: initialProfile,
    mode: "onBlur",
  });

  // Hydrate aus localStorage, falls vorhanden.
  useEffect(() => {
    const stored = getOverride(business.slug);
    if (stored) {
      methods.reset(stored, { keepDefaultValues: true });
      setHasLocalOverride(true);
    } else {
      setHasLocalOverride(false);
    }
    // Dependency: nur Slug, sonst löscht jedes Re-Render die Formularänderungen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.slug]);

  const tier = getTier(business.packageTier);
  const preset = getPresetOrFallback(business.industryKey);
  const allPresets = getAllPresets();
  const errors = methods.formState.errors;
  const isDirty = methods.formState.isDirty;

  /**
   * Submit-Strategie (Code-Session 50):
   *
   *   1. Versuche Server-PATCH `/api/businesses/<slug>`.
   *   2. Bei `server`-Erfolg: localStorage-Override löschen
   *      (DB ist Wahrheit) und „Gespeichert (Server)" anzeigen.
   *   3. Bei `local-fallback` (404 / offline / Static-Build):
   *      lokalen Override schreiben und „Gespeichert (Demo)"
   *      anzeigen.
   *   4. Bei `not-authed` / `forbidden`: Fehler-Hinweis, KEIN
   *      Local-Schreiben (würde stillschweigend Inkonsistenz mit
   *      DB erzeugen, sobald der User wieder einloggt).
   *   5. Bei `validation`: Fehler pro Feld in das Form mappen.
   *   6. Bei `fail` (5xx): Fehler-Hinweis, kein Local-Schreiben
   *      — sonst riskieren wir lokale Werte, die in der DB
   *      anders sind.
   */
  const onSubmit: SubmitHandler<BusinessProfile> = async (data) => {
    setSubmitting(true);
    setSubmitMessage(null);
    setSavedTo(null);
    try {
      const result: BusinessUpdateResult = await submitBusinessUpdate(
        business.slug,
        data,
      );

      if (result.kind === "server") {
        // Server hat persistiert → lokales Override hat keine
        // Existenzberechtigung mehr (würde nur Drift erzeugen).
        clearOverride(business.slug);
        setHasLocalOverride(false);
        setSavedAt(new Date());
        setSavedTo("server");
        methods.reset(data, { keepDirty: false });
        return;
      }

      if (result.kind === "local-fallback") {
        const ok = setOverride(business.slug, data);
        if (ok) {
          setSavedAt(new Date());
          setSavedTo("local");
          setHasLocalOverride(true);
          methods.reset(data, { keepDirty: false });
        } else {
          setSubmitMessage("Speichern derzeit nicht möglich.");
        }
        return;
      }

      if (result.kind === "validation") {
        for (const [path, message] of Object.entries(result.fieldErrors)) {
          methods.setError(path as keyof BusinessProfile, {
            type: "server",
            message,
          });
        }
        setSubmitMessage("Bitte prüfe die markierten Felder.");
        return;
      }

      // not-authed / forbidden / fail
      const msg = userMessageForResult(result);
      if (msg) setSubmitMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  function handleResetOverride() {
    clearOverride(business.slug);
    methods.reset(initialProfile);
    setHasLocalOverride(false);
    setSavedAt(null);
  }

  function handleDiscardChanges() {
    const stored = getOverride(business.slug);
    methods.reset(stored ?? initialProfile);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* Status-Bar */}
        <div className="sticky top-0 z-30 -mx-2 mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ink-200 bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">
              Betriebsdaten bearbeiten
            </p>
            <p className="text-xs text-ink-600">
              {hasLocalOverride
                ? "Lokale Anpassung aktiv – auf Demo-Defaults zurücksetzbar."
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
                {errorCount} Fehler
              </span>
            ) : null}
            {hasLocalOverride ? (
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
              onClick={handleDiscardChanges}
              disabled={!isDirty}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
            >
              Verwerfen
            </button>
            <button
              type="submit"
              disabled={!isDirty || submitting}
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
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <Cloud className="h-4 w-4" aria-hidden />
            Gespeichert in der Datenbank. Public-Site zeigt die neuen Werte
            beim nächsten Aufruf.
          </div>
        ) : null}
        {savedAt && savedTo === "local" ? (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Lokal gespeichert (Demo-Modus, kein Auth-Backend aktiv).
            Neuladen der Seite zeigt die übernommenen Werte nur in diesem
            Browser.
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

        {/* Live-Vorschau (Mobile zuerst sichtbar, Desktop seitlich) */}
        <div className="lg:hidden">
          <BusinessEditPreview />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {/* 1. Basisdaten */}
            <FormSection
              icon={Building2}
              title="Basisdaten"
              description="Name, kurzer Untertitel und ausführliche Beschreibung – die Texte erscheinen prominent auf Ihrer Public Site."
            >
              <FormField
                label="Name des Betriebs"
                htmlFor="name"
                required
                error={errors.name?.message}
              >
                <FormInput
                  id="name"
                  type="text"
                  placeholder="z. B. Studio Haarlinie"
                  hasError={Boolean(errors.name)}
                  {...methods.register("name")}
                />
              </FormField>

              <FormField
                label="Tagline"
                htmlFor="tagline"
                required
                hint="Kurzer Satz, der unter dem Namen steht. Platzhalter {{city}} wird automatisch ersetzt."
                error={errors.tagline?.message}
              >
                <FormInput
                  id="tagline"
                  type="text"
                  placeholder="Friseur mit Stil – mitten in {{city}}."
                  hasError={Boolean(errors.tagline)}
                  {...methods.register("tagline")}
                />
              </FormField>

              <FormField
                label="Beschreibung"
                htmlFor="description"
                required
                hint="2–4 Sätze. Was bieten Sie an? Was macht Sie aus?"
                error={errors.description?.message}
              >
                <FormTextarea
                  id="description"
                  rows={5}
                  placeholder="Wir machen unkomplizierte, hochwertige Haarschnitte und Farben für Damen, Herren und Kinder…"
                  hasError={Boolean(errors.description)}
                  {...methods.register("description")}
                />
              </FormField>
            </FormSection>

            {/* 2. Branche & Paket */}
            <FormSection
              icon={Crown}
              title="Branche & Paket"
              description="Branche steuert Texte, Vorlagen und Formularfelder. Das Paket regeln Sie zentral – wechseln über die Pakete-Seite."
            >
              <FormField
                label="Branche"
                htmlFor="industryKey"
                required
                hint="Setzt branchen-typische Texte, Tonalität und Lead-Felder voraus."
                error={errors.industryKey?.message}
              >
                <FormSelect
                  id="industryKey"
                  hasError={Boolean(errors.industryKey)}
                  {...methods.register("industryKey")}
                >
                  {allPresets.map((p) => (
                    <option key={p.key} value={p.key as IndustryKey}>
                      {p.label}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Aktuelles Paket" htmlFor="packageTier">
                <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-4 py-3">
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Crown className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{tier.label}</p>
                    <p className="text-xs text-ink-600">
                      Branche aktiv: <strong>{preset.label}</strong>. Paket
                      ändern Sie über die Pakete-Seite.
                    </p>
                  </div>
                  <a
                    href="/pricing"
                    className="text-xs font-medium text-brand-700 hover:text-brand-800"
                  >
                    Vergleichen
                  </a>
                </div>
              </FormField>
            </FormSection>

            {/* 3. Adresse */}
            <FormSection
              icon={MapPin}
              title="Adresse"
              description="Erscheint im Footer der Public Site und in der Standort-Sektion."
            >
              <FormField
                label="Straße & Nummer"
                htmlFor="address.street"
                required
                error={errors.address?.street?.message}
              >
                <FormInput
                  id="address.street"
                  type="text"
                  placeholder="Lindenallee 14"
                  hasError={Boolean(errors.address?.street)}
                  {...methods.register("address.street")}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="PLZ"
                  htmlFor="address.postalCode"
                  required
                  error={errors.address?.postalCode?.message}
                >
                  <FormInput
                    id="address.postalCode"
                    type="text"
                    placeholder="10115"
                    hasError={Boolean(errors.address?.postalCode)}
                    {...methods.register("address.postalCode")}
                  />
                </FormField>
                <FormField
                  label="Stadt"
                  htmlFor="address.city"
                  required
                  className="sm:col-span-2"
                  error={errors.address?.city?.message}
                >
                  <FormInput
                    id="address.city"
                    type="text"
                    placeholder="Musterstadt"
                    hasError={Boolean(errors.address?.city)}
                    {...methods.register("address.city")}
                  />
                </FormField>
              </div>
              <FormField
                label="Land"
                htmlFor="address.country"
                required
                hint="ISO-3166-Alpha-2-Code, z. B. DE / AT / CH."
                error={errors.address?.country?.message}
              >
                <FormInput
                  id="address.country"
                  type="text"
                  placeholder="DE"
                  maxLength={2}
                  className="uppercase"
                  hasError={Boolean(errors.address?.country)}
                  {...methods.register("address.country")}
                />
              </FormField>
            </FormSection>

            {/* 4. Kontakt */}
            <FormSection
              icon={Phone}
              title="Kontakt"
              description="Wege, über die Sie erreichbar sind. Telefon und WhatsApp landen im Mobile-CTA-Streifen."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Telefon"
                  htmlFor="contact.phone"
                  hint="Internationales Format mit + und Vorwahl."
                  error={errors.contact?.phone?.message}
                >
                  <FormInput
                    id="contact.phone"
                    type="tel"
                    placeholder="+49 30 9000 1234"
                    hasError={Boolean(errors.contact?.phone)}
                    {...methods.register("contact.phone")}
                  />
                </FormField>
                <FormField
                  label="WhatsApp"
                  htmlFor="contact.whatsapp"
                  hint="Optional. Wenn leer: kein WhatsApp-Button."
                  error={errors.contact?.whatsapp?.message}
                >
                  <FormInput
                    id="contact.whatsapp"
                    type="tel"
                    placeholder="+49 30 9000 1234"
                    hasError={Boolean(errors.contact?.whatsapp)}
                    {...methods.register("contact.whatsapp")}
                  />
                </FormField>
              </div>

              <FormField
                label="E-Mail"
                htmlFor="contact.email"
                error={errors.contact?.email?.message}
              >
                <FormInput
                  id="contact.email"
                  type="email"
                  placeholder="kontakt@ihr-betrieb.de"
                  hasError={Boolean(errors.contact?.email)}
                  {...methods.register("contact.email")}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Website"
                  htmlFor="contact.website"
                  hint="Optional, falls bereits eine andere Seite existiert."
                  error={errors.contact?.website?.message}
                >
                  <FormInput
                    id="contact.website"
                    type="url"
                    placeholder="https://…"
                    hasError={Boolean(errors.contact?.website)}
                    {...methods.register("contact.website")}
                  />
                </FormField>
                <FormField
                  label="Google Maps Link"
                  htmlFor="contact.googleMapsUrl"
                  error={errors.contact?.googleMapsUrl?.message}
                >
                  <FormInput
                    id="contact.googleMapsUrl"
                    type="url"
                    placeholder="https://maps.google.com/…"
                    hasError={Boolean(errors.contact?.googleMapsUrl)}
                    {...methods.register("contact.googleMapsUrl")}
                  />
                </FormField>
              </div>
              <FormField
                label="Google-Bewertungslink"
                htmlFor="contact.googleReviewUrl"
                hint="Wird vom Bewertungs-Booster (Session 16) automatisch verwendet."
                error={errors.contact?.googleReviewUrl?.message}
              >
                <FormInput
                  id="contact.googleReviewUrl"
                  type="url"
                  placeholder="https://g.page/…"
                  hasError={Boolean(errors.contact?.googleReviewUrl)}
                  {...methods.register("contact.googleReviewUrl")}
                />
              </FormField>
            </FormSection>

            {/* 5. Öffnungszeiten */}
            <FormSection
              icon={Clock}
              title="Öffnungszeiten"
              description="Pro Tag entweder geschlossen oder einer/mehrere Slots. Erscheint als Tabelle auf der Public Site."
            >
              <OpeningHoursEditor />
            </FormSection>

            {/* 6. Branding */}
            <FormSection
              icon={Palette}
              title="Branding & Design"
              description="Theme bestimmt Farben, Buttons und Schriften. Optional einzelne Farben überschreiben."
            >
              <FormField label="Theme" htmlFor="themeKey">
                <ThemePickerField />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="Primärfarbe (override)"
                  htmlFor="primaryColor"
                  hint="Optional. Format #1f47d6."
                  error={errors.primaryColor?.message}
                >
                  <FormInput
                    id="primaryColor"
                    type="text"
                    placeholder="#1f47d6"
                    hasError={Boolean(errors.primaryColor)}
                    {...methods.register("primaryColor")}
                  />
                </FormField>
                <FormField
                  label="Sekundärfarbe"
                  htmlFor="secondaryColor"
                  error={errors.secondaryColor?.message}
                >
                  <FormInput
                    id="secondaryColor"
                    type="text"
                    placeholder="#0f1320"
                    hasError={Boolean(errors.secondaryColor)}
                    {...methods.register("secondaryColor")}
                  />
                </FormField>
                <FormField
                  label="Akzentfarbe"
                  htmlFor="accentColor"
                  error={errors.accentColor?.message}
                >
                  <FormInput
                    id="accentColor"
                    type="text"
                    placeholder="#3563f0"
                    hasError={Boolean(errors.accentColor)}
                    {...methods.register("accentColor")}
                  />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Logo-URL"
                  htmlFor="logoUrl"
                  hint="Optional. Bild-Upload folgt mit Storage-Anbindung."
                  error={errors.logoUrl?.message}
                >
                  <FormInput
                    id="logoUrl"
                    type="url"
                    placeholder="https://…"
                    hasError={Boolean(errors.logoUrl)}
                    {...methods.register("logoUrl")}
                  />
                </FormField>
                <FormField
                  label="Cover-Bild-URL"
                  htmlFor="coverImageUrl"
                  hint="Optional, später für die Hero-Sektion."
                  error={errors.coverImageUrl?.message}
                >
                  <FormInput
                    id="coverImageUrl"
                    type="url"
                    placeholder="https://…"
                    hasError={Boolean(errors.coverImageUrl)}
                    {...methods.register("coverImageUrl")}
                  />
                </FormField>
              </div>
            </FormSection>
          </div>

          {/* Live-Vorschau (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BusinessEditPreview />
            </div>
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}
