import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type SvgProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

/**
 * Marken-Mark für LocalPilot AI.
 *
 * Komposition: Rounded-Square-Frame (Local-Container) +
 * Kompass-Needle als Chevron mit Crossbar (Pilot/Direction) +
 * Akzent-Dot top-right (AI-Beacon). `currentColor` für alle
 * Striche/Füllungen → das Element folgt dem Text-Color der
 * umgebenden Komponente, kein zweiter Theme-Pfad nötig.
 *
 * Lesbar von 16 px (Favicon) bis 512 px (OG-Image). Stroke-Only-
 * Design ohne Gradients; kein JS-Runtime — einfach inline-SVG.
 */
export function LocalPilotMark({
  className,
  title = "LocalPilot AI",
  ...rest
}: SvgProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinejoin="round"
      strokeLinecap="round"
      className={cn("h-6 w-6", className)}
      {...rest}
    >
      <title>{title}</title>
      <rect x={6} y={6} width={52} height={52} rx={14} />
      <path d="M 16 44 L 32 18 L 48 44" />
      <line x1={22} y1={36} x2={42} y2={36} />
      <circle cx={50} cy={14} r={3.5} fill="currentColor" stroke="none" />
    </svg>
  );
}

type WordmarkProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Typografisches Wordmark. „Pilot" ist bewusst stärker gewichtet —
 * das Kernverb („pilot" = führen / navigieren) trägt die Marke.
 * Tight tracking entspricht 2026-Tech-SaaS-Konvention.
 */
export function LocalPilotWordmark({ className, ...rest }: WordmarkProps) {
  return (
    <span
      className={cn(
        "tracking-tight font-medium text-[1.0625em] leading-none",
        className,
      )}
      {...rest}
    >
      Local<span className="font-bold">Pilot</span>
      <span className="ml-1 text-[0.7em] uppercase tracking-widest opacity-70">
        AI
      </span>
    </span>
  );
}

type LockupProps = {
  className?: string;
  /** Optionaler Link-Wrapper (Default: `/`). `null` deaktiviert den Link. */
  href?: string | null;
  /** Größe des Marks. */
  size?: "sm" | "md" | "lg";
  /** Aria-Label für den Wrapper, falls Link aktiv. */
  ariaLabel?: string;
};

const SIZE_CLASS: Record<NonNullable<LockupProps["size"]>, string> = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-9 w-9",
};

/**
 * Mark + Wordmark als horizontales Lockup. Ersatz für die
 * ehemalige Text-Logo-Variante in `SiteHeader` und überall, wo
 * die Marke „eindeutig" auftreten soll.
 */
export function LocalPilotLockup({
  className,
  href = "/",
  size = "md",
  ariaLabel = "LocalPilot AI – Startseite",
}: LockupProps) {
  const inner = (
    <>
      <LocalPilotMark className={SIZE_CLASS[size]} />
      <LocalPilotWordmark />
    </>
  );

  if (href === null) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "lp-focus-ring inline-flex items-center gap-2 rounded-md text-ink-900",
        className,
      )}
    >
      {inner}
    </Link>
  );
}
