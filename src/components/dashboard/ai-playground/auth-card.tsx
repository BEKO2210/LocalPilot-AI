"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { DashboardCard } from "../dashboard-card";

interface AuthCardProps {
  /** Wird gerufen, wenn sich der Auth-Status ändert (login/logout). */
  readonly onAuthChange?: (authenticated: boolean) => void;
}

type AuthState =
  | { kind: "checking" }
  | {
      kind: "authenticated";
      principal: string;
      via: "cookie" | "bearer";
    }
  | { kind: "unauthenticated"; reason?: string }
  | { kind: "unavailable"; reason: string };

/**
 * Zeigt den Login-Status der API-Schicht und bietet ein Passwort-
 * Formular für Cookie-basiertes Anmelden (Code-Session 33).
 *
 * Mock-Provider funktioniert weiterhin **ohne** Login — die Card
 * macht nur klar, dass Live-Provider erst nach Anmeldung gehen.
 *
 * Im Static-Build (GitHub Pages) gibt es keine `/api/*`-Routen →
 * die Card zeigt einen kurzen „API nicht verfügbar"-Hinweis.
 */
export function AuthCard({ onAuthChange }: AuthCardProps) {
  const [state, setState] = useState<AuthState>({ kind: "checking" });
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setState({ kind: "checking" });
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.status === 404) {
        setState({
          kind: "unavailable",
          reason:
            "API-Route /api/auth/me nicht verfügbar (Static-Build). Mock-Provider funktioniert trotzdem.",
        });
        onAuthChange?.(false);
        return;
      }
      if (res.status === 503) {
        const body = (await res.json().catch(() => ({}))) as {
          reason?: string;
        };
        setState({
          kind: "unavailable",
          reason:
            body.reason ??
            "API ist serverseitig nicht aktiviert (LP_AI_API_KEY fehlt).",
        });
        onAuthChange?.(false);
        return;
      }
      if (res.status === 401) {
        setState({ kind: "unauthenticated" });
        onAuthChange?.(false);
        return;
      }
      if (!res.ok) {
        setState({
          kind: "unavailable",
          reason: `Health-Check fehlgeschlagen (${res.status}).`,
        });
        onAuthChange?.(false);
        return;
      }
      const json = (await res.json()) as {
        authenticated: boolean;
        principal: string;
        via: "cookie" | "bearer";
      };
      if (json.authenticated) {
        setState({
          kind: "authenticated",
          principal: json.principal,
          via: json.via,
        });
        onAuthChange?.(true);
      } else {
        setState({ kind: "unauthenticated" });
        onAuthChange?.(false);
      }
    } catch (err) {
      setState({
        kind: "unavailable",
        reason:
          err instanceof Error
            ? err.message
            : "Auth-Status konnte nicht geprüft werden.",
      });
      onAuthChange?.(false);
    }
  }, [onAuthChange]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.trim().length === 0) {
      setError("Bitte ein Passwort eingeben.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      if (res.ok) {
        setPassword("");
        await refreshStatus();
        return;
      }
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      setError(
        body.message ?? body.error ?? `Login fehlgeschlagen (${res.status}).`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    await refreshStatus();
  }

  return (
    <DashboardCard
      title="API-Anmeldung"
      description="Mock-Provider braucht keinen Login. Live-Provider (OpenAI / Anthropic / Gemini) brauchen eine angemeldete Session."
      action={
        state.kind === "authenticated" ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Eingeloggt ({state.via})
          </span>
        ) : null
      }
    >
      {state.kind === "checking" ? (
        <p className="flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Auth-Status wird geprüft …
        </p>
      ) : state.kind === "unavailable" ? (
        <p className="text-xs italic text-ink-500">{state.reason}</p>
      ) : state.kind === "authenticated" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Angemeldet als <strong>{state.principal}</strong>. Live-Provider
            sind ab jetzt im Provider-Picker freigeschaltet.
          </p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Abmelden
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => void handleLogin(e)}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="min-w-0 flex-1">
            <label
              htmlFor="auth-password"
              className="block text-sm font-medium text-ink-900"
            >
              Passwort (`LP_AI_PASSWORD`)
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="•••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || password.trim().length === 0}
            className="lp-focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden />
            )}
            Anmelden
          </button>
          {error ? (
            <p
              className="flex w-full items-start gap-1.5 text-xs font-medium text-rose-600"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
              {error}
            </p>
          ) : null}
        </form>
      )}
    </DashboardCard>
  );
}
