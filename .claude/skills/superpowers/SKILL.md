---
name: superpowers
description: Dev-Workflow-Toolkit. Bringt strukturierten Brainstorm → Plan → Execute-Loop in jede Code-Session. Macht Claude vom Chatbot zum Pair-Programmer.
---

# Superpowers

## Wozu

Drei Befehle, die zusammen einen sauberen Dev-Workflow erzeugen:

- `/brainstorm <topic>` — Generiert mehrere Lösungsansätze mit Pro/
  Contra. Optimal vor jeder Refactor- oder Feature-Session, um nicht
  in den ersten Ansatz zu rennen.
- `/write-plan <feature>` — Schreibt einen ausführlichen
  Implementierungs-Plan (Schritte, Dateien, Tests, Akzeptanzkriterien).
  In LocalPilot AI besonders wertvoll, weil unser Session-Protokoll
  ohnehin Plan-First fordert.
- `/execute-plan` — Arbeitet einen Plan Schritt für Schritt ab,
  prüft nach jedem Schritt typecheck + lint + Build. Stoppt bei
  Fehlern statt blind weiterzulaufen.

## Setup

Pure Markdown-Skill — wird vom Harness automatisch geladen. Kein
externer Service.

## Wann nutzen

- **Vor einer Code-Session mit unklarem Scope** → `/brainstorm`.
- **Vor einer Feature-Session > 50 KB Diff** → `/write-plan` und
  Plan im Repo unter `docs/plans/<session>-<feature>.md` ablegen.
- **Wenn ein Plan steht, Token-effizient ausführen** →
  `/execute-plan`.

## Boundaries für LocalPilot AI

- Plan-Datei wandert **nicht** in den Repo-Root, sondern unter
  `docs/plans/`. Erledigte Pläne werden archiviert (`docs/plans/_archive/`).
- `/execute-plan` läuft nur auf Branches `claude/...`. Niemals
  auf `main` direkt.
- Bei Plan-Konflikt mit `SESSION_PROTOCOL.md` hat das
  Session-Protokoll Vorrang — also Recherche-Step + Roadmap-
  Selbstaktualisierung müssen weiterhin passieren.

## Integration mit unserem Session-Protokoll

Schritt 1 „Plan (TodoWrite)" aus `docs/SESSION_PROTOCOL.md` bleibt
verbindlich. `/write-plan` ergänzt das, ersetzt es nicht. Wenn beide
existieren: TodoWrite ist die Live-State-Machine, der Plan ist die
Akte.
