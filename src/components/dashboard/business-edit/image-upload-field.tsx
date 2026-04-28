"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import {
  submitImageUpload,
  userMessageForResult,
  type ImageKind,
} from "@/lib/business-image-upload";

/**
 * Image-Upload-Field für Logo / Cover-Bild (Code-Session 51).
 *
 * Alleinstehende Komponente — wird im `BusinessEditForm` via
 * Render-Prop genutzt. Die Komponente kennt **nur** die aktuelle
 * URL und meldet via `onUploaded(url)` die neue URL zurück. Der
 * Form-Hook setzt sie dann ins Form-Field, der User speichert
 * regulär.
 *
 * Drei Zustände:
 *   - Idle: aktuelles Bild + „Hochladen"- und „Entfernen"-Buttons.
 *   - Uploading: Spinner.
 *   - Done: Success-Meldung (kurz sichtbar).
 *
 * Validierung: Mime + Size client-side (UX), authoritative
 * server-side. SVG wird abgewiesen.
 */
export function ImageUploadField({
  slug,
  kind,
  serviceId,
  currentUrl,
  onUploaded,
  onCleared,
  label,
  description,
  disabled,
  disabledHint,
  compact,
}: {
  readonly slug: string;
  readonly kind: ImageKind;
  /** Pflicht für kind='service'. */
  readonly serviceId?: string;
  readonly currentUrl: string | undefined;
  readonly onUploaded: (publicUrl: string) => void;
  readonly onCleared: () => void;
  readonly label: string;
  readonly description?: string;
  /** Sperrt den Upload-Button (z.B. solange ein Service noch eine Pseudo-ID hat). */
  readonly disabled?: boolean;
  /** Optionaler Hinweistext, wenn `disabled` true ist. */
  readonly disabledHint?: string;
  /** Kompaktere Darstellung für In-Card-Verwendung. */
  readonly compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    message: string;
  } | null>(null);

  function pickFile() {
    setFeedback(null);
    inputRef.current?.click();
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset, damit selektieren der gleichen Datei nochmal triggert.
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      const result = await submitImageUpload(slug, kind, file, {}, { serviceId });
      if (result.kind === "server") {
        onUploaded(result.publicUrl);
        setFeedback({ kind: "ok", message: "Bild hochgeladen." });
      } else {
        setFeedback({
          kind: "err",
          message: userMessageForResult(result),
        });
      }
    } finally {
      setBusy(false);
    }
  }

  function handleClear() {
    setFeedback(null);
    onCleared();
  }

  const previewBox = compact ? "h-14 w-14" : "h-20 w-20";

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink-800">{label}</p>
      {description ? (
        <p className="text-xs text-ink-500">{description}</p>
      ) : null}
      <div className="flex flex-wrap items-start gap-3 rounded-xl border border-ink-200 bg-white p-3">
        <div className={`flex flex-none items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50 ${previewBox}`}>
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={`${label} Vorschau`}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-ink-400" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={pickFile}
              disabled={busy || disabled}
              className="lp-focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Lade hoch …
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                  {currentUrl ? "Ersetzen" : "Hochladen"}
                </>
              )}
            </button>
            {currentUrl ? (
              <button
                type="button"
                onClick={handleClear}
                disabled={busy || disabled}
                className="lp-focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg border border-ink-200 px-4 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Entfernen
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] text-ink-500">
            PNG, JPEG oder WebP — maximal 5 MB. SVG ist aus
            Sicherheitsgründen nicht erlaubt.
          </p>
          {disabled && disabledHint ? (
            <p className="mt-1 text-[11px] font-medium text-amber-700">
              {disabledHint}
            </p>
          ) : null}
          {feedback ? (
            <p
              role={feedback.kind === "err" ? "alert" : "status"}
              className={`mt-2 inline-flex items-start gap-1.5 text-xs font-medium ${
                feedback.kind === "ok"
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              {feedback.kind === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
              ) : (
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
              )}
              {feedback.message}
            </p>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => void handleChange(e)}
        className="hidden"
      />
    </div>
  );
}
