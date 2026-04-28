import * as React from "react";
import { cn } from "@/lib/cn";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wrapper: Label + Hilfetext + Inline-Fehler in konsistenter Optik.
 *
 * A11y (Phase 2, Code-Session 79): Wenn das Children genau ein
 * React-Element ist (typischer Fall: ein FormInput/FormTextarea/
 * FormSelect), klonen wir es und injizieren `aria-invalid` und
 * `aria-describedby` automatisch. Bestehende Props vom Caller
 * gewinnen — wer manuell setzt, bleibt unangetastet.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  // Single-Element-Children bekommen aria-Wiring automatisch.
  // Mehrteilige Children (selten) bleiben unverändert — Caller
  // muss dann selbst `aria-invalid`/`aria-describedby` setzen.
  const wired =
    React.isValidElement(children) && React.Children.count(children) === 1
      ? React.cloneElement(
          children as React.ReactElement<{
            "aria-invalid"?: boolean | "true" | "false";
            "aria-describedby"?: string;
          }>,
          {
            "aria-invalid":
              (children.props as { "aria-invalid"?: boolean | "true" | "false" })[
                "aria-invalid"
              ] ?? (error ? true : undefined),
            "aria-describedby":
              (children.props as { "aria-describedby"?: string })[
                "aria-describedby"
              ] ?? describedBy,
          },
        )
      : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium uppercase tracking-wide text-ink-700"
      >
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </label>
      {wired}
      {error ? (
        <p
          id={errorId}
          className="text-xs font-medium text-rose-600"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const baseInputClass =
  "block w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60";

export const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(function FormInput({ className, hasError, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        baseInputClass,
        hasError && "border-rose-300 focus:border-rose-400 focus:ring-rose-200",
        className,
      )}
      {...props}
    />
  );
});

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(function FormTextarea({ className, hasError, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        baseInputClass,
        "min-h-[5rem] resize-y",
        hasError && "border-rose-300 focus:border-rose-400 focus:ring-rose-200",
        className,
      )}
      {...props}
    />
  );
});

export const FormSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(function FormSelect({ className, hasError, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        baseInputClass,
        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2020%2020%22%20fill=%22none%22%20stroke=%22%2367738a%22%20stroke-width=%221.5%22><polyline%20points=%225%208%2010%2013%2015%208%22/></svg>')] bg-[length:14px_14px] bg-[right_0.75rem_center] bg-no-repeat pr-9",
        hasError && "border-rose-300 focus:border-rose-400 focus:ring-rose-200",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
