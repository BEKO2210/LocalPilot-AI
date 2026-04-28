"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Cloud, Send, Info } from "lucide-react";
import { LeadSchema } from "@/core/validation/lead.schema";
import { LEAD_RETENTION_MONTHS, buildConsent } from "@/core/legal";
import { appendLead, generateLeadId } from "@/lib/mock-store/leads-overrides";
import {
  submitLead,
  userHintForResult,
  type ServerSubmitInput,
  type SubmitResult,
} from "@/lib/lead-submit";
import {
  enqueue as enqueueRetry,
  getDueItems,
  getQueueStats,
  markRetried,
  type StorageLike,
} from "@/lib/lead-retry-queue";
import type { Business } from "@/types/business";
import type { LeadFormField } from "@/types/lead";

function getQueueStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

type PublicLeadFormProps = {
  business: Business;
  fields: readonly LeadFormField[];
};

/**
 * Felder, die direkt auf das Lead-Modell gemappt werden. Alles andere
 * landet in `extraFields` – branchenspezifisch (z. B. vehicleModel,
 * objectType, drivingClass).
 */
const STANDARD_FIELD_KEYS = new Set<string>([
  "name",
  "phone",
  "email",
  "message",
  "preferredDate",
  "preferredTime",
  "requestedService",
]);

/** Einzelne Field-Komponente, abhängig vom Field-Type. */
function PublicLeadField({
  field,
  value,
  error,
  onChange,
}: {
  field: LeadFormField;
  value: string;
  error?: string;
  onChange: (next: string) => void;
}) {
  const id = `lead-${field.key}`;
  const hasError = Boolean(error);
  const baseInput =
    "w-full rounded-theme-button border p-3 text-sm transition-colors focus:outline-none focus:ring-2";
  const inputStyle = {
    borderColor: hasError ? "#fca5a5" : "rgb(var(--theme-border))",
    backgroundColor: "rgb(var(--theme-background))",
    color: "rgb(var(--theme-foreground))",
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-wide"
        style={{ color: "rgb(var(--theme-muted-fg))" }}
      >
        {field.label}
        {field.required ? <span className="text-rose-600"> *</span> : null}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          rows={4}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
          style={inputStyle}
          aria-invalid={hasError}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
          style={inputStyle}
          aria-invalid={hasError}
        >
          <option value="">Bitte wählen…</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={
            field.type === "phone"
              ? "tel"
              : field.type === "number"
                ? "number"
                : field.type === "date"
                  ? "date"
                  : field.type === "time"
                    ? "time"
                    : field.type === "email"
                      ? "email"
                      : "text"
          }
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
          style={inputStyle}
          aria-invalid={hasError}
        />
      )}

      {field.helperText && !error ? (
        <p
          className="text-xs"
          style={{ color: "rgb(var(--theme-muted-fg))" }}
        >
          {field.helperText}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

export function PublicLeadForm({ business, fields }: PublicLeadFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) init[f.key] = "";
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [queuePending, setQueuePending] = useState(0);
  const flushingRef = useRef(false);

  // Flush der Retry-Queue (Code-Session 64). Wird bei mount und
  // bei `online`-Events ausgelöst — sequentiell, weil wir den
  // Server nicht parallel mit identischen Leads bombardieren
  // wollen (Idempotency liegt nicht im Lead-Insert-Pfad).
  const flushRetryQueue = useCallback(async () => {
    if (flushingRef.current) return;
    const storage = getQueueStorage();
    if (!storage) return;
    flushingRef.current = true;
    try {
      const due = getDueItems(storage, new Date());
      for (const item of due) {
        try {
          const res = await fetch("/api/leads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(item.payload),
          });
          // 2xx oder 4xx (Validation-Fehler — nochmal versuchen
          // bringt nichts) → markRetried success. Nur 5xx und
          // Netzwerk-Fehler triggern echten Retry.
          const treatAsSuccess = res.ok || (res.status >= 400 && res.status < 500);
          markRetried(storage, item.id, {
            success: treatAsSuccess,
            now: new Date(),
          });
        } catch {
          markRetried(storage, item.id, {
            success: false,
            now: new Date(),
          });
        }
      }
      const stats = getQueueStats(storage, new Date());
      setQueuePending(stats.total);
    } finally {
      flushingRef.current = false;
    }
  }, []);

  // Mount: Queue-Stats anzeigen, dann sofort flushen.
  useEffect(() => {
    const storage = getQueueStorage();
    if (!storage) return;
    setQueuePending(getQueueStats(storage, new Date()).total);
    void flushRetryQueue();
  }, [flushRetryQueue]);

  // Online-Event-Listener: wenn der Browser wieder Verbindung
  // hat, einmal flushen. `offline` sparen wir uns — das ist
  // automatisch durch das nächste `online` triggerbar.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onOnline() {
      void flushRetryQueue();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushRetryQueue]);

  function setValue(key: string, next: string) {
    setValues((prev) => ({ ...prev, [key]: next }));
    if (errors[key]) {
      setErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.key] ?? "").trim();
      if (f.required && v.length === 0) {
        next[f.key] = "Pflichtfeld";
        continue;
      }
      if (v.length > 0) {
        if (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
          next[f.key] = "Bitte eine gültige E-Mail eingeben.";
        }
        if (f.type === "phone" && v.length < 4) {
          next[f.key] = "Bitte eine Telefonnummer angeben.";
        }
      }
    }

    // Geschäftsregel: Name + (Telefon oder E-Mail). Falls die Branche
    // weder phone noch email als Felder anbietet, hängen wir den
    // Hinweis ans Nachrichtenfeld.
    const hasPhoneField = fields.some((f) => f.key === "phone");
    const hasEmailField = fields.some((f) => f.key === "email");
    if (hasPhoneField || hasEmailField) {
      const phone = (values.phone ?? "").trim();
      const email = (values.email ?? "").trim();
      if (!phone && !email) {
        const target = hasPhoneField ? "phone" : "email";
        if (!next[target]) {
          next[target] = "Bitte Telefon oder E-Mail angeben.";
        }
      }
    }
    return next;
  }

  /**
   * Baut zwei Repräsentationen desselben Submits:
   *   - `localBackup`: vollständiger Lead mit client-side ID + ISO-
   *     Stempeln, der direkt in `appendLead` (localStorage) wandert.
   *     Sorgt dafür, dass das Demo-Dashboard weiterhin Daten zeigt,
   *     bis der Dashboard-Pfad ebenfalls auf Supabase umgezogen ist.
   *   - `serverInput`: schmaleres Shape, das die `/api/leads`-Route
   *     erwartet (`NewLeadInput`). Server vergibt eigene ID +
   *     Zeitstempel, damit sie der DB-Wahrheit entsprechen.
   */
  function buildSubmissions() {
    const standard: Record<string, string | undefined> = {};
    const extra: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(values)) {
      const trimmed = v.trim();
      if (trimmed.length === 0) continue;
      if (STANDARD_FIELD_KEYS.has(k)) standard[k] = trimmed;
      else extra[k] = trimmed;
    }
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const consent = buildConsent(nowDate);

    const localBackup = {
      id: generateLeadId(business.slug),
      businessId: business.id,
      source: "website_form" as const,
      name: standard.name ?? "",
      phone: standard.phone,
      email: standard.email,
      message: standard.message ?? "",
      preferredDate: standard.preferredDate,
      preferredTime: standard.preferredTime,
      requestedServiceId: undefined,
      extraFields: extra,
      status: "new" as const,
      notes: "",
      consent,
      createdAt: now,
      updatedAt: now,
    };

    const serverInput: ServerSubmitInput = {
      businessId: business.id,
      source: "website_form",
      name: standard.name ?? "",
      ...(standard.phone ? { phone: standard.phone } : {}),
      ...(standard.email ? { email: standard.email } : {}),
      ...(standard.message ? { message: standard.message } : {}),
      ...(standard.preferredDate
        ? { preferredDate: standard.preferredDate }
        : {}),
      ...(standard.preferredTime
        ? { preferredTime: standard.preferredTime }
        : {}),
      extraFields: extra,
      consent,
    };

    return { localBackup, serverInput };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitNotice(null);
    setConsentError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!consentChecked) {
      setConsentError(
        "Bitte bestätigen Sie die Einwilligung in die Datenverarbeitung, damit wir Ihre Anfrage bearbeiten dürfen.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const { localBackup, serverInput } = buildSubmissions();
      const validation = LeadSchema.safeParse(localBackup);
      if (!validation.success) {
        setSubmitError(
          "Ihre Anfrage konnte nicht verarbeitet werden. Bitte prüfen Sie die Felder.",
        );
        return;
      }

      const result: SubmitResult = await submitLead(
        serverInput,
        validation.data,
        { appendLocal: (lead) => appendLead(business.slug, lead) },
      );

      if (result.kind === "fail") {
        setSubmitError(
          userHintForResult(result) ??
            "Speichern derzeit nicht möglich. Bitte direkt anrufen oder per E-Mail schreiben.",
        );
        return;
      }

      // local-fallback: Lead in die Retry-Queue schieben, damit er
      // beim nächsten `online`-Event automatisch versendet wird.
      // local-only ist Static-Build (keine API erreichbar) — kein
      // Retry sinnvoll. server: alles glatt, kein Retry nötig.
      if (result.kind === "local-fallback") {
        const storage = getQueueStorage();
        if (storage) {
          enqueueRetry(storage, serverInput, {
            id: validation.data.id,
            now: new Date(),
          });
          setQueuePending(getQueueStats(storage, new Date()).total);
        }
      }

      // Erfolg (server / local-only / local-fallback). User-Hinweis
      // nur bei `local-fallback` sichtbar — bei „server" und
      // „local-only" (Static-Build) gibt es nichts zu kommunizieren.
      const hint = userHintForResult(result);
      if (hint) setSubmitNotice(hint);
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    const cleared: Record<string, string> = {};
    for (const f of fields) cleared[f.key] = "";
    setValues(cleared);
    setErrors({});
    setConsentChecked(false);
    setConsentError(null);
    setSuccess(false);
    setSubmitError(null);
    setSubmitNotice(null);
  }

  if (success) {
    return (
      <div
        className="rounded-theme-card border p-6"
        style={{
          borderColor: "rgb(var(--theme-border))",
          backgroundColor: "rgb(var(--theme-background))",
        }}
      >
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: "rgb(var(--theme-accent) / 0.18)",
            color: "rgb(var(--theme-accent))",
          }}
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="lp-theme-heading mt-4 text-lg">
          Anfrage gesendet.
        </h3>
        <p
          className="mt-2 text-sm"
          style={{ color: "rgb(var(--theme-muted-fg))" }}
        >
          Wir melden uns innerhalb eines Werktags. Falls dringend, ist die
          Telefonnummer links der schnellste Weg.
        </p>
        {submitNotice ? (
          <p
            className="mt-3 flex items-start gap-2 rounded-theme-button border p-2.5 text-xs"
            style={{
              borderColor: "rgb(var(--theme-border))",
              backgroundColor: "rgb(var(--theme-muted))",
              color: "rgb(var(--theme-muted-fg))",
            }}
            role="status"
          >
            <Info className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
            {submitNotice}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleReset}
          className="mt-5 inline-flex items-center gap-1.5 rounded-theme-button border px-3 py-2 text-xs font-medium"
          style={{
            borderColor: "rgb(var(--theme-border))",
            color: "rgb(var(--theme-foreground))",
          }}
        >
          Weitere Anfrage senden
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-label="Anfrageformular"
      noValidate
    >
      {queuePending > 0 ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-theme-button border p-2 text-xs"
          style={{
            borderColor: "#fcd34d",
            backgroundColor: "#fffbeb",
            color: "#92400e",
          }}
        >
          <Cloud className="h-3.5 w-3.5 flex-none" aria-hidden />
          {queuePending === 1
            ? "Eine ältere Anfrage wartet noch auf den Versand — sie wird automatisch beim nächsten Verbindungsaufbau zugestellt."
            : `${queuePending} ältere Anfragen warten noch auf den Versand — sie werden automatisch beim nächsten Verbindungsaufbau zugestellt.`}
        </p>
      ) : null}
      {fields.map((field) => (
        <PublicLeadField
          key={field.key}
          field={field}
          value={values[field.key] ?? ""}
          error={errors[field.key]}
          onChange={(v) => setValue(field.key, v)}
        />
      ))}

      {submitError ? (
        <p
          className="flex items-start gap-2 rounded-theme-button border p-3 text-xs"
          style={{
            borderColor: "#fca5a5",
            backgroundColor: "#fef2f2",
            color: "#9f1239",
          }}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
          {submitError}
        </p>
      ) : null}

      {/* DSGVO-Pflicht-Einwilligung. Aktives Opt-In, nicht vorausgefüllt. */}
      <div
        className="space-y-2 border-t pt-4"
        style={{ borderColor: "rgb(var(--theme-border))" }}
      >
        <label
          htmlFor="lead-consent"
          className="flex items-start gap-2.5 text-xs"
          style={{ color: "rgb(var(--theme-muted-fg))" }}
        >
          <input
            id="lead-consent"
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => {
              setConsentChecked(e.target.checked);
              if (e.target.checked) setConsentError(null);
            }}
            required
            aria-invalid={Boolean(consentError)}
            className="mt-0.5 h-4 w-4 flex-none cursor-pointer"
          />
          <span>
            Ich habe die{" "}
            <Link
              href={`/site/${business.slug}/datenschutz`}
              className="font-medium underline underline-offset-2"
              style={{ color: "rgb(var(--theme-foreground))" }}
            >
              Datenschutzerklärung
            </Link>{" "}
            gelesen und willige ein, dass meine Angaben zur Bearbeitung
            meiner Anfrage gespeichert werden. Die Einwilligung kann
            jederzeit per E-Mail an den Betrieb widerrufen werden.{" "}
            <span className="opacity-80">
              Speicherdauer: maximal {LEAD_RETENTION_MONTHS} Monate, sofern
              keine Geschäftsbeziehung zustande kommt.
            </span>
            <span className="ml-1 text-rose-600" aria-hidden>
              *
            </span>
          </span>
        </label>
        {consentError ? (
          <p
            className="flex items-start gap-1.5 text-xs font-medium text-rose-600"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
            {consentError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-[11px]"
          style={{ color: "rgb(var(--theme-muted-fg))" }}
        >
          Demo-Submission — Daten bleiben in dieser Vorschau ausschließlich
          in Ihrem Browser.{" "}
          <Link
            href={`/site/${business.slug}/impressum`}
            className="underline underline-offset-2"
            style={{ color: "rgb(var(--theme-foreground))" }}
          >
            Impressum
          </Link>
        </p>
        <button
          type="submit"
          disabled={submitting || !consentChecked}
          className="lp-focus-ring inline-flex items-center gap-1.5 rounded-theme-button px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: "rgb(var(--theme-primary))",
            color: "rgb(var(--theme-primary-fg))",
            boxShadow: "var(--theme-shadow)",
          }}
        >
          <Send className="h-4 w-4" aria-hidden />
          Anfrage senden
        </button>
      </div>
    </form>
  );
}
