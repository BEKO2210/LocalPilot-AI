---
name: brand-guidelines
description: Multi-Brand-Registry. Mehrere Marken in einem Repo, schnell wechseln, getrennt halten.
---

# Brand Guidelines

## Wozu

Verwaltet mehrere Marken als getrennte „Profile" mit Farben,
Schriften, Tonalität, Logo, Tagline. Wechsel per Befehl statt manuell
Files austauschen.

## Setup

Pure Markdown-Skill mit JSON-Manifest pro Marke.

## Use-Case in LocalPilot AI

**Hoch relevant**, weil wir White-Label-fähig sein wollen
(`Claude.md` Punkt 1). Konkrete Anwendung:

- **Pro Demo-Betrieb ein Brand-Profil** unter `data/brands/<slug>.json`
  — bisher liegt das Branding in `src/data/businesses/`. Brand
  Guidelines hilft, Brand-Logik von Daten-Logik zu trennen.
- **Reseller-Branding**: ein Reseller verkauft LocalPilot AI mit
  eigenem Logo und Farben; ein Brand-Switch erzeugt die ganze App in
  Reseller-CI.
- **Sales-Demos**: Inhaberin sieht im Pitch ihre eigenen Farben statt
  der Demo-Branding — Brand Guidelines macht den Switch in Sekunden.

## Verbindung zu `theme-factory/`

- **`theme-factory`** = Generator (aus Beschreibung → Token).
- **`brand-guidelines`** = Registry (mehrere Brands verwalten,
  durchwechseln).

## Boundaries

- Brand-Profile sind **Daten**, nicht Code: liegen unter
  `data/brands/`, nicht `src/`.
- Niemals Kunden-Logos / Trademarks in den `main`-Branch
  ohne schriftliche Lizenzbestätigung.
- Pro Brand ein Zod-Schema-Eintrag — keine Free-Form-Profile, sonst
  bricht der Theme-Resolver.
