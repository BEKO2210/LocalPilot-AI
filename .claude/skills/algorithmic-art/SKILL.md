---
name: algorithmic-art
description: Generative p5.js-Artworks aus natürlicher Beschreibung. Reproduzierbar via Seed.
---

# Algorithmic Art

## Wozu

Aus einer freien Beschreibung („Blau-lila Gradienten-Flow-Field,
5000 Partikel, Seed 42") wird p5.js-Code generiert, der ein
reproduzierbares Artwork rendert.

## Setup

Pure Markdown-Skill mit p5.js-Beispielen.

## Use-Case in LocalPilot AI

**Niedrige bis mittlere Priorität** — wir sind kein Creative-Coding-
Projekt. Möglicher Einsatz:

- **Hero-Background-Art** für `/site/<slug>` als markentaugliche
  generative Grafik (statt Stockfoto). Einmalig generieren, als
  SVG/PNG ins Repo (`public/images/generative/`), dann referenzieren.
- **Branchen-typische Abstrakt-Hintergründe** (Friseur-Wellen,
  Werkstatt-Geometrien, Reinigung-Bubbles) für die Theme-Galerie
  unter `/themes`.

## Wann **nicht** nutzen

- Im Public-Site-Generator nicht zur Laufzeit ausführen — Performance
  und SEO leiden. Stattdessen einmal pre-rendern, als Asset einbinden.

## Boundaries

- Generierte Assets unter `public/images/generative/<thema>-seed-<seed>.{svg,png}`.
- Lizenz: MIT Equivalent ist okay. Quellcode des p5-Sketches kommt
  als Kommentar in die Datei, damit reproduzierbar.
- Niemals Echtzeit-p5 in der Public Site bundeln — das ist 1 MB+ an
  Library-Code, killt unser 102-KB-Bundle.
