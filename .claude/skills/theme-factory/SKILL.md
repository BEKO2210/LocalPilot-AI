---
name: theme-factory
description: Markenrichtlinien einmal hochladen, jedes erzeugte Artefakt (HTML/CSS/Slides/PDF) folgt automatisch Farben, Schriften, Spacing.
---

# Theme Factory

## Wozu

Konsistente Markendarstellung über alle Artefakte hinweg. Aus einem
einzigen Brand-Manifest (Farben, Schriften, Logo, Tonalität) erzeugt
der Skill:

- CSS-Variablen-Theme für Web-Komponenten.
- Tailwind-Custom-Theme.
- Office-Templates (Word/PowerPoint mit Master-Layouts).
- Markenkonforme Bilder/Mockups.

## Setup

Pure Markdown-Skill mit Helper-Skripten — wird vom Harness geladen.

## Spezifischer Use-Case in LocalPilot AI

**Hoch relevant.** Wir haben bereits 10 fertige Themes
(`src/core/themes/`). Theme Factory ergänzt:

- **Schnelles Bootstrapping eines neuen Themes** aus einer
  Brand-Beschreibung („Premium-Friseur, Roségold + Anthrazit, sanfte
  Schatten") statt manuell Hex-Werte zu setzen.
- **Kunden-spezifische Brand-Anwendung** auf einen bestehenden
  Demo-Betrieb für Sales-Demos.
- **Cross-Format-Markenkonsistenz**, wenn Document-Suite-Slides
  oder PDFs erzeugt werden.

## Boundaries

- Neu generierte Themes **immer** durch das Zod-Schema
  `ThemeSchema` validieren, bevor sie in `src/core/themes/` landen.
- Kunden-Branding niemals automatisch in den `main`-Branch — gehört
  in einen `claude/brand-<kunde>`-Branch oder unter
  `docs/exports/`.
- Tailwind-Config nur erweitern, nicht ersetzen — sonst brechen die
  bestehenden Themes.

## Verbindung zu `brand-guidelines/`

Theme Factory ist die **Generator-Seite**, `brand-guidelines/` ist
die **Wissens-Seite** (Multi-Brand-Registry, an die das Theme
gekoppelt ist).
