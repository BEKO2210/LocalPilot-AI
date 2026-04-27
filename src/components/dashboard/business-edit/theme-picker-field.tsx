"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/cn";
import { getAllThemes } from "@/core/themes";
import type { BusinessProfile } from "@/core/validation/business-profile.schema";
import type { ThemeKey } from "@/types/common";

/**
 * Visueller Theme-Picker als Karten-Grid mit Mini-Farb-Vorschau.
 * Bindet sich über `useFormContext` an `themeKey`.
 */
export function ThemePickerField() {
  const { register, watch, setValue, formState } = useFormContext<BusinessProfile>();
  const themes = getAllThemes();
  const currentKey = watch("themeKey");
  const error = formState.errors.themeKey?.message;

  return (
    <div>
      <input
        type="hidden"
        {...register("themeKey", { required: true })}
      />
      <div
        role="radiogroup"
        aria-label="Theme wählen"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {themes.map((theme) => {
          const isActive = theme.key === currentKey;
          return (
            <button
              key={theme.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() =>
                setValue("themeKey", theme.key as ThemeKey, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className={cn(
                "group flex flex-col rounded-xl border bg-white p-3 text-left transition-shadow",
                isActive
                  ? "border-brand-500 ring-2 ring-brand-200 shadow-soft"
                  : "border-ink-200 hover:shadow-soft",
              )}
            >
              <div className="flex items-center gap-1.5">
                {(["primary", "secondary", "accent", "background"] as const).map(
                  (color) => (
                    <span
                      key={color}
                      className="h-5 w-5 flex-none rounded-full border border-ink-200"
                      style={{
                        backgroundColor:
                          color === "primary"
                            ? theme.colors.primary
                            : color === "secondary"
                              ? theme.colors.secondary
                              : color === "accent"
                                ? theme.colors.accent
                                : theme.colors.background,
                      }}
                      aria-hidden
                    />
                  ),
                )}
                <span className="ml-auto text-[10px] font-mono text-ink-500">
                  {theme.key}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink-900">{theme.label}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-ink-600">
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-2 text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
