---
name: slack-gif-creator
description: Erstellt benutzerdefinierte animierte GIFs, optimiert für Slack (Größe, FPS, Loop).
---

# Slack GIF Creator

## Wozu

Benutzerdefinierte animierte GIFs aus Beschreibung erzeugen. Optimiert
auf Slack-Constraints (≤ 1 MB, 480px Breite, 12–24 FPS).

## Setup

Pure Markdown-Skill mit ffmpeg-/canvas-Skripten.

## Use-Case in LocalPilot AI

**Niedrige Priorität.** Wir betreiben aktuell kein Slack-Onboarding.
Mögliche Anwendungen:

- **Demo-GIF für Sales-Pitches**: kurzer Loop „Inhaberin tippt
  Service-Titel → KI generiert 3-Absatz-Beschreibung in 2 sec".
  Eine 8-Sekunden-Demo sagt mehr als 5 Marketing-Texte.
- **Onboarding-GIFs** unter `docs/onboarding/<schritt>.gif` für die
  spätere Sales-Doku.

## Boundaries

- Pfad: `docs/exports/gif/<thema>-<datum>.gif`. Niemals in `public/`,
  weil das ins Bundle wandert.
- Größenlimit `1 MB`. Bei Überschreitung Loop kürzen / FPS senken,
  bevor committet wird.
- Echte Personen/Kund:innen-Aufnahmen brauchen schriftliche
  Einwilligung — gehört nicht in dieses Skill, sondern in den
  manuellen Sales-Workflow.
