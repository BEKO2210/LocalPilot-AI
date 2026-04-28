import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-ink-900 text-white hover:bg-ink-800",
  outline:
    "border border-ink-200 bg-white text-ink-900 hover:bg-ink-50",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const baseStyles =
  "lp-focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  },
);

type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
};

/**
 * Anker mit Button-Optik. Bei internen Routen (Pfad beginnt mit `/`)
 * wird automatisch `next/link` verwendet, damit `basePath` (z. B.
 * `/LocalPilot-AI` auf GitHub Pages) korrekt vorangestellt wird.
 * Externe Links und reine Hash-Links (`#kontakt`, `mailto:`) werden als
 * normaler `<a>` ausgegeben.
 */
export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(
    { className, variant = "primary", size = "md", href, ...props },
    ref,
  ) {
    const classes = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    const isInternalAbsolute =
      href.startsWith("/") && !href.startsWith("//");

    if (isInternalAbsolute) {
      return <Link ref={ref} href={href} className={classes} {...props} />;
    }

    return <a ref={ref} href={href} className={classes} {...props} />;
  },
);
