# Dashboard – LocalPilot AI

Adminbereich pro Demo-Betrieb. In Session 9 ist die **Grundstruktur** live:
Übersicht mit Cards (Paketstatus, Anfragen, Public-Site-Vorschau,
Schnellaktionen, letzte Anfragen) plus 7 Sub-Routen als Vorschauen, die
in den nächsten Sessions ausgebaut werden.

## Live

- Demo-Auswahl: `https://beko2210.github.io/LocalPilot-AI/dashboard/`
- Per-Business-Dashboard: `https://beko2210.github.io/LocalPilot-AI/dashboard/<slug>/`
- Sub-Routen: `…/dashboard/<slug>/{business,services,leads,ai,reviews,social,settings}`

Alle 6 Demo-Slugs sind statisch prerendert – kein Server, kein Backend
nötig. Auf GitHub Pages erzeugt der Build:static **49 Dashboard-Pages**
(1 Picker + 6 × 8 Sektionen).

## Routenbaum

```
src/app/dashboard/
  page.tsx                  → /dashboard         (Demo-Picker, listet alle 6 Demos)
  [slug]/
    layout.tsx              → notFound() für unbekannte Slugs
    not-found.tsx           → 404-Seite im Marketing-Layout
    page.tsx                → /dashboard/<slug>           (Übersicht)
    business/page.tsx       → /dashboard/<slug>/business  (Stub – Session 10)
    services/page.tsx       → /dashboard/<slug>/services  (Stub – Session 11)
    leads/page.tsx          → /dashboard/<slug>/leads     (Stub – Session 12)
    ai/page.tsx             → /dashboard/<slug>/ai        (Stub – Session 13–15)
    reviews/page.tsx        → /dashboard/<slug>/reviews   (Stub – Session 16)
    social/page.tsx         → /dashboard/<slug>/social    (Stub – Session 17)
    settings/page.tsx       → /dashboard/<slug>/settings  (Stub – Session 18+)
```

Jede Sub-Route nutzt `generateStaticParams(listMockBusinessSlugs())`,
sodass alle Slugs zur Build-Zeit prerendert werden.

## Komponenten unter `src/components/dashboard/`

```
nav-config.ts              DASHBOARD_NAV-Liste + dashboardHref(slug, key)
dashboard-shell.tsx        Layout-Hülle (BusinessHeader + Sidebar + Mobile-Nav)
business-header.tsx        Sticky-Top mit Name/Branche, Tier-Badge, Demo-Switcher
dashboard-sidebar.tsx      Persistente Sidebar (Desktop)
dashboard-mobile-nav.tsx   Horizontaler Scroll-Strip (Mobile, kein Drawer-State)
dashboard-card.tsx         Karten-Primitive mit Title/Description/Action
empty-state.tsx            Leer-Zustand mit optionalem Icon und CTA
coming-soon-section.tsx    Vorschau für Sub-Routen (zeigt Roadmap + Paket-Gating)

overview/
  package-status-card.tsx  Aktuelles Paket + Bronze/Silber/Gold-Fortschrittsbar
  leads-summary-card.tsx   Status-Counts (Neu / Kontaktiert / Qualifiziert / …)
  preview-link-card.tsx    Slug + Veröffentlichungsstatus + Öffnen-Button
  quick-actions-card.tsx   4 Quick-Actions, paketabhängig gegated
  recent-leads-list.tsx    Letzte 5 Anfragen mit Status, Quelle, Anrufen-Link
```

`index.ts` exportiert alles als Barrel:

```ts
import {
  DashboardShell,
  PackageStatusCard,
  LeadsSummaryCard,
  PreviewLinkCard,
  QuickActionsCard,
  RecentLeadsList,
  ComingSoonSection,
  DASHBOARD_NAV,
  dashboardHref,
} from "@/components/dashboard";
```

## Single Source of Truth: `nav-config.ts`

```ts
export const DASHBOARD_NAV: readonly DashboardNavItem[] = [
  { key: "overview",  pathSuffix: "",          label: "Übersicht",     icon: LayoutDashboard },
  { key: "business",  pathSuffix: "/business", label: "Betriebsdaten", icon: Building2,  comingInSession: 10 },
  { key: "services",  pathSuffix: "/services", label: "Leistungen",    icon: Briefcase,  comingInSession: 11 },
  { key: "leads",     pathSuffix: "/leads",    label: "Anfragen",      icon: Inbox,      comingInSession: 12 },
  { key: "ai",        pathSuffix: "/ai",       label: "KI-Assistent",  icon: Sparkles,   comingInSession: 13 },
  { key: "reviews",   pathSuffix: "/reviews",  label: "Bewertungen",   icon: Star,       comingInSession: 16 },
  { key: "social",    pathSuffix: "/social",   label: "Social Media",  icon: Megaphone,  comingInSession: 17 },
  { key: "settings",  pathSuffix: "/settings", label: "Einstellungen", icon: Settings,   comingInSession: 18 },
];
```

Sidebar, Mobile-Nav und Übersichts-Quickactions lesen alle aus dieser
Liste – jede neue Sektion ist exakt eine Zeile.

## UX-Konventionen

- **Branchenneutrale, nicht-technische Sprache**:
  „Anfragen" statt „Leads" in der Nav, „Aktiver Demo-Betrieb" statt
  „Tenant", „Letzte Anfragen" statt „Recent submissions".
- **Demo-Switcher** (`<details>`-basiert, kein Client-JS): zeigt alle
  6 Demos mit ihrem Tier-Kürzel, navigiert auf `/dashboard/<slug>`.
- **Vorschau-Markierung**: jede Stub-Sektion bekommt im Sidebar-Eintrag
  ein „Vorschau"-Badge mit Lock-Icon. Auf der Stub-Page selbst zeigt
  `<ComingSoonSection>`:
  - was die Sektion können wird (aus Claude.md abgeleitet),
  - in welcher Session sie freigeschaltet wird,
  - ob das aktuelle Paket die Funktion bereits enthielte (Feature-Gating).
- **Quickactions sind Paket-aware**: nicht freigeschaltete Aktionen sind
  optisch matter und tragen den Hinweis „Verfügbar ab Silber/Gold".
- **Mobile-First**: Sidebar erst ab `md:` sichtbar, davor erscheint ein
  horizontaler Scroll-Strip. `<BusinessHeader>` bleibt oben mit Tier-Badge.

## Static-Export-Tauglichkeit

Alle Routen sind reine Server Components. Keine `useState`, kein
`useEffect`, keine API-Calls zur Render-Zeit. Demo-Switcher nutzt
`<details>`/`<summary>` für CSS-only-Toggle.

Ergebnis im Build:

```
├ ● /dashboard/[slug]                            199 B         106 kB
├   ├ /dashboard/studio-haarlinie
├   ├ /dashboard/autoservice-mueller
├   ├ /dashboard/glanzwerk-reinigung
├   └ [+3 more paths]
├ ● /dashboard/[slug]/business                   199 B         106 kB
├ ● /dashboard/[slug]/services                   199 B         106 kB
├ ● /dashboard/[slug]/leads                      199 B         106 kB
├ ● /dashboard/[slug]/ai                         199 B         106 kB
├ ● /dashboard/[slug]/reviews                    199 B         106 kB
├ ● /dashboard/[slug]/social                     199 B         106 kB
├ ● /dashboard/[slug]/settings                   199 B         106 kB
```

## Sicherheits- & Privacy-Notes

- Alle Dashboard-Routen tragen `robots: { index: false, follow: false }`
  in den Metadaten. Suchmaschinen sollen die Demo-Pages nicht indexieren.
- Keine echten Personen-Daten – nur Demo-Datensätze aus Session 6.
- Sobald Auth (Session 19) live ist, sieht eine Nutzerin nur ihren
  eigenen Slug; der Picker entfällt für eingeloggte Sitzungen.

## Erweiterung

Eine neue Dashboard-Sektion hinzufügen:

1. `nav-config.ts` ergänzen (key + pathSuffix + label + icon + ggf.
   `comingInSession`).
2. Route `src/app/dashboard/[slug]/<suffix>/page.tsx` mit
   `generateStaticParams` und `<DashboardShell>` + `<ComingSoonSection>`
   (oder echter Inhalt) anlegen.
3. Optional: eigene Card-Komponente unter
   `src/components/dashboard/<feature>/`.
4. Smoketest und diese Datei aktualisieren.

Eine Sub-Route von „Vorschau" zu „echt" promoten:

1. `comingInSession` aus `nav-config.ts` entfernen.
2. Stub-Page durch echte Implementierung ersetzen.
3. Sidebar-Lock-Badge verschwindet automatisch.

## Beziehung zu späteren Sessions

- **Session 10** – `business/page.tsx` mit Stammdaten-Formular.
- **Session 11** – `services/page.tsx` mit Service-CRUD.
- **Session 12** – `leads/page.tsx` mit Filter, Detail-Drawer,
  Antwort-Vorlagen.
- **Sessions 13–15** – `ai/page.tsx` mit Provider-Auswahl, Generator-Cards.
- **Session 16** – `reviews/page.tsx` mit Bewertungs-Booster-Vorlagen.
- **Session 17** – `social/page.tsx` mit Plattform/Ziel/Tonalität-Form.
- **Session 18** – `settings/page.tsx` mit Slug, Veröffentlichung,
  Theme-Picker.
- **Session 19** – Auth via Supabase; Demo-Picker entfällt für
  eingeloggte Sitzungen, Repository-Layer ersetzt
  `getMockBusinessBySlug` transparent.
