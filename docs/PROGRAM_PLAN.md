# Programm-Plan – LocalPilot AI

**LocalPilot AI ist ein dauerhaftes Programm, kein Projekt mit Endpunkt.**
Anstatt 22 Sessions zu „erledigen" und fertig zu sein, läuft die Entwicklung
in **rollenden Meilensteinen** – jeder Meilenstein ist „stabil genug, um den
Fokus zu verlagern", nie „abgeschlossen". Wir kommen für Polish,
Performance, neue Plattform-Features und neue Branchen jederzeit zurück.

Diese Datei ersetzt die alte „Session 1 bis 22"-Sicht. Sie wird mit jeder
Session aktualisiert.

## Methodik (in Kurzform)

- **Session = 1 atomarer Schritt.** Klein genug, dass eine fokussierte
  Stunde reicht, sicher genug, dass der Build nach jeder Session grün ist.
- **Pro Session 1 Recherche-Step.** WebSearch nach aktuellen Patterns,
  Sicherheits-Hinweisen, neuen Versionen. Erkenntnis kommt in den
  Session-Eintrag im RUN_LOG, Quellen werden zitiert.
- **Inkrementelles Shipping.** Jede Session endet mit Commit + Push.
  GitHub-Pages-Deploy zeigt den neuen Stand auf dem Handy. Kein
  „Wir sammeln drei Wochen lang und mergen dann".
- **Variable Scope, fixe Qualität.** Wenn eine Session zu groß wird:
  splitten und in der nächsten weitermachen. Lieber 5 kleine Sessions
  als 1 große.
- **Maintenance ist gleichberechtigt.** Polish-, Performance-, Security-,
  A11y-, Test- und DX-Sessions zählen genauso wie Feature-Sessions.

Detaillierter Ablauf einer Session: siehe **`docs/SESSION_PROTOCOL.md`**.

## Meilensteine (rollend, open-ended)

Jeder Meilenstein hat ein **Erfolgskriterium**, ab dem wir den Fokus
verlagern. Wir kommen für Updates trotzdem zurück.

### Meilenstein 1 — Foundation
**Status:** ✅ stabil (Sessions 1–12 abgeschlossen)

Projektgrundlage, Datenmodelle, Pricing, Branchen-Presets, Themes,
Mock-Daten, Public Site, Marketing-Funnel, Dashboard-Skelett,
Business-Editor, Services-Editor, Lead-System.

**Erfolgskriterium erreicht:** Demo-fähiges Produkt, statisch deploybar,
6 Demo-Betriebe live, alle Editoren ohne Backend bedienbar.

**Was hier wieder aufgegriffen wird, wenn nötig:** Marketing-Texte,
neue Branchen-Presets, neue Themes, UX-Polish.

### Meilenstein 2 — KI-Schicht
**Status:** 🔄 in Arbeit (ab Session 13)

Branchenneutraler AI-Provider-Adapter, Mock-Provider mit hochwertigen
Beispieltexten, Echte Provider (OpenAI / Anthropic / Gemini) als
Skeletons, dann Schritt für Schritt scharf, je Capability eigene
UI-Komponente, Cost-Tracking, Rate-Limiting, Safety-Filter.

**Erfolgskriterium:** Alle 7 AI-Methoden aus `AIProviderInterface`
laufen mit Mock + mindestens einem Live-Provider, ohne API-Key
funktioniert die App weiterhin, Kostendeckel pro Betrieb.

**Geplante Session-Cluster (nicht in Stein gemeißelt):**
- 13–14: Provider-Scaffold + Mock für Website-Texte
- 15–17: Mock für Service-Beschreibung, FAQ, Antworten
- 18–20: Mock für Social-Posts, Bewertungs-Anfragen, Angebote
- 21–22: OpenAI-Provider scharf (mit Caching)
- 23–24: Anthropic-Provider scharf
- 25: Cost-Tracking + Rate-Limit-UI

### Meilenstein 3 — Engagement & Wachstum
**Status:** ⏳ vorbereitet

Bewertungs-Booster ausgebaut, Social-Media-Generator als eigene Seite,
Kampagnen-Builder, Referral-Tracking, E-Mail- und WhatsApp-Templates
mit Variablen.

**Erfolgskriterium:** Ein Betrieb kann ohne externes Tool
Bewertungs-Anfragen versenden und Social-Posts vorbereiten.

### Meilenstein 4 — Backend & Daten
**Status:** ⏳ geplant

Supabase-Schema, Auth (Magic Link, optional OAuth), Repository-Layer
ersetzt die localStorage-Mocks transparent, Storage für Logos und Bilder,
Multi-Tenant-Isolation, Backups.

**Erfolgskriterium:** App läuft mit echter DB, mehrere Nutzer:innen
sehen ausschließlich ihre eigenen Daten, Daten überleben Browser-Wechsel.

### Meilenstein 5 — Production-Readiness
**Status:** ⏳ geplant

Vercel-Deployment für SSR-fähige Routen (parallel zu GitHub Pages),
Custom Domains, Sentry für Error-Tracking, Analytics, Lighthouse-CI,
Performance-Budgets, A11y-Audit, Security-Headers.

**Erfolgskriterium:** Lighthouse ≥ 95 in allen 4 Kategorien,
WCAG 2.2 AA dokumentiert geprüft, Sentry-Inbox leer.

### Meilenstein 6 — Vertikalisierung & Sales
**Status:** ⏳ geplant

Branchen-Presets von 13 auf 20+, Themes von 10 auf 15+, Sales-Materialien,
Onboarding-Doku, Pricing-Experimente, Demo-Videos, Case-Studies.

**Erfolgskriterium:** „Onboarding eines neuen Betriebs in unter 60 Min."
ist real durchführbar, dokumentiert, mehrfach getestet.

### Meilenstein 7 — Innovation Loop
**Status:** ♾️ permanent

Sobald Meilenstein 6 stabil ist, dreht sich das Programm in Schleifen.
Pro Quartal:

- Neue Anthropic-/OpenAI-/Gemini-Modelle integrieren, sobald sie
  released werden.
- Neue Web-Plattform-Features (View Transitions, Container Queries,
  Speculation Rules, Popover-API, …) prüfen und ggf. einbauen.
- Tailwind-Major-Updates folgen, falls sinnvoll.
- Neue Branchen, neue Themes, neue Sprachen.
- White-Label-Funktionen für Reseller.

Dieser Meilenstein endet nie.

## Meilenstein-Wechsel-Entscheidung

Wir wechseln den Fokus, wenn **alle drei** zutreffen:

1. Erfolgskriterium des aktuellen Meilensteins erreicht.
2. Keine kritischen Bugs offen (Lint/Typecheck/Build sind grün, niemand
   meldet Showstopper).
3. Es gibt einen klaren nächsten Meilenstein-Kandidaten, der mehr Wert
   bringt als weitere Sub-Sessions im aktuellen Meilenstein.

Wir können jederzeit **temporär zurückspringen** (z. B. ein dringender
Branchen-Preset wird gewünscht, mitten in Meilenstein 4) – ohne den
aktuellen Meilenstein abzuschließen.

## Quellen-Pflege

Jede Session zitiert ihre Recherche-Quellen im RUN_LOG-Eintrag. Damit
entsteht über die Zeit ein **belegtes Tagebuch** der eingebauten Patterns
– hilfreich für Onboarding neuer Mitwirkender und für spätere Audits.

## Was die alte „Session 1 bis 22"-Liste in `Claude.md` jetzt bedeutet

Die ursprünglichen Session-Beschreibungen in `Claude.md` dienen weiterhin
als **Inhaltsverzeichnis** der Funktionen, die im Produkt erwartet werden.
Sie sind aber nicht mehr 1:1 mit unseren Code-Sessions identisch:

- Sessions 1–12 wurden 1:1 umgesetzt (waren noch im alten Modell).
- Sessions 13+ werden in **mehrere kleinere Code-Sessions** zerlegt.
  Der Bereich „AI Provider Interface und Mock AI" aus dem alten Plan
  („Session 13") entspricht jetzt den Code-Sessions 13–25 in
  Meilenstein 2.
- Wenn ein Funktionsblock vollständig ist, wird im RUN_LOG vermerkt
  „erfüllt durch Code-Sessions 13–25".

So bleibt das Master-Briefing aus `Claude.md` der inhaltliche Anker, ohne
dass wir uns künstlich auf 22 Schritte beschränken.
