/**
 * Pure-Logic-Helper für Social-Media-Post-UI (Code-Session 54).
 *
 * Vier isoliert testbare Verantwortlichkeiten:
 *
 *   1. UI-Labels (deutsch) für Platform / Goal / Length.
 *   2. `platformLimits(p)` — pro Plattform:
 *        - `hardChar`: maximale Zeichen, danach lehnt die Plattform ab.
 *        - `truncationChar`: ab hier wird im Feed das „Mehr"-Klick
 *          geschnitten — UX-relevanter als das Hard-Limit.
 *        - `recommendedHashtags`: Bereich (low/high) für die Pflege
 *          (Instagram 3–5, LinkedIn 3–5, Facebook 1–2,
 *          Google Business 0, WhatsApp-Status 0).
 *      Zahlen folgen den 2026-Patterns aus der Recherche.
 *   3. `assessLength(text, platform)` — `"ok" | "truncated" | "over"`.
 *      Hilft der UI, einen klaren Indikator zu zeigen statt nur eine
 *      Zahl.
 *   4. `composeFinalPost({ body, hashtags, includeHashtags })` —
 *      kombiniert Body und Tags zu einem versandfähigen Posttext.
 *      Tags landen plattformüblich am Ende mit Doppel-Newline-Spacer.
 */

import type {
  PostLength,
  SocialPlatform,
  SocialPostGoal,
} from "@/types/common";

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google_business: "Google Business",
  linkedin: "LinkedIn",
  whatsapp_status: "WhatsApp-Status",
};

export function platformLabel(p: SocialPlatform): string {
  return PLATFORM_LABELS[p];
}

const GOAL_LABELS: Record<SocialPostGoal, string> = {
  more_appointments: "Mehr Termine",
  promote_offer: "Angebot bewerben",
  new_service: "Neue Leistung vorstellen",
  collect_review: "Bewertung sammeln",
  seasonal: "Saison-Aktion",
  before_after: "Vorher/Nachher",
  trust_building: "Vertrauen aufbauen",
  team_intro: "Team vorstellen",
};

export function goalLabel(g: SocialPostGoal): string {
  return GOAL_LABELS[g];
}

const LENGTH_LABELS: Record<PostLength, string> = {
  short: "Kurz",
  medium: "Mittel",
  long: "Lang",
};

export function lengthLabel(l: PostLength): string {
  return LENGTH_LABELS[l];
}

// ---------------------------------------------------------------------------
// Platform-Limits
// ---------------------------------------------------------------------------

export interface PlatformLimits {
  /** Hartes Zeichen-Limit. Werte ≥ diesem zerschießen den Post. */
  readonly hardChar: number;
  /** Ab hier wird im Feed der „Mehr lesen"-Schnitt gemacht. */
  readonly truncationChar: number;
  /** Empfohlener Bereich für die Hashtag-Anzahl (low/high). */
  readonly recommendedHashtags: { readonly low: number; readonly high: number };
}

const LIMITS: Record<SocialPlatform, PlatformLimits> = {
  instagram: {
    hardChar: 2200,
    truncationChar: 125,
    recommendedHashtags: { low: 3, high: 5 },
  },
  facebook: {
    hardChar: 63206,
    truncationChar: 480,
    recommendedHashtags: { low: 1, high: 2 },
  },
  google_business: {
    // GBP-Posts sind ~1500 Zeichen (Aktualisierung: Type "Update")
    hardChar: 1500,
    truncationChar: 250,
    recommendedHashtags: { low: 0, high: 0 },
  },
  linkedin: {
    hardChar: 3000,
    truncationChar: 210,
    recommendedHashtags: { low: 3, high: 5 },
  },
  whatsapp_status: {
    // WhatsApp-Status erlaubt bis 700 Zeichen Text
    hardChar: 700,
    truncationChar: 700,
    recommendedHashtags: { low: 0, high: 0 },
  },
};

export function platformLimits(p: SocialPlatform): PlatformLimits {
  return LIMITS[p];
}

// ---------------------------------------------------------------------------
// Length-Assessment
// ---------------------------------------------------------------------------

export type LengthStatus = "ok" | "truncated" | "over";

export interface LengthAssessment {
  readonly status: LengthStatus;
  readonly chars: number;
  readonly hardChar: number;
  readonly truncationChar: number;
  /** User-sichtbarer Hinweis. */
  readonly hint: string;
}

export function assessLength(
  text: string,
  platform: SocialPlatform,
): LengthAssessment {
  const limits = platformLimits(platform);
  const chars = text.length;
  if (chars > limits.hardChar) {
    return {
      status: "over",
      chars,
      hardChar: limits.hardChar,
      truncationChar: limits.truncationChar,
      hint: `Über dem harten Limit (${limits.hardChar.toLocaleString("de-DE")} Zeichen) — ${platformLabel(platform)} würde ablehnen.`,
    };
  }
  if (chars > limits.truncationChar) {
    return {
      status: "truncated",
      chars,
      hardChar: limits.hardChar,
      truncationChar: limits.truncationChar,
      hint: `Im Feed wird ab Zeichen ${limits.truncationChar} ein „Mehr lesen"-Schnitt gemacht. Wichtige Info gehört in die ersten ${limits.truncationChar} Zeichen.`,
    };
  }
  return {
    status: "ok",
    chars,
    hardChar: limits.hardChar,
    truncationChar: limits.truncationChar,
    hint: `Komplett im sichtbaren Bereich (${chars} von ${limits.truncationChar} Zeichen vor dem Schnitt).`,
  };
}

// ---------------------------------------------------------------------------
// Final-Post-Komposition
// ---------------------------------------------------------------------------

export interface ComposeInput {
  readonly body: string;
  readonly hashtags: readonly string[];
  readonly includeHashtags: boolean;
}

/**
 * Setzt Body und Hashtags zu einem versandfähigen Posttext zusammen.
 * Tags hängen am Ende mit Doppel-Newline (so erwartet Instagram /
 * LinkedIn die Trennung). Doppelte Hashtags und solche ohne führendes
 * `#` werden defensiv normalisiert. Falls `includeHashtags = false`,
 * wird nur `body.trim()` zurückgegeben.
 */
export function composeFinalPost(input: ComposeInput): string {
  const trimmedBody = input.body.trim();
  if (!input.includeHashtags || input.hashtags.length === 0) {
    return trimmedBody;
  }
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const raw of input.hashtags) {
    const t = raw.trim();
    if (t.length === 0) continue;
    const tag = t.startsWith("#") ? t : `#${t}`;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(tag);
  }
  if (normalized.length === 0) return trimmedBody;
  return `${trimmedBody}\n\n${normalized.join(" ")}`;
}

// ---------------------------------------------------------------------------
// Hashtag-Empfehlungs-Status
// ---------------------------------------------------------------------------

export type HashtagAdvice = "ok" | "below" | "above" | "discouraged";

export function adviseHashtagCount(
  count: number,
  platform: SocialPlatform,
): { readonly status: HashtagAdvice; readonly hint: string } {
  const limits = platformLimits(platform);
  const { low, high } = limits.recommendedHashtags;
  if (high === 0) {
    if (count === 0) {
      return {
        status: "discouraged",
        hint: `${platformLabel(platform)} bevorzugt Posts ohne Hashtags — Tags ausblenden.`,
      };
    }
    return {
      status: "discouraged",
      hint: `${platformLabel(platform)} bevorzugt Posts ohne Hashtags. Empfehlung: keine Tags verwenden.`,
    };
  }
  if (count < low) {
    return {
      status: "below",
      hint: `${platformLabel(platform)} performt am besten mit ${low}–${high} Hashtags. Aktuell: ${count}.`,
    };
  }
  if (count > high) {
    return {
      status: "above",
      hint: `${platformLabel(platform)} performt am besten mit ${low}–${high} Hashtags. Aktuell: ${count} — eher reduzieren.`,
    };
  }
  return {
    status: "ok",
    hint: `${count} Hashtags — passend für ${platformLabel(platform)}.`,
  };
}
