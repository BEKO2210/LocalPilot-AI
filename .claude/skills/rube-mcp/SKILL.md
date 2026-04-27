---
name: rube-mcp
description: Brücke zu 500+ Apps (Slack, GitHub, Notion, Linear, Jira, Google Drive, Calendar, Gmail, …) über einen einzigen MCP-Server. Spart pro App die einzelne OAuth-Einrichtung.
---

# Rube MCP Connector

## Wozu

Statt für jede einzelne App einen MCP-Server einzurichten, bündelt
Rube über 500 Tools (Slack, GitHub, Notion, Linear, Jira, Google
Workspace, Asana, Trello, Airtable, Confluence, …) hinter einer
einzigen MCP-Verbindung. Sehr nützlich für Cross-Tool-Automation,
ohne pro Tool OAuth-Roundtrip einzurichten.

## Setup (Host-seitig — kann nicht aus dieser Session erfolgen)

Im Claude-Code-CLI:

```bash
# Variante A: per Plugin-Marketplace
claude plugin install rube-mcp

# Variante B: per Settings-Datei
# Eintrag in ~/.claude/settings.json:
{
  "mcpServers": {
    "rube": {
      "command": "npx",
      "args": ["-y", "@rube-ai/mcp-server"]
    }
  }
}
```

Erstmaliger Aufruf eines Rube-Tools führt durch den OAuth-Flow für
die jeweilige App. Tokens werden im OS-Keychain gespeichert, nicht
im Repo.

## Wann nutzen

- „Erstelle einen Linear-Bug für den Hex-Crash, verlinke den Commit."
- „Lade die `RUN_LOG.md` als Notion-Seite hoch."
- „Schreibe in den #releases-Slack-Channel: Pages-Deploy live."
- „Lege im Google Drive einen Ordner für die Demo-Aufnahmen an."

## Boundaries für LocalPilot AI

- **Niemals** automatisch in Public-Channels posten — immer erst
  Bestätigung im Chat.
- Cross-Tool-Aktionen, die echte Kosten auslösen (z. B. Cloud-
  Resources anlegen), gehören in einen Plan-Modus mit User-Freigabe.
- Repo-Änderungen weiterhin nur über die normalen Git-Tools, nicht
  über den GitHub-Connector — sonst geht der Doku-Loop verloren.
