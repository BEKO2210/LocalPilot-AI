"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { INDUSTRY_KEYS, PACKAGE_TIERS, THEME_KEYS } from "@/types/common";
import {
  isReservedSlug,
  suggestSlugFromName,
  validateOnboarding,
  type OnboardingFieldErrors,
  type OnboardingInput,
} from "@/lib/onboarding-validate";

/**
 * Onboarding-Form für den ersten Betrieb (Code-Session 45).
 *
 * - Slug-Vorschlag aus dem Namen (klickbar, übernimmt nur, wenn
 *   das Slug-Feld leer ist oder noch dem letzten Vorschlag entspricht).
 * - Live-Validation per `validateOnboarding`.
 * - Server-Antworten werden auf `fieldErrors` (per Feld) oder ein
 *   globales `submitError` gemappt.
 * - Erfolg: Redirect auf `/account` (zukünftige Session zeigt dort
 *   die eigenen Betriebe — bis dahin reicht der Hinweis).
 */
export function OnboardingForm() {
  const router = useRouter();
  const [values, setValues] = useState<OnboardingInput>({
    slug: "",
    name: "",
    industryKey: "",
    themeKey: "",
    packageTier: "silber",
    tagline: "",
    description: "",
  });
  const [errors, setErrors] = useState<OnboardingFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string } | null>(null);
  const [lastSuggested, setLastSuggested] = useState("");

  function setField<K extends keyof OnboardingInput>(
    key: K,
    next: string,
  ) {
    setValues((prev) => ({ ...prev, [key]: next }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  function applySlugSuggestion() {
    const suggestion = suggestSlugFromName(values.name);
    if (suggestion) {
      setField("slug", suggestion);
      setLastSuggested(suggestion);
    }
  }

  // Wenn Slug-Feld leer oder noch dem letzten Vorschlag entspricht,
  // beim Tippen des Namens automatisch nachziehen — entwickelt eine
  // angenehme Live-Heuristik, ohne den User zu überfahren.
  function onNameChange(next: string) {
    setField("name", next);
    if (
      values.slug.trim() === "" ||
      values.slug === lastSuggested
    ) {
      const suggestion = suggestSlugFromName(next);
      setField("slug", suggestion);
      setLastSuggested(suggestion);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateOnboarding(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }
    if (isReservedSlug(validation.value.slug)) {
      setErrors({ slug: "Dieser Slug ist reserviert. Bitte einen anderen wählen." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validation.value),
      });
      let body: {
        ok?: boolean;
        slug?: string;
        error?: string;
        message?: string;
        fieldErrors?: OnboardingFieldErrors;
      } = {};
      try {
        body = (await res.json()) as typeof body;
      } catch {
        /* ignore */
      }

      if (res.ok && body.slug) {
        setSuccess({ slug: body.slug });
        // Eine Sekunde stehen lassen (User soll Erfolg sehen),
        // dann redirect.
        setTimeout(() => router.push("/account"), 1200);
        return;
      }

      if (res.status === 401) {
        setSubmitError("Bitte zuerst einloggen.");
        setTimeout(() => router.push("/login"), 1200);
        return;
      }
      if (res.status === 503) {
        setSubmitError(
          "Onboarding-Backend ist gerade nicht aktiv (Demo-Mode oder Service-Role nicht konfiguriert).",
        );
        return;
      }
      if (res.status === 409) {
        setErrors((prev) => ({
          ...prev,
          slug: body.message ?? "Slug ist bereits vergeben.",
        }));
        return;
      }
      if (res.status === 400 && body.fieldErrors) {
        setErrors(body.fieldErrors);
        return;
      }
      setSubmitError(
        body.message ??
          `Onboarding fehlgeschlagen (HTTP ${res.status}).`,
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `Netzwerk-Fehler: ${err.message}`
          : "Netzwerk-Fehler beim Onboarding.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
      >
        <div className="flex items-center gap-2 text-emerald-900">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
          <p className="font-semibold">Betrieb angelegt — willkommen an Bord.</p>
        </div>
        <p className="mt-2 text-sm text-emerald-900">
          Slug: <code className="font-mono">{success.slug}</code>. Du wirst
          gleich zu deinem Account weitergeleitet.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field
        label="Betriebsname"
        id="name"
        value={values.name}
        onChange={onNameChange}
        error={errors.name}
        placeholder="Studio Haarlinie"
        required
        autoComplete="organization"
      />

      <div>
        <Field
          label="Slug"
          id="slug"
          value={values.slug}
          onChange={(v) => setField("slug", v)}
          error={errors.slug}
          placeholder="studio-haarlinie"
          required
          helper="Kleinbuchstaben, Zahlen, Bindestriche. Wird Teil deiner URL: /site/<slug>."
        />
        <button
          type="button"
          onClick={applySlugSuggestion}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          <Sparkles className="h-3 w-3" aria-hidden /> Slug aus Name vorschlagen
        </button>
      </div>

      <SelectField
        label="Branche"
        id="industryKey"
        value={values.industryKey}
        onChange={(v) => setField("industryKey", v)}
        error={errors.industryKey}
        required
        options={[
          { value: "", label: "Bitte wählen …" },
          ...INDUSTRY_KEYS.map((k) => ({
            value: k,
            label: INDUSTRY_LABELS[k] ?? k,
          })),
        ]}
      />

      <SelectField
        label="Theme"
        id="themeKey"
        value={values.themeKey}
        onChange={(v) => setField("themeKey", v)}
        error={errors.themeKey}
        required
        options={[
          { value: "", label: "Bitte wählen …" },
          ...THEME_KEYS.map((k) => ({
            value: k,
            label: THEME_LABELS[k] ?? k,
          })),
        ]}
      />

      <SelectField
        label="Paket"
        id="packageTier"
        value={values.packageTier}
        onChange={(v) => setField("packageTier", v)}
        error={errors.packageTier}
        required
        options={PACKAGE_TIERS.map((t) => ({
          value: t,
          label: TIER_LABELS[t] ?? t,
        }))}
      />

      <Field
        label="Slogan"
        id="tagline"
        value={values.tagline}
        onChange={(v) => setField("tagline", v)}
        error={errors.tagline}
        placeholder="Friseur in Musterstadt"
        required
      />

      <TextareaField
        label="Beschreibung"
        id="description"
        value={values.description}
        onChange={(v) => setField("description", v)}
        error={errors.description}
        placeholder="Wir sind ein moderner Friseursalon in Musterstadt — Termine flexibel, Beratung persönlich."
        required
      />

      {submitError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          {submitError}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1 text-xs text-ink-500">
          <Info className="h-3 w-3" aria-hidden />
          Daten kannst du später jederzeit anpassen — diese Seite ist
          nur der Schnellstart.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Anlegen …
            </>
          ) : (
            "Betrieb anlegen"
          )}
        </button>
      </div>
    </form>
  );
}

const INDUSTRY_LABELS: Record<string, string> = {
  hairdresser: "Friseur",
  barbershop: "Barbershop",
  auto_workshop: "Autowerkstatt",
  cleaning_company: "Reinigungsfirma",
  cosmetic_studio: "Kosmetikstudio",
  nail_studio: "Nagelstudio",
  craftsman_general: "Handwerker (allgemein)",
  electrician: "Elektriker",
  painter: "Malerbetrieb",
  driving_school: "Fahrschule",
  tutoring: "Nachhilfe",
  personal_trainer: "Personal Trainer",
  photographer: "Fotograf",
  real_estate_broker: "Immobilienmakler",
  restaurant: "Restaurant",
  cafe: "Café",
  local_shop: "Lokaler Shop",
  dog_grooming: "Hundesalon",
  wellness_practice: "Wellness-/Praxis-Dienstleister",
  garden_landscaping: "Garten- & Landschaftsbau",
};

const THEME_LABELS: Record<string, string> = {
  clean_light: "Clean Light",
  premium_dark: "Premium Dark",
  warm_local: "Warm Local",
  medical_clean: "Medical Clean",
  beauty_luxury: "Beauty Luxury",
  automotive_strong: "Automotive Strong",
  craftsman_solid: "Craftsman Solid",
  creative_studio: "Creative Studio",
  fitness_energy: "Fitness Energy",
  education_calm: "Education Calm",
};

const TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silber: "Silber",
  gold: "Gold",
  platin: "Platin",
};

// ---------------------------------------------------------------------------
// Pure-UI Helper-Komponenten
// ---------------------------------------------------------------------------

function Field(props: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  helper?: string;
}) {
  const hasError = Boolean(props.error);
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-sm font-medium text-ink-800">
        {props.label} {props.required ? <span className="text-rose-600">*</span> : null}
      </label>
      <input
        id={props.id}
        type="text"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${props.id}-error` : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-soft outline-none focus:ring-2 ${
          hasError
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
            : "border-ink-200 focus:border-brand-500 focus:ring-brand-200"
        }`}
      />
      {props.helper && !hasError ? (
        <p className="mt-1 text-xs text-ink-500">{props.helper}</p>
      ) : null}
      {hasError ? (
        <p id={`${props.id}-error`} className="mt-1 text-xs font-medium text-rose-600">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

function TextareaField(props: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const hasError = Boolean(props.error);
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-sm font-medium text-ink-800">
        {props.label} {props.required ? <span className="text-rose-600">*</span> : null}
      </label>
      <textarea
        id={props.id}
        rows={4}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        aria-invalid={hasError}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-soft outline-none focus:ring-2 ${
          hasError
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
            : "border-ink-200 focus:border-brand-500 focus:ring-brand-200"
        }`}
      />
      {hasError ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{props.error}</p>
      ) : null}
    </div>
  );
}

function SelectField(props: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  const hasError = Boolean(props.error);
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-sm font-medium text-ink-800">
        {props.label} {props.required ? <span className="text-rose-600">*</span> : null}
      </label>
      <select
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={hasError}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-soft outline-none focus:ring-2 ${
          hasError
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
            : "border-ink-200 focus:border-brand-500 focus:ring-brand-200"
        }`}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hasError ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{props.error}</p>
      ) : null}
    </div>
  );
}
