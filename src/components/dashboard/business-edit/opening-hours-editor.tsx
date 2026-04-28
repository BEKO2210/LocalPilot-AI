"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  useFieldArray,
  useFormContext,
  type FieldErrors,
} from "react-hook-form";
import type { BusinessProfile } from "@/core/validation/business-profile.schema";
import type { WeekDay } from "@/types/common";

const DAY_LABEL: Record<WeekDay, string> = {
  monday: "Montag",
  tuesday: "Dienstag",
  wednesday: "Mittwoch",
  thursday: "Donnerstag",
  friday: "Freitag",
  saturday: "Samstag",
  sunday: "Sonntag",
};

const DAY_ORDER: readonly WeekDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

type DaySlotsEditorProps = { dayIndex: number };

function DaySlotsEditor({ dayIndex }: DaySlotsEditorProps) {
  const { control, register, watch, setValue, formState } =
    useFormContext<BusinessProfile>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `openingHours.${dayIndex}.slots` as const,
  });

  const closed = watch(`openingHours.${dayIndex}.closed`);
  const dayName = watch(`openingHours.${dayIndex}.day`);

  const errors = formState.errors as FieldErrors<BusinessProfile>;
  const dayErrors = errors.openingHours?.[dayIndex];

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-ink-900">
          {DAY_LABEL[dayName as WeekDay] ?? dayName}
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            {...register(`openingHours.${dayIndex}.closed`, {
              onChange: (e) => {
                if (e.target.checked) {
                  // Slots leeren, wenn geschlossen.
                  setValue(`openingHours.${dayIndex}.slots`, [], {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              },
            })}
          />
          geschlossen
        </label>
      </div>

      {!closed && (
        <div className="mt-3 space-y-2">
          {fields.length === 0 ? (
            <p className="text-xs text-ink-500">
              {`Noch kein Slot. Tippen Sie unten auf „Slot hinzufügen".`}
            </p>
          ) : (
            fields.map((field, slotIndex) => {
              const slotErrors = dayErrors?.slots?.[slotIndex];
              const openErr = slotErrors?.open?.message;
              const closeErr = slotErrors?.close?.message;
              const slotErr =
                slotErrors && typeof slotErrors === "object" && "message" in slotErrors
                  ? (slotErrors as { message?: string }).message
                  : undefined;

              return (
                <div key={field.id} className="flex flex-wrap items-center gap-2">
                  <input
                    type="time"
                    aria-label="Öffnung"
                    className="h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    {...register(
                      `openingHours.${dayIndex}.slots.${slotIndex}.open` as const,
                    )}
                  />
                  <span className="text-xs text-ink-500">bis</span>
                  <input
                    type="time"
                    aria-label="Schluss"
                    className="h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    {...register(
                      `openingHours.${dayIndex}.slots.${slotIndex}.close` as const,
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => remove(slotIndex)}
                    className="ml-auto inline-flex h-9 items-center gap-1 rounded-lg border border-ink-200 px-2 text-xs text-ink-600 hover:bg-ink-50"
                    aria-label="Slot entfernen"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Entfernen
                  </button>
                  {(openErr || closeErr || slotErr) && (
                    <p className="basis-full text-xs font-medium text-rose-600">
                      {openErr ?? closeErr ?? slotErr}
                    </p>
                  )}
                </div>
              );
            })
          )}
          <button
            type="button"
            onClick={() => append({ open: "09:00", close: "18:00" })}
            className="lp-focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dashed border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-400 hover:text-brand-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Slot hinzufügen
          </button>
        </div>
      )}
    </div>
  );
}

export function OpeningHoursEditor() {
  return (
    <div className="space-y-2">
      {DAY_ORDER.map((_, idx) => (
        <DaySlotsEditor key={idx} dayIndex={idx} />
      ))}
      <p className="pt-1 text-xs text-ink-500">
        {`Tipp: Tage mit Mittagspause können zwei Slots haben (z. B. 09:00–13:00 und 14:00–18:00). Reine Termin-Betriebe blenden „geschlossen" auf alle Tage außer Wunschzeit.`}
      </p>
    </div>
  );
}
