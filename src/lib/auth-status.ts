/**
 * Pure-Logic-Helper für die Login-UI (Code-Session 43).
 *
 * Mappt API-Responses und Browser-Errors auf User-freundliche
 * Status-Messages. Wird vom Login-Form (Client Component) genutzt
 * — separat extrahiert, damit es ohne React-Runtime testbar ist.
 */

export type AuthStatusKind = "idle" | "sending" | "sent" | "error" | "unconfigured";

export interface AuthStatus {
  readonly kind: AuthStatusKind;
  readonly message: string;
  /** Optional: Untertitel mit Folge-Hinweis (Posteingang prüfen etc.). */
  readonly hint?: string;
}

export const IDLE_STATUS: AuthStatus = {
  kind: "idle",
  message: "",
};

export const SENDING_STATUS: AuthStatus = {
  kind: "sending",
  message: "Login-Link wird gesendet …",
};

export const SUCCESS_STATUS: AuthStatus = {
  kind: "sent",
  message: "Login-Link gesendet.",
  hint: "Wenn die E-Mail bei uns existiert oder neu registriert wird, schicken wir einen Link. Bitte prüfe deinen Posteingang (auch Spam).",
};

interface ApiErrorBody {
  readonly error?: string;
  readonly message?: string;
}

/**
 * Mapt einen HTTP-Status + Body auf eine User-Message.
 *
 * - 503 + supabase_not_configured → eigener „nicht eingerichtet"-Text
 *   mit Hinweis auf Demo-Mode (statt einer technischen 503).
 * - 400/422 → Nachricht aus dem Body weiterreichen.
 * - 5xx ohne 503-Spezialfall → generischer Server-Hinweis.
 * - Sonst → Fallback-Text.
 */
export function statusFromApiResponse(
  status: number,
  body: ApiErrorBody | null,
): AuthStatus {
  const errorCode = body?.error;
  const apiMessage = body?.message;

  if (status === 503 && errorCode === "supabase_not_configured") {
    return {
      kind: "unconfigured",
      message: "Login ist gerade nicht aktiv.",
      hint: "Diese Vorschau läuft im Demo-Modus ohne Auth-Backend. Du kannst die Demo-Betriebe trotzdem unter /demo erkunden.",
    };
  }
  if (status === 400 && errorCode === "invalid_email") {
    return {
      kind: "error",
      message: apiMessage ?? "Bitte gib eine gültige E-Mail-Adresse ein.",
    };
  }
  if (status === 400) {
    return {
      kind: "error",
      message: apiMessage ?? "Anfrage war ungültig.",
    };
  }
  if (status >= 500) {
    return {
      kind: "error",
      message: "Serverfehler beim Versand des Login-Links.",
      hint: "Bitte versuche es in einer Minute noch einmal.",
    };
  }
  return {
    kind: "error",
    message: apiMessage ?? `Login-Link konnte nicht gesendet werden (HTTP ${status}).`,
  };
}

/**
 * Mapt einen geworfenen Fetch-/Netzwerk-Error auf eine User-Message.
 * Kommt z. B. dann zum Tragen, wenn `/api/auth/magic-link` im
 * Static-Build gar nicht existiert (404 sieht der Browser oft als
 * fetch-failure ohne Status).
 */
export function statusFromNetworkError(err: unknown): AuthStatus {
  const detail = err instanceof Error ? err.message : "";
  return {
    kind: "error",
    message: "Login-Link konnte nicht gesendet werden.",
    hint: detail
      ? `Netzwerk-/Build-Fehler: ${detail}`
      : "Bist du auf einer Static-Preview ohne API-Routen? Dann öffne die Vercel-URL.",
  };
}

/**
 * Trim + sehr leichte Form-Vor-Validierung. Echte Validierung liegt
 * server-seitig, das hier ist nur UX („Submit-Button erst aktiv,
 * wenn nach Augenmaß Mail-Format passt").
 */
export function looksLikeEmail(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 3) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
