import { cn } from "@/lib/cn";
import { themeToCssVars } from "@/core/themes";
import type { Theme } from "@/types/theme";

type ThemeProviderProps = {
  theme: Theme;
  children: React.ReactNode;
  /**
   * Wenn true, wird die Hintergrund- und Textfarbe des Themes direkt auf
   * den Wrapper angewendet (`bg-theme-background text-theme-foreground`).
   * Das ist die Standard-Variante für Public Sites. Für Inline-Vorschauen
   * (Theme-Galerie) kann sie deaktiviert werden, falls das Eltern-Layout
   * den Hintergrund kontrolliert.
   */
  applySurface?: boolean;
  className?: string;
  as?: "div" | "section" | "article" | "main";
};

/**
 * Setzt die Theme-CSS-Variablen auf einem Wrapper.
 *
 * Funktioniert in Server Components (kein Context, kein useEffect),
 * statisch-export-kompatibel, kaskadiert auf alle Kinder.
 *
 * Übliche Verwendung:
 *   <ThemeProvider theme={getThemeOrFallback(business.themeKey)}>
 *     <PublicSite business={business} />
 *   </ThemeProvider>
 */
export function ThemeProvider({
  theme,
  children,
  applySurface = true,
  className,
  as: Tag = "div",
}: ThemeProviderProps) {
  const styleVars = themeToCssVars(theme);
  return (
    <Tag
      data-theme={theme.key}
      style={styleVars}
      className={cn(applySurface && "lp-theme-surface", className)}
    >
      {children}
    </Tag>
  );
}
