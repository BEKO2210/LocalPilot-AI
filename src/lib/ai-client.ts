/**
 * AI-Client-Helper für die Browser-Seite (Code-Session 61).
 *
 * Zentrale, testbare Schnittstelle zur API-Route `/api/ai/generate`.
 * Wird von Dashboard-Panels (Reviews, Social, …) genutzt, die einen
 * Mock-/Live-Provider-Toggle anbieten. Spiegelt das Pattern aus
 * Sessions 50/51/55 (Submit-Helper mit Result-Kinds).
 *
 * **Nicht** für AIPlayground — das hat aktuell noch seinen eigenen
 * inline-Aufruf aus Session 28. Eine Konsolidierung wäre legitim,
 * sprengt aber den Scope von 61 und kommt später als Light-Pass.
 *
 * Sicherheits-Note: API-Keys liegen serverseitig in
 * `/api/ai/generate`; der Browser schickt nur den User-spezifischen
 * Bearer-Token (oder den Cookie-Session via `credentials: same-origin`).
 */

import type { AIProviderKey } from "@/types/common";

/** localStorage-Key — geteilt mit AIPlayground (Code-Session 28). */
export const AI_TOKEN_STORAGE_KEY = "lp:ai-api-token:v1";

/** Methoden-Namen, die `/api/ai/generate` versteht. */
export type AIGenerateMethod =
  | "generateWebsiteCopy"
  | "improveServiceDescription"
  | "generateFaqs"
  | "generateCustomerReply"
  | "generateReviewRequest"
  | "generateSocialPost"
  | "generateOfferCampaign";

export interface AIGenerateRequest {
  readonly method: AIGenerateMethod;
  readonly providerKey: AIProviderKey;
  readonly input: unknown;
  /** Optional Bearer-Token. Wenn leer, läuft der Aufruf nur über die Cookie-Session. */
  readonly apiToken?: string;
}

export interface AIGenerateRateLimit {
  readonly capUsd: number;
  readonly spentUsd: number;
  readonly resetAtUtc: string;
  readonly message: string;
}

export type AIGenerateResult =
  | {
      readonly kind: "server";
      readonly output: unknown;
      readonly cost?: unknown;
    }
  | { readonly kind: "not-authed"; readonly message: string }
  | { readonly kind: "forbidden"; readonly message: string }
  | { readonly kind: "rate-limit"; readonly limit: AIGenerateRateLimit }
  | { readonly kind: "static-build" }
  | { readonly kind: "fail"; readonly status: number; readonly reason: string };

export interface CallDeps {
  readonly fetchImpl?: typeof fetch;
}

interface ApiSuccessBody {
  readonly output?: unknown;
  readonly cost?: unknown;
}

interface ApiErrorBody {
  readonly error?: string;
  readonly message?: string;
  readonly cost?: {
    readonly capUsd?: number;
    readonly spentUsd?: number;
    readonly resetAtUtc?: string;
  };
}

/**
 * Ruft `/api/ai/generate` auf und mappt den Response auf einen
 * Result-Type. Wirft **nicht** — alle Fehlerklassen werden als
 * `kind: "fail" | "not-authed" | …` zurückgegeben, damit die UI
 * zentral mappen kann.
 *
 * Wenn der Bearer-Token leer ist, schickt der Browser nur die
 * Cookie-Session mit (`credentials: "same-origin"`). Die
 * `/api/ai/generate`-Route akzeptiert beide Auth-Wege (siehe
 * `core/ai/auth/check.ts`, Session 28).
 */
export async function callAIGenerate(
  req: AIGenerateRequest,
  deps: CallDeps = {},
): Promise<AIGenerateResult> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (req.apiToken && req.apiToken.trim().length > 0) {
    headers.authorization = `Bearer ${req.apiToken.trim()}`;
  }

  let response: Response;
  try {
    response = await fetchImpl("/api/ai/generate", {
      method: "POST",
      headers,
      credentials: "same-origin",
      body: JSON.stringify({
        method: req.method,
        providerKey: req.providerKey,
        input: req.input,
      }),
    });
  } catch (err) {
    return {
      kind: "fail",
      status: 0,
      reason: err instanceof Error ? err.message : "Netzwerk-Fehler",
    };
  }

  if (response.ok) {
    let body: ApiSuccessBody | null = null;
    try {
      body = (await response.json()) as ApiSuccessBody;
    } catch {
      /* ignore */
    }
    return {
      kind: "server",
      output: body?.output,
      ...(body?.cost ? { cost: body.cost } : {}),
    };
  }

  if (response.status === 404) {
    // Static-Export-Build hat keine API-Routen — die UI sollte
    // einen Hinweis zeigen, dass Live-Provider nur in einem
    // SSR-Deploy funktioniert, und auf den Mock-Provider zurück
    // fallen.
    return { kind: "static-build" };
  }

  let errBody: ApiErrorBody | null = null;
  try {
    errBody = (await response.json()) as ApiErrorBody;
  } catch {
    /* ignore */
  }

  if (response.status === 401) {
    return {
      kind: "not-authed",
      message:
        errBody?.message ??
        "Nicht eingeloggt. Bitte zuerst über Login oder Bearer-Token authentifizieren.",
    };
  }
  if (response.status === 403) {
    return {
      kind: "forbidden",
      message:
        errBody?.message ??
        "Zugriff verweigert. Token oder Session hat keine Berechtigung.",
    };
  }

  if (response.status === 429 && errBody?.cost) {
    return {
      kind: "rate-limit",
      limit: {
        capUsd: errBody.cost.capUsd ?? 0,
        spentUsd: errBody.cost.spentUsd ?? 0,
        resetAtUtc:
          errBody.cost.resetAtUtc ??
          new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        message: errBody.message ?? "Tages-Budget erschöpft.",
      },
    };
  }

  return {
    kind: "fail",
    status: response.status,
    reason: errBody?.message ?? errBody?.error ?? `Server-Antwort ${response.status}`,
  };
}

/** User-sichtbarer Hinweis pro Result-Kind (deutsch). */
export function userMessageForResult(result: AIGenerateResult): string | null {
  switch (result.kind) {
    case "server":
      return null; // erfolgreich — UI rendert Output
    case "not-authed":
      return result.message;
    case "forbidden":
      return result.message;
    case "rate-limit":
      return `${result.limit.message} (${result.limit.spentUsd.toFixed(2)} / ${result.limit.capUsd.toFixed(2)} USD)`;
    case "static-build":
      return "Live-Provider sind nur im SSR-Deploy verfügbar. Mock-Provider funktioniert jederzeit.";
    case "fail":
      return `Fehler ${result.status}: ${result.reason}`;
  }
}
