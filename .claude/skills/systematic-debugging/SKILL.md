---
name: systematic-debugging
description: Senior-Dev-Debugging-Pipeline. Ursachenforschung → Hypothesen → Fixes → Dokumentation. Kein wildes Rumgestochere.
---

# Systematic Debugging

## Wozu

Strukturierte Bug-Hunting-Pipeline statt Trial-and-Error:

1. **Reproduktion festnageln** (welche genauen Schritte? welche
   Browser? welche Daten?).
2. **Symptome vs. Ursache trennen** — was sieht der User, was
   passiert technisch?
3. **Hypothesen formulieren** (mind. 3, nach Wahrscheinlichkeit
   geordnet).
4. **Hypothese verifizieren / falsifizieren** (kleinster mögliche
   Test, ein change at a time).
5. **Root Cause benennen** (nicht „das, was den Symptom-Fix bewirkt
   hat", sondern die echte Wurzel).
6. **Fix umsetzen** + Regression-Test schreiben.
7. **Doku schreiben**: was war der Bug, warum ist er entstanden,
   wie wurde er gefixt, wie verhindern wir die Klasse zukünftig?

## Setup

Pure Markdown-Skill — Rezept als Prompt.

## Use-Case in LocalPilot AI

**Hoch relevant.** Bisher 2 Bug-Hotfixes (Code-Sessions 23 + 25).
Beide hätten von strukturierter Debug-Pipeline profitiert. Konkrete
Anwendung:

- **Vor jedem Maintenance-Commit**: die 7 Schritte explizit im
  Commit-Body durchgehen — nicht nur „Fix XYZ".
- **Klasse-statt-Instanz**: nach dem Fix immer fragen „kann das an
  anderen Stellen auch passieren?" und Codex-Backlog-Item
  schreiben (so entstand z. B. #10 für die Anführungszeichen-Bugs).
- **In `docs/RUN_LOG.md`**: Maintenance-Einträge bekommen ab jetzt
  eine `Root Cause:`-Zeile, nicht nur eine `Fix:`-Zeile.

## Integration mit unserem Session-Protokoll

Maintenance-Sessions bekommen ein erweitertes Format:

```markdown
## Code-Session N – Hotfix: <kurze Beschreibung>

**Symptom**: was hat der User gesehen?
**Reproduktion**: schritte, daten, browser.
**Hypothesen** (geprüft):
  1. ✗ <hypothese> — verworfen, weil …
  2. ✓ <hypothese> — bestätigt, weil …
**Root Cause**: …
**Fix**: …
**Regression-Test**: …
**Klasse-Check**: kann das an anderen Stellen passieren? → Codex-Backlog-Item.
```

Ersetzt das normale Compact-Format **für Bug-Sessions** — Feature-
Sessions bleiben beim Standard-Compact-Format.
