/**
 * Business-Delete-Submit-Helper (Code-Session 69).
 *
 * Browser→`DELETE /api/businesses/<slug>`-Wrapper mit klarem
 * Result-Mapping. Symmetrisch zu Sessions 50/55/61
 * (submitBusinessUpdate / submitServicesUpdate /
 * callAIGenerate).
 */

export type BusinessDeleteResult =
  | {
      readonly kind: "server";
      readonly slug: string;
      readonly filesRemoved: number;
      readonly filesFailed: number;
    }
  | { readonly kind: "not-authed"; readonly message: string }
  | { readonly kind: "forbidden"; readonly message: string }
  | { readonly kind: "fail"; readonly status: number; readonly reason: string };

export interface SubmitDeps {
  readonly fetchImpl?: typeof fetch;
}

interface ApiSuccessBody {
  readonly ok?: boolean;
  readonly slug?: string;
  readonly filesRemoved?: number;
  readonly filesFailed?: number;
}

interface ApiErrorBody {
  readonly error?: string;
  readonly message?: string;
}

/**
 * Schickt `DELETE /api/businesses/<slug>` und mappt das
 * Response auf einen Result-Type. Wirft **nicht**.
 */
export async function submitBusinessDelete(
  slug: string,
  deps: SubmitDeps = {},
): Promise<BusinessDeleteResult> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(
      `/api/businesses/${encodeURIComponent(slug)}`,
      {
        method: "DELETE",
        credentials: "same-origin",
      },
    );
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
      slug: body?.slug ?? slug,
      filesRemoved: body?.filesRemoved ?? 0,
      filesFailed: body?.filesFailed ?? 0,
    };
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
      message: errBody?.message ?? "Bitte zuerst einloggen.",
    };
  }
  if (response.status === 403) {
    return {
      kind: "forbidden",
      message:
        errBody?.message ??
        "Du bist nicht berechtigt, diesen Betrieb zu löschen.",
    };
  }

  return {
    kind: "fail",
    status: response.status,
    reason: errBody?.message ?? errBody?.error ?? `Server-Antwort ${response.status}`,
  };
}

/** User-sichtbarer Hinweis pro Result-Kind (deutsch). */
export function userMessageForResult(result: BusinessDeleteResult): string | null {
  switch (result.kind) {
    case "server": {
      if (result.filesFailed > 0) {
        return `Betrieb gelöscht. ${result.filesRemoved} Dateien entfernt, ${result.filesFailed} konnten nicht aufgeräumt werden — der Betrieb ist trotzdem weg.`;
      }
      return `Betrieb gelöscht. ${result.filesRemoved} Dateien entfernt.`;
    }
    case "not-authed":
      return result.message;
    case "forbidden":
      return result.message;
    case "fail":
      return `Löschen fehlgeschlagen (${result.status}): ${result.reason}`;
  }
}
