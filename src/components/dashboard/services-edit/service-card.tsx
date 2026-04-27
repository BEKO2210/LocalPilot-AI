"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  GripVertical,
  Star,
  Trash2,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/cn";
import {
  FormField,
  FormInput,
  FormTextarea,
} from "@/components/forms";
import { ImageUploadField } from "@/components/dashboard/business-edit/image-upload-field";
import { looksLikeDbUuid } from "@/lib/services-update";
import type { ServicesFormValues } from "./services-edit-form";

type ServiceCardProps = {
  slug: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export function ServiceCard({
  slug,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ServiceCardProps) {
  const { register, setValue, watch, formState } =
    useFormContext<ServicesFormValues>();
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const errors = formState.errors.services?.[index];
  const title = watch(`services.${index}.title`);
  const isActive = watch(`services.${index}.isActive`);
  const isFeatured = watch(`services.${index}.isFeatured`);
  const category = watch(`services.${index}.category`);
  const priceLabel = watch(`services.${index}.priceLabel`);
  const serviceId = watch(`services.${index}.id`);
  const imageUrl = watch(`services.${index}.imageUrl`);
  const hasRealUuid = looksLikeDbUuid(serviceId ?? "");

  const hasError = Boolean(errors);
  const displayTitle = (title ?? "").trim() || "(noch ohne Titel)";
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <details
      className={cn(
        "group rounded-2xl border bg-white shadow-soft transition-shadow",
        hasError
          ? "border-rose-300 ring-1 ring-rose-200"
          : "border-ink-200 hover:shadow-md",
        !isActive && "opacity-80",
      )}
      open={hasError || !title}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="hidden text-ink-400 sm:inline-flex"
          title="Reihenfolge per Pfeile rechts"
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink-900">
              {displayTitle}
            </span>
            {isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                <Star className="h-2.5 w-2.5" aria-hidden />
                Hervorgehoben
              </span>
            ) : null}
            {!isActive ? (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-600">
                Inaktiv
              </span>
            ) : null}
            {hasError ? (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rose-800">
                Fehler
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-500">
            {category || "Ohne Kategorie"}
            {priceLabel ? ` · ${priceLabel}` : null}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onMoveUp();
            }}
            disabled={isFirst}
            aria-label="Nach oben verschieben"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40"
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onMoveDown();
            }}
            disabled={isLast}
            aria-label="Nach unten verschieben"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40"
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </button>
          <ChevronDown
            className="ml-1 h-4 w-4 text-ink-400 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </div>
      </summary>

      <div className="space-y-4 border-t border-ink-200 px-4 py-4">
        <FormField
          label="Titel"
          htmlFor={`services.${index}.title`}
          required
          error={errors?.title?.message}
        >
          <FormInput
            id={`services.${index}.title`}
            type="text"
            placeholder="z. B. Damenhaarschnitt"
            hasError={Boolean(errors?.title)}
            {...register(`services.${index}.title`)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Kategorie"
            htmlFor={`services.${index}.category`}
            error={errors?.category?.message}
          >
            <FormInput
              id={`services.${index}.category`}
              type="text"
              placeholder="z. B. Schnitt"
              hasError={Boolean(errors?.category)}
              {...register(`services.${index}.category`)}
            />
          </FormField>
          <FormField
            label="Preis-Label"
            htmlFor={`services.${index}.priceLabel`}
            hint="Frei formuliert: 'ab 39 €' oder 'auf Anfrage'."
            error={errors?.priceLabel?.message}
          >
            <FormInput
              id={`services.${index}.priceLabel`}
              type="text"
              placeholder="ab 39 €"
              hasError={Boolean(errors?.priceLabel)}
              {...register(`services.${index}.priceLabel`)}
            />
          </FormField>
          <FormField
            label="Dauer"
            htmlFor={`services.${index}.durationLabel`}
            error={errors?.durationLabel?.message}
          >
            <FormInput
              id={`services.${index}.durationLabel`}
              type="text"
              placeholder="60 Min."
              hasError={Boolean(errors?.durationLabel)}
              {...register(`services.${index}.durationLabel`)}
            />
          </FormField>
        </div>

        <FormField
          label="Kurzbeschreibung"
          htmlFor={`services.${index}.shortDescription`}
          hint="1–2 Sätze. Erscheint auf der Service-Karte der Public Site."
          error={errors?.shortDescription?.message}
        >
          <FormTextarea
            id={`services.${index}.shortDescription`}
            rows={3}
            placeholder="Schnitt inkl. Beratung und Styling."
            hasError={Boolean(errors?.shortDescription)}
            {...register(`services.${index}.shortDescription`)}
          />
        </FormField>

        <ImageUploadField
          slug={slug}
          kind="service"
          serviceId={hasRealUuid ? serviceId : undefined}
          currentUrl={imageUrl ?? undefined}
          onUploaded={(url) =>
            setValue(`services.${index}.imageUrl`, url, {
              shouldDirty: true,
            })
          }
          onCleared={() =>
            setValue(`services.${index}.imageUrl`, undefined, {
              shouldDirty: true,
            })
          }
          label="Bild"
          description="Optional. Erscheint groß auf der Service-Karte der Public Site."
          disabled={!hasRealUuid}
          disabledHint={
            !hasRealUuid
              ? "Bild kannst du hochladen, sobald die Leistung einmal gespeichert ist."
              : undefined
          }
          compact
        />

        <input
          type="hidden"
          {...register(`services.${index}.imageUrl`)}
        />
        {errors?.imageUrl ? (
          <p className="text-xs font-medium text-rose-600">
            Bild-URL: {errors.imageUrl.message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50/50 p-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-ink-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                {...register(`services.${index}.isActive`)}
              />
              Aktiv (auf Public Site sichtbar)
            </label>
            <label className="flex items-center gap-2 text-ink-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                {...register(`services.${index}.isFeatured`)}
              />
              {`Hervorgehoben („Beliebt"-Badge)`}
            </label>
          </div>

          {confirmingRemove ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-rose-700">Wirklich entfernen?</span>
              <button
                type="button"
                onClick={() => {
                  setConfirmingRemove(false);
                  onRemove();
                }}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-rose-600 px-3 text-xs font-medium text-white hover:bg-rose-700"
              >
                Ja, entfernen
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRemove(false)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-ink-200 px-3 text-xs font-medium text-ink-700 hover:bg-white"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Entfernen
            </button>
          )}
        </div>

        {/* Versteckte Pflichtfelder, die wir nicht editierbar machen wollen. */}
        <input type="hidden" {...register(`services.${index}.id`)} />
        <input type="hidden" {...register(`services.${index}.businessId`)} />
        <input
          type="hidden"
          {...register(`services.${index}.sortOrder`, { valueAsNumber: true })}
        />
      </div>
    </details>
  );
}
