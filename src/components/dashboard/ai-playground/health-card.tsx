"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import type { HealthSnapshot } from "@/core/ai/health";

interface HealthCardProps {
  /** Bearer-Token für `/api/ai/health`. Leer → Card zeigt Hinweis. */
  readonly apiToken: string;
}

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; snapshot: HealthSnapshot }
  | { kind: "error"; status: number; message: string }
  | { kind: "unavailable"; reason: string };

/**
 * Zeigt den aktuellen Health-Status der KI-Schicht. Nicht-blockierend
 * — die Card pollt nicht automatisch, sondern auf Mount und auf
 * manuellen Refresh.
 *
 * Im Static-Export-Build gibt es keine `/api/ai/health`-Route → 404.
 * Dann zeigt die Card eine kleine „API-Route nicht verfügbar"-Notiz.
 */
export function HealthCard({ apiToken }: HealthCardProps) {
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  const refresh = useCallback(async () => {
    if (apiToken.trim().length === 0) {
      setState({
        kind: "unavailable",
        reason:
          "Kein API-Token gesetzt. Sobald oben ein Token eingetragen ist, wird der Status hier sichtbar.",
      });
      return;
    }
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/ai/health", {
        headers: { authorization: `Bearer ${apiToken.trim()}` },
        cache: "no-store",
      });
      if (res.status === 404) {
        setState({
          kind: "unavailable",
          reason:
            "API-Route /api/ai/health ist nicht verfügbar. Static-Export-Build (GitHub Pages) hat keine API-Routen.",
        });
        return;
      }
      if (!res.ok) {
        let body: { error?: string; message?: string } = {};
        try {
          body = (await res.json()) as typeof body;
        } catch {
          /* ignore */
        }
        setState({
          kind: "error",
          status: res.status,
          message: body.message ?? body.error ?? "(keine Nachricht)",
        });
        return;
      }
      const snapshot = (await res.json()) as HealthSnapshot;
      setState({ kind: "ready", snapshot });
    } catch (err) {
      setState({
        kind: "unavailable",
        reason:
          err instanceof Error
            ? err.message
            : "Health-Check nicht erreichbar.",
      });
    }
  }, [apiToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <DashboardCard
      title="System-Status"
      description="Welche Provider sind scharf, welche brauchen noch einen Key?"
      action={
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={state.kind === "loading"}
          className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
          aria-label="Health-Status aktualisieren"
        >
          <RefreshCw
            className={`h-3 w-3 ${state.kind === "loading" ? "animate-spin" : ""}`}
            aria-hidden
          />
          Refresh
        </button>
      }
    >
      {state.kind === "loading" || state.kind === "idle" ? (
        <p className="flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Status wird geprüft …
        </p>
      ) : state.kind === "unavailable" ? (
        <p className="text-xs italic text-ink-500">{state.reason}</p>
      ) : state.kind === "error" ? (
        <p className="flex items-start gap-2 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          API {state.status}: {state.message}
        </p>
      ) : (
        <SnapshotView snapshot={state.snapshot} />
      )}
    </DashboardCard>
  );
}

function SnapshotView({ snapshot }: { snapshot: HealthSnapshot }) {
  const providers = Object.values(snapshot.providers);
  return (
    <div className="space-y-3 text-sm">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {providers.map((p) => (
          <li
            key={p.key}
            className="flex items-start gap-2 rounded-lg border border-ink-200 bg-white p-2.5"
          >
            {p.available ? (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 flex-none text-emerald-600"
                aria-hidden
              />
            ) : (
              <AlertTriangle
                className="mt-0.5 h-4 w-4 flex-none text-amber-600"
                aria-hidden
              />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-ink-900">{p.key}</p>
              <p className="truncate text-xs text-ink-600">{p.model}</p>
              {!p.available && p.reason ? (
                <p className="mt-0.5 text-xs text-amber-700">{p.reason}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-2 rounded-lg border border-ink-200 bg-ink-50 p-2.5 text-xs text-ink-700">
        <Activity className="mt-0.5 h-3.5 w-3.5 flex-none text-ink-500" aria-hidden />
        <div>
          <p className="font-medium text-ink-900">
            Tagesbudget: ${snapshot.budget.spentUsd.toFixed(4)} von ${snapshot.budget.capUsd.toFixed(2)}{" "}
            ({snapshot.budget.percentUsed} %)
          </p>
          <p className="mt-0.5 text-ink-600">
            Reset um {new Date(snapshot.budget.resetAtUtc).toLocaleString("de-DE")}{" "}
            (UTC-Mitternacht).
          </p>
        </div>
      </div>
    </div>
  );
}
