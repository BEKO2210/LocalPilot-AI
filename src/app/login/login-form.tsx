"use client";

import { useState, type FormEvent } from "react";
import { Mail, Loader2, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import {
  IDLE_STATUS,
  SENDING_STATUS,
  SUCCESS_STATUS,
  looksLikeEmail,
  statusFromApiResponse,
  statusFromNetworkError,
  type AuthStatus,
} from "@/lib/auth-status";

/**
 * Magic-Link-Login-Form (Code-Session 43).
 *
 * Schickt POST `/api/auth/magic-link` mit `{ email, redirectTo }`.
 * Status-Mapping läuft komplett über `auth-status.ts` (testbar).
 * UI ist fokus- und screenreader-freundlich (`aria-live` auf
 * Status-Region).
 */
export function LoginForm({
  redirectTo = "/account",
}: {
  /** Wohin nach dem Klick auf den Magic-Link weitergeleitet wird. */
  readonly redirectTo?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthStatus>(IDLE_STATUS);

  const isSubmitting = status.kind === "sending";
  const canSubmit = !isSubmitting && looksLikeEmail(email);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus(SENDING_STATUS);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), redirectTo }),
      });
      if (res.ok) {
        setStatus(SUCCESS_STATUS);
        return;
      }
      let body: { error?: string; message?: string } | null = null;
      try {
        body = (await res.json()) as typeof body;
      } catch {
        /* ignore */
      }
      setStatus(statusFromApiResponse(res.status, body));
    } catch (err) {
      setStatus(statusFromNetworkError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-ink-800"
        >
          E-Mail-Adresse
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="dein@beispiel.de"
            className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink-900 shadow-soft outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sende Login-Link …
          </>
        ) : (
          "Login-Link senden"
        )}
      </button>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="min-h-[1.5rem]"
      >
        {status.kind !== "idle" && status.kind !== "sending" ? (
          <StatusBlock status={status} />
        ) : null}
      </div>
    </form>
  );
}

function StatusBlock({ status }: { status: AuthStatus }) {
  const styles =
    status.kind === "sent"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : status.kind === "unconfigured"
        ? "border-ink-200 bg-ink-50 text-ink-700"
        : "border-rose-200 bg-rose-50 text-rose-900";
  const Icon =
    status.kind === "sent"
      ? CheckCircle2
      : status.kind === "unconfigured"
        ? Info
        : AlertTriangle;
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
      <div>
        <p className="font-medium">{status.message}</p>
        {status.hint ? <p className="mt-1 text-xs opacity-90">{status.hint}</p> : null}
      </div>
    </div>
  );
}
