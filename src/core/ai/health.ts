/**
 * Health-Snapshot der KI-Schicht (Code-Session 30).
 *
 * Pure Funktion: nimmt einen ENV-Record entgegen und liefert ein
 * `HealthSnapshot`-Objekt zurück. Dadurch im Smoketest aufrufbar
 * ohne HTTP-Roundtrip.
 *
 * Privacy: wir geben nie den Key-Wert selbst preis, nur ob er
 * gesetzt ist (`keyPresent: boolean`).
 */

import { AI_PROVIDER_KEYS, type AIProviderKey } from "@/types/common";
import { getDailyCapUsd, previewBudget } from "./cost/budget";

const KEY_ENV_VAR: Record<AIProviderKey, string | null> = {
  mock: null,
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
};

const MODEL_ENV_VAR: Record<AIProviderKey, string | null> = {
  mock: null,
  openai: "OPENAI_MODEL",
  anthropic: "ANTHROPIC_MODEL",
  gemini: "GEMINI_MODEL",
};

const DEFAULT_MODEL: Record<AIProviderKey, string> = {
  mock: "default",
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-5",
  gemini: "gemini-2.0-flash",
};

export interface ProviderHealth {
  readonly key: AIProviderKey;
  /** Ist der Provider grundsätzlich nutzbar? Mock immer; andere nur mit Key. */
  readonly available: boolean;
  /** Ist der API-Key in der ENV gesetzt? */
  readonly keyPresent: boolean;
  /** Welches Modell ist aktiv (ENV-Override oder Default)? */
  readonly model: string;
  /** Falls nicht verfügbar: kurze Erklärung. */
  readonly reason?: string;
}

export interface HealthSnapshot {
  readonly timestamp: string;
  readonly apiAuth: {
    /** `LP_AI_API_KEY` ist in der Server-ENV gesetzt → Route ist scharf. */
    readonly enabled: boolean;
  };
  readonly providers: Readonly<Record<AIProviderKey, ProviderHealth>>;
  readonly budget: {
    readonly spentUsd: number;
    readonly capUsd: number;
    readonly remainingUsd: number;
    readonly percentUsed: number;
    readonly resetAtUtc: string;
  };
}

function nextUtcMidnightIso(now = new Date()): string {
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );
  return next.toISOString();
}

/**
 * Liefert eine Momentaufnahme. Nimmt explizit `env` als Parameter,
 * damit Tests das ENV-Mocking sauber durchführen können.
 */
export function getHealthSnapshot(
  env: Readonly<Record<string, string | undefined>> = process.env,
): HealthSnapshot {
  const apiAuthEnabled = (env["LP_AI_API_KEY"]?.trim() ?? "").length > 0;

  const providers = {} as Record<AIProviderKey, ProviderHealth>;
  for (const key of AI_PROVIDER_KEYS) {
    const keyVar = KEY_ENV_VAR[key];
    const modelVar = MODEL_ENV_VAR[key];
    const keyPresent =
      keyVar === null || (env[keyVar]?.trim() ?? "").length > 0;
    const modelOverride = modelVar ? env[modelVar]?.trim() : undefined;
    const model =
      modelOverride && modelOverride.length > 0
        ? modelOverride
        : DEFAULT_MODEL[key];
    const available = keyPresent;
    const provider: ProviderHealth = {
      key,
      available,
      keyPresent,
      model,
      ...(available ? {} : { reason: `${keyVar} ist nicht gesetzt` }),
    };
    providers[key] = provider;
  }

  const cap = getDailyCapUsd(env);
  const preview = previewBudget(0, "default", cap);
  const percentUsed =
    preview.capUsd > 0
      ? Math.round((preview.spentUsd / preview.capUsd) * 100)
      : 0;

  return {
    timestamp: new Date().toISOString(),
    apiAuth: { enabled: apiAuthEnabled },
    providers,
    budget: {
      spentUsd: preview.spentUsd,
      capUsd: preview.capUsd,
      remainingUsd: preview.remainingUsd,
      percentUsed,
      resetAtUtc: nextUtcMidnightIso(),
    },
  };
}
