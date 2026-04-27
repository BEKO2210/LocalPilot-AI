---
name: mcp-builder
description: Generiert MCP-Server-Boilerplate (TypeScript / Python). Kürzt das Setup für eigene Integrationen um ~80 %.
---

# MCP Builder

## Wozu

Schreibt Boilerplate für einen eigenen MCP-Server: package.json,
TS-Config, Tools-Definitionen, Test-Setup, Beispiel-Tool. Beschleunigt
das Bootstrapping einer neuen Integration drastisch.

## Setup (Host-seitig)

```bash
claude plugin install mcp-builder
```

## Use-Case in LocalPilot AI

**Mittlere Priorität.** Direkter Bedarf entsteht erst mit dem Backend-
Meilenstein 4. Mögliche Server:

- **`localpilot-data-mcp`**: liest Demo-Datasets, Industry-Presets,
  Themes als Read-only-MCP — dann kann Claude in zukünftigen
  Sessions den Repo-Inhalt sauber durchsuchen, ohne `grep`/Bash zu
  brauchen.
- **`localpilot-leads-mcp`**: schreibender Zugriff auf den Lead-
  Storage, sobald Supabase-Backend steht.

## Boundaries

- Generierter Server-Code landet **außerhalb** des Haupt-Repos:
  `tools/<name>-mcp/` als separates Sub-Projekt mit eigenem
  `package.json`. Wird per `npm workspace` eingebunden.
- Kein Schreib-Zugriff auf Public-Site-Daten ohne explizite
  Auftraggeber-Freigabe.
- Pflicht-Tests: jeder erzeugte Server hat einen Smoketest, der
  alle Tools mindestens einmal aufruft.
