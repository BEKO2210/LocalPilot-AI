---
name: document-suite
description: Offizielle Anthropic-Skill-Suite für Word/Excel/PowerPoint/PDF. Echte Dokumente mit Formatierung, Formeln, Bildern — nicht nur Plaintext.
---

# Document Suite (Office)

## Wozu

Erstellt **echte** Word-, Excel-, PowerPoint- und PDF-Dateien, nicht
nur Plaintext-Dumps:

- **Word**: Überschriften-Hierarchie, Listen, Tabellen, Bilder.
- **Excel**: Formeln, Pivot-Tabellen, Charts, mehrere Sheets.
- **PowerPoint**: Slide-Layouts, Speaker-Notes, Bilder.
- **PDF**: aus den obigen Formaten oder direkt aus Markdown.

## Setup (Host-seitig)

```bash
claude plugin install document-suite
```

Schreibt unter `~/.claude/skills/document-suite/` die offiziellen
Anthropic-Skripte. Erfordert keine externen Logins.

## Wann nutzen für LocalPilot AI

**Hoch relevant**, sobald wir Vertikalisierungs-Material brauchen:

- **Sales-Pitch-PDF** pro Branche (Friseur-Pitch, Werkstatt-Pitch, …).
- **Onboarding-Excel** für neue Betriebe (Fragen-Liste,
  Datenformat-Vorlage).
- **Quartals-Reports** für den Auftraggeber: Sessions × KB-Diff ×
  Bundle-Wachstum × Kosten.
- **Feature-Comparison-Slide** für Pricing-Demo.

## Wann **nicht** nutzen

- Für Doku im Repo: bleibt bei Markdown (`docs/*.md`). Word/PDF nur
  für Outbound-Material an Kunden / Auftraggeber.
- Für Berechnungen mit echtem Geld → die Excel-Engine ist gut, aber
  doppelt prüfen vor Versand.

## Boundaries für LocalPilot AI

- Erzeugte Office-Dateien landen unter `docs/exports/<datum>-<thema>.{docx,xlsx,pptx,pdf}`,
  **nicht** im Repo-Root.
- Kein automatisches Versenden — Auftraggeber kontrolliert
  Outbound.
