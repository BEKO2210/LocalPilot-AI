# Project-Level Skills für LocalPilot AI

Die hier liegenden `<name>/SKILL.md`-Dateien werden vom Claude-Code-
Harness automatisch als **Project-Level-Skills** geladen, sobald
eine Session in diesem Repo startet. Sie sind dann unter
`/<skill-name>` aufrufbar.

## Skill-Kategorien

**Direkt nutzbar** (pure Markdown-Skills, kein externer Service):
- `superpowers/` — Dev-Workflow-Toolkit
- `systematic-debugging/` — Senior-Dev-Debugging-Pipeline
- `theme-factory/` — Design-Token-Konsistenz
- `brand-guidelines/` — Multi-Brand-Verwaltung
- `algorithmic-art/` — generative p5.js-Artworks
- `slack-gif-creator/` — animierte GIFs für Slack

**Erfordert Host-seitige Installation** (MCP-Server oder offizieller
Anthropic-Skill — der Klick muss im Claude-Code-CLI passieren,
nicht von Claude aus):
- `rube-mcp/` — 500+ App-Integrationen über einen MCP-Server
- `mcp-builder/` — MCP-Server-Boilerplate-Generator
- `document-suite/` — offizieller Anthropic-Skill für Office-Dokumente
- `webapp-testing/` — Playwright-Automatisierung

Die jeweilige SKILL.md beschreibt unten den Setup-Schritt.

## Pflege

Wenn ein Skill nicht mehr verwendet wird oder durch einen besseren
ersetzt wurde, das Verzeichnis ersatzlos löschen und den Bezug aus
`PROGRAM_PLAN.md` entfernen. Skill-Specs sind keine API — sie
können sich verändern, ohne dass der restliche Code bricht.
