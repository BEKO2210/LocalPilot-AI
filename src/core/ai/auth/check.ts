/**
 * Auth-Check für `/api/ai/*`-Routen (Code-Session 33).
 *
 * Reihenfolge der Akzeptanz:
 *   1. **Session-Cookie** `lp_ai_session` (HS256-JWT). UI-Pfad.
 *   2. **Bearer-Token** im `Authorization`-Header. CLI/Server-to-Server.
 *
 * Ohne Konfiguration der ENV ist die Route komplett gesperrt
 * (`503 Service Not Configured`) — verhindert versehentliche
 * Open-Endpoints.
 *
 * **ENV-Variablen** (siehe `.env.example`):
 *   - `LP_AI_API_KEY`        Bearer-Token, abwärtskompatibel mit Session 28.
 *   - `LP_AI_PASSWORD`       Login-Passwort (Default: `LP_AI_API_KEY`).
 *   - `LP_AI_SESSION_SECRET` HMAC-Signing-Key für Cookies (Default:
 *                             `LP_AI_API_KEY`). Mind. 32 Zeichen empfohlen.
 *
 * Faustregel für Production: `LP_AI_API_KEY` und
 * `LP_AI_SESSION_SECRET` separat halten und nur den
 * Session-Secret in den Browser-Cookies indirekt benutzen — dann
 * leakt ein gestohlener Bearer-Token nicht das Cookie-Secret.
 */

import { verifySessionToken } from "./session";

export const SESSION_COOKIE_NAME = "lp_ai_session";

export type AuthResult =
  | {
      readonly ok: true;
      readonly principal: string;
      readonly via: "cookie" | "bearer";
    }
  | {
      readonly ok: false;
      readonly status: number;
      readonly message: string;
    };

type AuthEnv = Readonly<Record<string, string | undefined>>;

function trimOrEmpty(v: string | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Liest die ENV-relevanten Konfig-Werte mit Default-Auflösung.
 * Exportiert, damit Login/Logout/Me identische Defaults sehen.
 */
export function getAuthConfig(env: AuthEnv = process.env): {
  apiKey: string;
  password: string;
  sessionSecret: string;
  configured: boolean;
} {
  const apiKey = trimOrEmpty(env.LP_AI_API_KEY);
  const password = trimOrEmpty(env.LP_AI_PASSWORD) || apiKey;
  const sessionSecret = trimOrEmpty(env.LP_AI_SESSION_SECRET) || apiKey;
  const configured = apiKey.length > 0 || sessionSecret.length > 0;
  return { apiKey, password, sessionSecret, configured };
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (trimmed.length === 0) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const name = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1);
    try {
      result[name] = decodeURIComponent(value);
    } catch {
      result[name] = value;
    }
  }
  return result;
}

/**
 * Hauptfunktion. Wird von allen geschützten Route-Handlern aufgerufen.
 */
export function checkAuth(
  req: Request,
  env: AuthEnv = process.env,
): AuthResult {
  const cfg = getAuthConfig(env);
  if (!cfg.configured) {
    return {
      ok: false,
      status: 503,
      message:
        "API ist nicht aktiviert. Setze LP_AI_API_KEY (oder LP_AI_SESSION_SECRET) in der Server-ENV.",
    };
  }

  // 1. Session-Cookie
  if (cfg.sessionSecret.length > 0) {
    const cookies = parseCookies(req.headers.get("cookie"));
    const sessionToken = cookies[SESSION_COOKIE_NAME];
    if (sessionToken) {
      const payload = verifySessionToken(sessionToken, cfg.sessionSecret);
      if (payload) {
        return { ok: true, principal: payload.sub, via: "cookie" };
      }
    }
  }

  // 2. Bearer-Token (legacy / CLI)
  if (cfg.apiKey.length > 0) {
    const auth = req.headers.get("authorization") ?? "";
    const match = auth.match(/^Bearer\s+(.+)$/);
    if (match && match[1]?.trim() === cfg.apiKey) {
      return { ok: true, principal: "bearer", via: "bearer" };
    }
  }

  return {
    ok: false,
    status: 401,
    message: "Ungültige oder fehlende Authentifizierung.",
  };
}
