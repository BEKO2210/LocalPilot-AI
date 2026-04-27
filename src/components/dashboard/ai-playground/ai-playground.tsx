"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AlertCircle, Ban, Clock, Loader2, Server, Sparkles, Wand2 } from "lucide-react";
import type { AIProviderKey } from "@/types/common";
import type { Business } from "@/types/business";
import { sanitizeAIOutput } from "@/core/ai/sanitize";
import {
  AI_TOKEN_STORAGE_KEY,
  callAIGenerate,
  type AIGenerateRateLimit,
} from "@/lib/ai-client";
import { DashboardCard } from "../dashboard-card";
import { AuthCard } from "./auth-card";
import { HealthCard } from "./health-card";
import { ResultPanel } from "./result-panel";
import { METHOD_CONFIGS, METHOD_ORDER, contextFromBusiness } from "./method-configs";
import type {
  GenerationResult,
  PlaygroundCostInfo,
  PlaygroundField,
  PlaygroundFormValues,
  PlaygroundMethodId,
} from "./types";

type RateLimitState = AIGenerateRateLimit;

const PROVIDER_OPTIONS: readonly {
  readonly value: AIProviderKey;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    value: "mock",
    label: "Mock (deterministisch)",
    description: "Lokal, ohne API-Call. Funktioniert immer.",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "Über /api/ai/generate (nur SSR-Deploy + Bearer-Token).",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Über /api/ai/generate (nur SSR-Deploy + Bearer-Token).",
  },
  {
    value: "gemini",
    label: "Gemini",
    description: "Über /api/ai/generate (nur SSR-Deploy + Bearer-Token).",
  },
];

interface AIPlaygroundProps {
  readonly business: Business;
}

/**
 * KI-Assistent-Playground (Code-Session 27).
 *
 * Spielt die 7 Mock-Methoden clientseitig an. Provider-Auswahl ist
 * fest auf Mock — Live-Provider folgen mit der API-Route hinter Auth.
 * Alle Inputs werden methodenspezifisch über `methodConfigs` validiert,
 * bevor sie an den Mock-Provider gehen.
 */
export function AIPlayground({ business }: AIPlaygroundProps) {
  const [methodId, setMethodId] = useState<PlaygroundMethodId>("website-copy");
  const [valuesByMethod, setValuesByMethod] = useState<
    Record<PlaygroundMethodId, PlaygroundFormValues>
  >(() => {
    const initial = {} as Record<PlaygroundMethodId, PlaygroundFormValues>;
    for (const id of METHOD_ORDER) {
      initial[id] = METHOD_CONFIGS[id].defaults;
    }
    return initial;
  });
  const [providerKey, setProviderKey] = useState<AIProviderKey>("mock");
  const [apiToken, setApiToken] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitState | null>(null);
  const [pending, startTransition] = useTransition();

  // Token aus localStorage hydrieren, damit der Auftraggeber ihn nur
  // einmal eingeben muss. Nicht persistiert, wenn das Browser-Storage
  // sealed ist (Privatemodus, etc.) — dann bleibt es Session-only.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AI_TOKEN_STORAGE_KEY);
      if (stored) setApiToken(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (apiToken.trim().length > 0) {
        window.localStorage.setItem(AI_TOKEN_STORAGE_KEY, apiToken.trim());
      } else {
        window.localStorage.removeItem(AI_TOKEN_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [apiToken]);

  const config = METHOD_CONFIGS[methodId];
  const formValues = valuesByMethod[methodId];
  const context = useMemo(() => contextFromBusiness(business), [business]);

  function setField(name: string, value: string | number | boolean | undefined) {
    setValuesByMethod((prev) => ({
      ...prev,
      [methodId]: { ...prev[methodId], [name]: value },
    }));
  }

  function handleGenerate() {
    setError(null);
    setResult(null);
    setRateLimit(null);
    startTransition(async () => {
      // Mock-Pfad: lokal, kein Server-Roundtrip. Sanitizer als
      // Defense-in-Depth, falls künftig echte AI-Fixtures eingespielt
      // werden.
      if (providerKey === "mock") {
        try {
          const out = await config.call(business, formValues);
          setResult({ ...out, output: sanitizeAIOutput(out.output) } as typeof out);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
        return;
      }

      // Live-Pfad: zentraler Helper aus `lib/ai-client.ts`
      // (Code-Session 65). Kein try/catch nötig — `callAIGenerate`
      // wirft nicht, alle Fehlerklassen kommen als `kind: "fail"`
      // o. ä. zurück.
      const input = config.buildInput(business, formValues);
      const r = await callAIGenerate({
        method: config.apiName,
        providerKey,
        input,
        apiToken,
      });

      switch (r.kind) {
        case "server": {
          setResult({
            method: config.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            output: r.output as any,
            ...(r.cost ? { cost: r.cost as PlaygroundCostInfo } : {}),
          } as GenerationResult);
          return;
        }
        case "rate-limit":
          setRateLimit(r.limit);
          return;
        case "static-build":
          setError(
            "API-Route /api/ai/generate ist nicht verfügbar. Static-Export-Build (GitHub Pages) hat keine API-Routen — bitte SSR-Deploy (Vercel) oder zurück auf Mock.",
          );
          return;
        case "not-authed":
        case "forbidden":
          setError(r.message);
          return;
        case "fail":
          setError(`API ${r.status}: ${r.reason}`);
          return;
      }
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Playground
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            KI-Assistent
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">
            Spielt alle 7 Methoden mit dem Mock-Provider an — deterministisch,
            ohne API-Key, ohne Kosten. Live-Provider (OpenAI / Anthropic /
            Gemini) sind backend-seitig scharf, brauchen für den Browser-
            Aufruf aber eine API-Route mit Auth (Code-Session 28+).
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            providerKey === "mock"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-brand-200 bg-brand-50 text-brand-800"
          }`}
        >
          {providerKey === "mock" ? (
            <Sparkles className="h-3 w-3" aria-hidden />
          ) : (
            <Server className="h-3 w-3" aria-hidden />
          )}
          Provider:{" "}
          {PROVIDER_OPTIONS.find((o) => o.value === providerKey)?.label ?? providerKey}
        </span>
      </header>

      {/* Auth-Status (Cookie-Session, Login/Logout) */}
      <AuthCard />

      {/* Health-Status (System) */}
      <HealthCard apiToken={apiToken} />

      {/* Provider-Auswahl */}
      <DashboardCard
        title="Provider"
        description="Mock funktioniert immer (lokal). Live-Provider gehen über die API-Route /api/ai/generate — nur in SSR-Deploys verfügbar."
      >
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {PROVIDER_OPTIONS.map((opt) => {
              const isActive = opt.value === providerKey;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setProviderKey(opt.value);
                    setError(null);
                  }}
                  className={`flex flex-col gap-1 rounded-xl border px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                      : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isActive ? "text-brand-900" : "text-ink-900"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="line-clamp-2 text-xs text-ink-600">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
          {providerKey !== "mock" ? (
            <div>
              <label
                htmlFor="ai-api-token"
                className="block text-sm font-medium text-ink-900"
              >
                API-Token (Bearer)
              </label>
              <input
                id="ai-api-token"
                type="password"
                placeholder="Pasten — wird im localStorage gespeichert"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-mono text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-ink-500">
                Muss dem `LP_AI_API_KEY` ENV-Wert auf dem Server entsprechen.
                Token bleibt nur im Browser, wird nicht ans Repo committet.
              </p>
            </div>
          ) : null}
        </div>
      </DashboardCard>

      {/* Methoden-Picker */}
      <DashboardCard
        title="Methode wählen"
        description="Sieben Capabilities — alle clientseitig anspielbar."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD_ORDER.map((id) => {
            const c = METHOD_CONFIGS[id];
            const Icon = c.icon;
            const isActive = id === methodId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMethodId(id);
                  setResult(null);
                  setError(null);
                }}
                className={`flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                    : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-brand-700" : "text-ink-500"
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`text-sm font-semibold ${
                      isActive ? "text-brand-900" : "text-ink-900"
                    }`}
                  >
                    {c.label}
                  </span>
                </span>
                <span className="line-clamp-2 text-xs text-ink-600">
                  {c.description}
                </span>
              </button>
            );
          })}
        </div>
      </DashboardCard>

      {/* Kontext-Hinweis (read-only) */}
      <DashboardCard
        title="Kontext für diesen Aufruf"
        description="Branchen-Kontext kommt aus dem Demo-Business und wird automatisch eingebettet."
      >
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <ContextItem label="Betrieb" value={context.businessName} />
          <ContextItem label="Branche" value={context.industryKey} />
          <ContextItem label="Stadt" value={context.city ?? "—"} />
          <ContextItem label="Paket" value={context.packageTier} />
          <ContextItem
            label="Tonalität"
            value={
              context.toneOfVoice.length > 0
                ? context.toneOfVoice.join(", ")
                : "(neutral)"
            }
          />
          <ContextItem
            label="USPs"
            value={
              context.uniqueSellingPoints.length > 0
                ? context.uniqueSellingPoints.join(" · ")
                : "(noch nicht hinterlegt)"
            }
          />
        </dl>
      </DashboardCard>

      {/* Dynamisches Formular */}
      <DashboardCard
        title={`Eingaben für „${config.label}"`}
        description={config.description}
      >
        <div className="space-y-4">
          {config.fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              value={formValues[field.name]}
              onChange={(v) => setField(field.name, v)}
            />
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-ink-500">
              Alle Aufrufe sind deterministisch — gleiche Eingaben liefern
              denselben Output.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Wand2 className="h-4 w-4" aria-hidden />
              )}
              {pending ? "Generiere…" : "Generieren"}
            </button>
          </div>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
              <div>
                <p className="font-semibold">Fehler beim Generieren</p>
                <p className="mt-0.5 text-xs">{error}</p>
              </div>
            </div>
          ) : null}
        </div>
      </DashboardCard>

      {/* Rate-Limit-Card (statt Result, wenn 429) */}
      {rateLimit ? (
        <RateLimitCard
          state={rateLimit}
          onSwitchToMock={() => {
            setProviderKey("mock");
            setRateLimit(null);
            setError(null);
          }}
        />
      ) : null}

      {/* Ergebnis */}
      {result && !rateLimit ? <ResultPanel result={result} /> : null}
    </div>
  );
}

/**
 * Eigenes UI für 429-Antworten. Statt generischer Fehlerbox: klare
 * Aussage, Countdown, CTA.
 */
function RateLimitCard({
  state,
  onSwitchToMock,
}: {
  state: RateLimitState;
  onSwitchToMock: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const resetTime = new Date(state.resetAtUtc).getTime();
  const remainingMs = Math.max(0, resetTime - now);
  const hours = Math.floor(remainingMs / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);
  const countdown = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const pct = state.capUsd > 0 ? Math.min(100, (state.spentUsd / state.capUsd) * 100) : 100;

  return (
    <div
      role="alert"
      className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <Ban className="mt-0.5 h-5 w-5 flex-none text-amber-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-amber-900">
            Tages-Budget erreicht
          </h3>
          <p className="mt-1 text-sm text-amber-800">{state.message}</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-white/60 p-3">
        <div className="flex items-center justify-between gap-2 text-xs text-amber-900">
          <span className="font-medium">
            ${state.spentUsd.toFixed(4)} von ${state.capUsd.toFixed(2)} verbraucht
          </span>
          <span>{pct.toFixed(0)} %</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-200">
          <div className="h-full bg-amber-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-white/60 p-3 text-sm text-amber-900">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" aria-hidden />
          Reset in <strong className="font-mono tabular-nums">{countdown}</strong>{" "}
          (UTC-Mitternacht)
        </span>
        <button
          type="button"
          onClick={onSwitchToMock}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
        >
          Auf Mock wechseln
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50 px-3 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-ink-900">
        {value}
      </dd>
    </div>
  );
}

interface FieldRendererProps {
  readonly field: PlaygroundField;
  readonly value: string | number | boolean | undefined;
  readonly onChange: (v: string | number | boolean | undefined) => void;
}

function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const labelEl = (
    <label
      htmlFor={field.name}
      className="block text-sm font-medium text-ink-900"
    >
      {field.label}
      {"required" in field && field.required ? (
        <span className="ml-1 text-rose-600" aria-label="Pflichtfeld">
          *
        </span>
      ) : null}
    </label>
  );
  const hintEl =
    "hint" in field && field.hint ? (
      <p className="mt-1 text-xs text-ink-500">{field.hint}</p>
    ) : null;

  const baseInputClass =
    "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

  switch (field.kind) {
    case "text":
      return (
        <div>
          {labelEl}
          <input
            id={field.name}
            type="text"
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          />
          {hintEl}
        </div>
      );
    case "textarea":
      return (
        <div>
          {labelEl}
          <textarea
            id={field.name}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          />
          {hintEl}
        </div>
      );
    case "select":
      return (
        <div>
          {labelEl}
          <select
            id={field.name}
            value={typeof value === "string" ? value : field.options[0]?.value}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {hintEl}
        </div>
      );
    case "number":
      return (
        <div>
          {labelEl}
          <input
            id={field.name}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className={baseInputClass}
          />
          {hintEl}
        </div>
      );
    case "switch":
      return (
        <div className="flex items-center gap-2">
          <input
            id={field.name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor={field.name} className="text-sm text-ink-900">
            {field.label}
          </label>
          {hintEl}
        </div>
      );
  }
}
