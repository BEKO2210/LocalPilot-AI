/**
 * CSRF-Schutz für mutating API-Routen (Code-Session 66).
 *
 * Browser senden Cookies bei Cross-Site-POST automatisch mit —
 * dadurch kann eine bösartige Drittanbieter-Site einen
 * eingeloggten Owner dazu verleiten, mutierende Requests zu
 * unserem Server zu schicken (CSRF). SameSite=Lax-Cookies
 * (Default in modernen Browsern) blockieren das für die
 * meisten Fälle, aber:
 *   - Ältere Browser oder fehlerhafte Cookie-Configs.
 *   - Top-level navigations können trotz Lax durchkommen.
 *   - Defense-in-Depth ist Pflicht für Production.
 *
 * Strategie: **Origin-/Referer-Header-Check** als
 * primärer Schutz. Bei jeder mutating-Route prüfen wir, dass
 * der Request von einem erlaubten Origin kommt — also unserer
 * eigenen Frontend-Domain. Wenn beide Header fehlen ODER
 * mismatchen, antworten wir mit 403.
 *
 * **Bypass für Bearer-Token**: Server-zu-Server-Calls und
 * CLI-Scripts haben keinen Browser-Origin. Wenn ein gültiger
 * Bearer-Token gesetzt ist, überspringen wir den CSRF-Check
 * (der Token ist unmöglich aus einer fremden Site zu erraten,
 * also kein CSRF-Vektor).
 *
 * Allow-List wird aus ENV gelesen
 * (`LP_CSRF_ALLOWED_ORIGINS`, comma-separated) plus dem
 * Request-Host selbst (Same-Origin ist immer OK). Bei leerer
 * ENV greift Same-Origin-Only.
 */

export type CsrfResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string };

export interface CsrfOptions {
  /** Erlaubte Origins zusätzlich zu Same-Origin (z. B. Custom-Domain). */
  readonly allowedOrigins?: readonly string[];
  /**
   * Bei `true` erlaubt der Helper Requests ohne Origin/Referer
   * — nur für Tests! In Production immer `false`.
   */
  readonly allowEmptyOrigin?: boolean;
}

/**
 * Liest `Origin` mit Fallback auf `Referer`. Beide Header sind
 * bei modernen Browsern gesetzt; fetch-API setzt mindestens
 * Origin, klassische Form-Submits Referer.
 */
function readRequestOrigin(req: Request): {
  origin: string | null;
  via: "origin" | "referer" | null;
} {
  const origin = req.headers.get("origin");
  if (origin && origin !== "null") {
    return { origin, via: "origin" };
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const u = new URL(referer);
      return { origin: `${u.protocol}//${u.host}`, via: "referer" };
    } catch {
      // malformed Referer
    }
  }
  return { origin: null, via: null };
}

/**
 * Liest die eigene Origin aus dem Request — `Host`-Header
 * (oder `X-Forwarded-Host` bei Reverse-Proxy). Schema kommt
 * aus `X-Forwarded-Proto` (Default `https` für sicherere
 * Annahme).
 */
function readSelfOrigin(req: Request): string | null {
  const fwdHost = req.headers.get("x-forwarded-host");
  const host = fwdHost ?? req.headers.get("host");
  if (!host) return null;
  const fwdProto = req.headers.get("x-forwarded-proto");
  const proto =
    fwdProto ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Parst die Allow-List aus ENV-String (comma-separated) zu
 * normalisierten Origins.
 */
export function parseAllowedOrigins(env: string | undefined): readonly string[] {
  if (!env) return [];
  return env
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      // ENV-Werte können mit oder ohne Trailing-Slash kommen.
      try {
        const u = new URL(s);
        return `${u.protocol}//${u.host}`;
      } catch {
        return s;
      }
    });
}

/**
 * Hauptcheck. Liefert `{ok: true}` wenn der Request akzeptabel
 * ist; sonst `{ok: false, reason}` mit klarer Begründung
 * fürs Server-Logging.
 */
export function verifyCsrfOrigin(
  req: Request,
  options: CsrfOptions = {},
): CsrfResult {
  const method = req.method.toUpperCase();
  // Read-Methoden (GET/HEAD/OPTIONS) sind kein CSRF-Vektor.
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { ok: true };
  }

  // Bearer-Token bypasst Origin-Check — der Token ist
  // unmöglich aus einer fremden Site zu erraten.
  const auth = req.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return { ok: true };
  }

  const { origin, via } = readRequestOrigin(req);
  if (!origin) {
    if (options.allowEmptyOrigin) return { ok: true };
    return {
      ok: false,
      reason:
        "Weder Origin noch Referer-Header gesetzt. CSRF-Schutz greift, Request abgelehnt.",
    };
  }

  const self = readSelfOrigin(req);
  const candidates = new Set<string>(options.allowedOrigins ?? []);
  if (self) candidates.add(self);

  if (candidates.has(origin)) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: `Origin ${origin} (via ${via}) nicht in Allow-List ${[...candidates].join(", ") || "(leer)"}.`,
  };
}

/**
 * Convenience: wirft 403-NextResponse bei Mismatch. Aufruf in
 * Route: `const csrf = enforceCsrf(req); if (csrf) return csrf;`.
 *
 * Nutzt `Response` direkt statt `NextResponse`, damit der
 * Helper auch ohne Next.js-Context testbar bleibt (Tests
 * benutzen ein Stub-Request).
 */
export function csrfErrorResponse(reason: string): Response {
  return new Response(
    JSON.stringify({
      error: "csrf_blocked",
      message:
        "Anfrage wegen CSRF-Schutz abgelehnt. Bitte über die offizielle Frontend-Domain aufrufen.",
      detail: reason,
    }),
    {
      status: 403,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    },
  );
}

/**
 * Route-Level-Wrapper: liest die Allow-List aus
 * `LP_CSRF_ALLOWED_ORIGINS` ENV und ruft `verifyCsrfOrigin`.
 * Liefert `null` wenn ok, sonst eine fertig formatierte
 * 403-Response.
 */
export function enforceCsrf(req: Request): Response | null {
  const allowedOrigins = parseAllowedOrigins(
    process.env["LP_CSRF_ALLOWED_ORIGINS"],
  );
  const result = verifyCsrfOrigin(req, { allowedOrigins });
  if (result.ok) return null;
  return csrfErrorResponse(result.reason);
}
