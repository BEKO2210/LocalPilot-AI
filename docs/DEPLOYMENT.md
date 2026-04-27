# Deployment – LocalPilot AI

Aktuelles Setup: **GitHub Pages** für Live-Vorschauen (kostenlos, statisch).
Mittelfristig (sobald API-Routen / Supabase einziehen) zusätzlich **Vercel**
für die Voll-SSR-Variante.

## GitHub Pages – Schnellstart

Einmaliger Schritt im Repo (UI):

1. **Settings → Pages**
2. **Source** → "GitHub Actions" auswählen.
3. Speichern.

Danach passiert alles automatisch:

- Pusht jemand auf `main` oder eine `claude/**`-Branch, läuft das Workflow
  `.github/workflows/deploy.yml`.
- Es baut die App mit `STATIC_EXPORT=true` und `NEXT_PUBLIC_BASE_PATH=/LocalPilot-AI`.
- Das Ergebnis wird als GitHub-Pages-Artefakt hochgeladen und veröffentlicht.

URL nach erfolgreichem Deploy:

```
https://beko2210.github.io/LocalPilot-AI/
```

(Username klein – GitHub-Pages-URLs sind case-insensitive.)

Status & Logs: **Actions**-Tab im Repo. Jeder Run zeigt am Ende die
Deploy-URL.

## Wie das technisch funktioniert

### 1. Konditioneller Static-Export in `next.config.mjs`

```js
const useStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(useStaticExport && {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
    basePath: basePath || undefined,
    assetPrefix: basePath ? `${basePath}/` : undefined,
  }),
};
```

Vorteil: `npm run dev` und `npm run build` laufen lokal **ohne** statischen
Export, weiterhin mit voller Server-Component-Unterstützung. Erst mit
`STATIC_EXPORT=true` schaltet Next.js auf einen reinen Static-Export um.

Lokal testbar mit:

```bash
npm run build:static     # baut nach out/
npx serve out            # lokal anschauen, falls "serve" installiert ist
```

### 2. Workflow `.github/workflows/deploy.yml`

- Trigger: Push auf `main` oder `claude/**`, plus manuelles
  `workflow_dispatch` über die GitHub-UI.
- Build-Steps:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node 22, npm-Cache)
  3. `actions/configure-pages@v5` mit `static_site_generator: next`
  4. `npm ci`
  5. `npm run build` mit `STATIC_EXPORT=true` und
     `NEXT_PUBLIC_BASE_PATH=/${{ github.event.repository.name }}`
  6. `touch out/.nojekyll` – sonst ignoriert GitHub Pages das `_next`-Verzeichnis
  7. `actions/upload-pages-artifact@v3`
- Deploy-Step: `actions/deploy-pages@v4`
- Concurrency-Group `pages` – kein paralleles Doppel-Deploy.

### 3. Nojekyll-Trick

GitHub Pages ignoriert per Default Verzeichnisse, die mit `_` beginnen.
Next.js schreibt seine Assets aber nach `_next/`. Die leere Datei
`out/.nojekyll` deaktiviert diese Regel.

## Branch-Strategie

- `main` → produktive GitHub-Pages-Site
- `claude/**` → Live-Preview (überschreibt die Production-Pages, weil
  GitHub Pages nur eine aktive Site pro Repo unterstützt)

Ergebnis: Während wir auf einer `claude/**`-Branch arbeiten, zeigt die
Pages-URL den jeweils aktuellen Stand dieser Branch. Sobald gemerged wird
und `main` als nächste pusht, übernimmt `main` die Anzeige.

Wer parallel zwei Stände sehen will (Production + Preview), nutzt später
Vercel-Previews statt GitHub Pages für Branches.

## Einschränkungen von GitHub Pages

GitHub Pages ist **rein statisch**. Daraus folgt:

- **Keine API-Routen** – `app/api/...` ist mit `output: "export"` nicht
  unterstützt. Bis Session 12/13 nicht relevant.
- **Keine Server Actions** – betrifft uns derzeit nicht.
- **Bilder ohne Optimization** – mit `images: { unoptimized: true }` werden
  Bilder unverändert ausgeliefert. Für Marketing reicht das.
- **`/site/[slug]` Dynamic Routes** funktionieren nur, wenn alle Slugs zur
  Build-Zeit über `generateStaticParams()` erzeugt werden. Sobald die
  Mock-Daten aus Session 6 stehen, generieren wir die Slugs zur Build-Zeit.

Sobald wir echte Backend-Funktionen brauchen (Lead-Speichern in DB,
Live-AI-Calls, Auth), kommt **Vercel** dazu. GitHub Pages bleibt als
schneller, kostenloser Showcase erhalten.

## Vercel (geplant ab Session 19)

Wenn Supabase und API-Routen einziehen:

1. Repo bei [vercel.com/new](https://vercel.com/new) verbinden.
2. ENV-Variablen aus `.env.example` setzen (`SUPABASE_*`, optional
   `OPENAI_API_KEY` etc.).
3. **Kein** `STATIC_EXPORT=true` setzen – Vercel soll die App mit voller
   SSR-Unterstützung bauen.
4. Vercel deployt automatisch bei jedem Push, mit Preview-URLs pro
   Branch/PR.

Beide Targets laufen aus demselben Code – die Workflow- und ENV-Variable
`STATIC_EXPORT` ist die einzige Weiche.

## Smoke-Tests nach jedem Deploy

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://beko2210.github.io/LocalPilot-AI/
# erwartet: 200
```

Auf der Seite sichtbar prüfen:

- Hero rendert mit "Moderne Websites und KI-Automation für lokale Betriebe."
- Pricing-Karten mit 49 €, 99 €, 199 €
- Mobile Ansicht (DevTools 375 px) sieht aufgeräumt aus.

## Häufige Stolperfallen

**404 auf Assets nach Deploy.** Meist fehlt der `basePath`. Im Workflow ist
`NEXT_PUBLIC_BASE_PATH=/${{ github.event.repository.name }}` gesetzt – wenn
das Repo umbenannt wird, passt sich das automatisch an.

**`/_next/...` 404.** `.nojekyll` fehlt. Der Step `touch out/.nojekyll` im
Workflow verhindert das.

**Hash-Links springen, externe Links zerlegt.** `next/link` rechnet den
basePath automatisch ein. Plain-HTML `<a href="/dashboard">` (ohne
`next/link`) bekommt **kein** Präfix – immer `next/link` verwenden, sobald
es interne Routen sind.

**Lokaler Static-Build crasht.** Erst `rm -rf .next out` ausführen, dann
`npm run build:static`. Manchmal bleibt ein Mischzustand zurück, wenn
vorher ein normaler `npm run build` lief.
