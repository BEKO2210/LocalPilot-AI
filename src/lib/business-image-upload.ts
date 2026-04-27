/**
 * Pure-Logic-Helper für Logo- und Hero-Bild-Uploads (Code-Session 51).
 *
 * Drei Verantwortlichkeiten, alle isoliert testbar:
 *   1. `validateImageFile(file, kind)` — client-side Pre-Check
 *      (Mime + Größe), bevor wir den Upload starten. UX-Sache —
 *      die Server-Route validiert authoritative.
 *   2. `extensionForMime(mime)` — von Mime auf Datei-Endung
 *      mappen. Wir bauen den Storage-Pfad selbst (`<slug>/<kind>.<ext>`),
 *      damit Re-Uploads dieselbe Datei überschreiben.
 *   3. `submitImageUpload(slug, kind, file)` — fetch-Wrapper mit
 *      klarem Result-Mapping (server / not-authed / forbidden /
 *      validation / fail). Symmetrisch zum Submit-Helper aus
 *      Session 50.
 *
 * Wichtig: SVG ist bewusst NICHT in der Whitelist — Script-Tag
 * im SVG ist ein bekannter XSS-Vektor. Wenn wir Vektor-Logos
 * brauchen, kommt der Pfad mit zusätzlicher Sanitize-Schicht.
 */

export type ImageKind = "logo" | "cover" | "service";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = ["image/png", "image/jpeg", "image/webp"] as const;

/** Was die UI als Validierungs-Antwort zurückbekommt. */
export type ImageValidation =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string };

export function validateImageFile(file: File): ImageValidation {
  if (!file || typeof file.size !== "number") {
    return { ok: false, message: "Bitte eine Bild-Datei auswählen." };
  }
  if (file.size === 0) {
    return { ok: false, message: "Die Datei ist leer." };
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      message: `Datei ist zu groß (${mb} MB). Maximum sind 5 MB.`,
    };
  }
  if (!(ALLOWED_MIMES as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      message:
        "Nur PNG, JPEG oder WebP. SVG ist aus Sicherheitsgründen nicht erlaubt.",
    };
  }
  return { ok: true };
}

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

/**
 * Baut den Storage-Pfad relativ zum Bucket. Slug-basiert für
 * lesbare CDN-URLs; Re-Uploads gleicher Slug+Kind überschreiben
 * dieselbe Datei (Server nutzt `upsert: true`).
 *
 * Konventionen:
 *   - `logo` / `cover` → `<slug>/<kind>.<ext>` (eine Datei pro Betrieb)
 *   - `service`        → `<slug>/services/<serviceId>.<ext>`
 *     (eine Datei pro Service; `serviceId` muss eine echte UUID
 *     sein, sonst landet die Datei unter einem Pseudo-Pfad und
 *     wird beim ersten Speichern zur Waise — UI gated den Upload
 *     entsprechend).
 */
export function buildStoragePath(
  slug: string,
  kind: ImageKind,
  mime: string,
  options: { readonly serviceId?: string } = {},
): string {
  const ext = extensionForMime(mime);
  if (kind === "service") {
    if (!options.serviceId) {
      throw new Error(
        "buildStoragePath: serviceId ist Pflicht für kind='service'.",
      );
    }
    return `${slug}/services/${options.serviceId}.${ext}`;
  }
  return `${slug}/${kind}.${ext}`;
}

// ---------------------------------------------------------------------------
// Submit-Result + Fetch-Wrapper
// ---------------------------------------------------------------------------

export type ImageUploadResult =
  | {
      readonly kind: "server";
      readonly publicUrl: string;
      readonly path: string;
    }
  | { readonly kind: "not-authed" }
  | { readonly kind: "forbidden" }
  | { readonly kind: "validation"; readonly message: string }
  | { readonly kind: "fail"; readonly reason: string };

export interface SubmitDeps {
  readonly fetchImpl?: typeof fetch;
}

interface ApiSuccessBody {
  readonly ok?: boolean;
  readonly publicUrl?: string;
  readonly path?: string;
}
interface ApiErrorBody {
  readonly error?: string;
  readonly message?: string;
}

export interface UploadOptions {
  /** Pflicht für kind="service" — UUID des Service-Datensatzes. */
  readonly serviceId?: string;
}

export async function submitImageUpload(
  slug: string,
  kind: ImageKind,
  file: File,
  deps: SubmitDeps = {},
  options: UploadOptions = {},
): Promise<ImageUploadResult> {
  // Client-side Pre-Check — spart einen Roundtrip bei offensichtlich
  // ungültigen Dateien. Server validiert authoritative.
  const v = validateImageFile(file);
  if (!v.ok) return { kind: "validation", message: v.message };

  if (kind === "service" && !options.serviceId) {
    return {
      kind: "validation",
      message: "serviceId fehlt für Service-Bild-Upload.",
    };
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  const formData = new FormData();
  formData.append("kind", kind);
  formData.append("file", file);
  if (options.serviceId) {
    formData.append("serviceId", options.serviceId);
  }

  let response: Response;
  try {
    response = await fetchImpl(
      `/api/businesses/${encodeURIComponent(slug)}/image`,
      {
        method: "POST",
        body: formData,
      },
    );
  } catch (err) {
    return {
      kind: "fail",
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
    if (!body?.publicUrl || !body.path) {
      return { kind: "fail", reason: "Server-Antwort ohne URL." };
    }
    return {
      kind: "server",
      publicUrl: body.publicUrl,
      path: body.path,
    };
  }

  if (response.status === 401) return { kind: "not-authed" };
  if (response.status === 403) return { kind: "forbidden" };

  let errBody: ApiErrorBody | null = null;
  try {
    errBody = (await response.json()) as ApiErrorBody;
  } catch {
    /* ignore */
  }
  if (response.status === 400) {
    return {
      kind: "validation",
      message: errBody?.message ?? "Ungültige Anfrage.",
    };
  }
  return {
    kind: "fail",
    reason: errBody?.message ?? `Server-Antwort ${response.status}`,
  };
}

/** User-sichtbarer Hinweis pro Result-Variante. */
export function userMessageForResult(result: ImageUploadResult): string {
  switch (result.kind) {
    case "server":
      return "Bild hochgeladen.";
    case "not-authed":
      return "Bitte zuerst einloggen.";
    case "forbidden":
      return "Du bist nicht berechtigt, dieses Bild hochzuladen.";
    case "validation":
      return result.message;
    case "fail":
      return `Hochladen fehlgeschlagen: ${result.reason}`;
  }
}
