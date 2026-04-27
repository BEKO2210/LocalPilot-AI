# Deployment – LocalPilot AI

LocalPilot AI deployt auf **zwei Pipelines parallel**:

| Pipeline      | Was                                                        | URL-Pattern                                |
| ------------- | ---------------------------------------------------------- | ------------------------------------------ |
| **GitHub Pages** | Statische Routen (Marketing, Public-Site, Demo, Themes)  | `https://beko2210.github.io/LocalPilot-AI/` |
| **Vercel**    | SSR + alle `/api/*`-Routen (Auth, AI-Generate, Health)     | `https://localpilot-ai.vercel.app` (Beispiel) |

GitHub Pages bleibt der schnelle, kostenlose Showcase. Vercel kommt
für alles, was einen Server braucht: Login-Cookies, KI-Live-Calls,
Cost-Tracking, Rate-Limits.

Welche Pipeline triggert wann?

- **Pages**: Workflow `.github/workflows/deploy.yml` läuft auf jedem
  Push auf `main` und `claude/**`.
- **Vercel**: integriert via Vercel-GitHub-App (oder Vercel-CLI).
  Auto-Deploy auf `main` (Production) + Preview-URLs für andere
  Branches.

Beide Pipelines bauen aus **demselben** Repo mit **demselben** Code —
nur das Build-Kommando unterscheidet sich. Pages setzt
`STATIC_EXPORT=true`, Vercel nicht. Siehe `next.config.mjs` für die
konditionale Logik.

---

## Teil A — GitHub Pages (statisch, kostenlos)

### Setup (einmalig)

1. **Settings → Pages** im GitHub-Repo
2. **Source** → "GitHub Actions"
3. Speichern

Danach passiert alles automatisch:

- Push auf `main` oder `claude/**` triggert `.github/workflows/deploy.yml`.
- Build mit `STATIC_EXPORT=true` und `NEXT_PUBLIC_BASE_PATH=/LocalPilot-AI`.
- Ergebnis als GitHub-Pages-Artefakt veröffentlicht.

URL nach erfolgreichem Deploy:

```
https://beko2210.github.io/LocalPilot-AI/
```

Status & Logs: **Actions**-Tab im Repo.

### Wie das technisch funktioniert

**Konditioneller Static-Export** in `next.config.mjs`:

```js
const useStaticExport = process.env.STATIC_EXPORT === "true";
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: useStaticExport
    ? ["tsx", "jsx"]            // schließt route.ts (API) aus
    : ["tsx", "ts", "jsx", "js"],
  ...(useStaticExport && {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    assetPrefix: `${process.env.NEXT_PUBLIC_BASE_PATH}/`,
  }),
};
```

Vorteil: dasselbe Code-Repo läuft auf beiden Pipelines. Pages baut
ohne API-Routen, Vercel mit.

**Nojekyll-Trick**: GitHub Pages ignoriert per Default Verzeichnisse,
die mit `_` beginnen. Next.js schreibt seine Assets nach `_next/`.
`touch out/.nojekyll` im Workflow deaktiviert die Regel.

### Lokal testen

```bash
npm run build:static     # baut nach out/
npx serve out            # lokal anschauen
```

### Einschränkungen

- **Keine API-Routen**: `app/api/...` ist im Static-Export
  ausgeschlossen (`pageExtensions`-Filter). Sichtbar an „API-Route
  nicht verfügbar"-Hinweis im Playground.
- **Keine Server Actions**.
- **Bilder ohne Optimization** (`images.unoptimized: true`).
- **Dynamic Routes** wie `/site/[slug]` müssen alle Slugs zur Build-
  Zeit kennen (`generateStaticParams()`).

Wer Live-Provider, Cookie-Auth, Cost-Tracking testen will, nutzt die
Vercel-Pipeline (Teil B).

---

## Teil B — Vercel (SSR, API-Routen)

### Setup (einmalig)

```bash
# 1. Vercel-CLI installieren (einmal pro Maschine)
npm install -g vercel

# 2. Repo verbinden (im Repo-Root, einmal pro Repo)
vercel link
# → wählt das Vercel-Team / Projekt

# 3. ENV-Variablen setzen (Production)
vercel env add LP_AI_API_KEY production
vercel env add LP_AI_PASSWORD production
vercel env add LP_AI_SESSION_SECRET production
vercel env add LP_AI_DAILY_CAP_USD production    # z. B. 5.00

# Optional, je nach gewünschten Live-Providern:
vercel env add OPENAI_API_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add GEMINI_API_KEY production

# 4. Production-Deploy
vercel --prod
```

Die Vorlage aller benötigten Variablen steht in
[`.env.production.example`](../.env.production.example) — niemals
echte Werte dort einchecken.

**Empfohlene Werte:**
- `LP_AI_SESSION_SECRET`: 32-Byte-Random-Base64,
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- `LP_AI_PASSWORD`: separat von `LP_AI_API_KEY`. Leakt der Bearer-
  Token, ist das Login-Passwort dadurch nicht kompromittiert.
- `LP_AI_DAILY_CAP_USD`: konservativ starten (z. B. `1.00`), nach
  Erfahrung erhöhen.

### Region

Default ist `fra1` (Frankfurt) — für DACH-Märkte optimal. Steht
explizit in [`vercel.json`](../vercel.json):

```json
{
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

Wer Multi-Region braucht (Pro-Plan), kann mehrere Regionen
eintragen — siehe Vercel-Docs.

### Auto-Deploy via Vercel-GitHub-App

Vercel installiert nach `vercel link` automatisch eine GitHub-App im
Repo. Ab dann:

- Push auf `main` → Production-Deploy
- Push auf jede andere Branch → Preview-Deploy mit eigener URL

Kein zusätzlicher GitHub-Action-Workflow nötig.

### Lokal testen wie auf Vercel

```bash
# .env.local mit allen Werten füllen (siehe .env.production.example)
npm run dev
# Login auf http://localhost:3000/dashboard/<slug>/ai
# → AuthCard zeigt Login-Form
# → Passwort eingeben → Cookie gesetzt → Live-Provider freigeschaltet
```

### Smoke-Test nach Deploy

```bash
# 1. Health-Endpoint mit Bearer-Token
curl -H "Authorization: Bearer $LP_AI_API_KEY" \
  https://<dein-vercel-projekt>.vercel.app/api/ai/health

# 2. Login → Cookie → Me
curl -c /tmp/cookies.txt -X POST \
  -H "content-type: application/json" \
  -d '{"password":"'$LP_AI_PASSWORD'"}' \
  https://<dein-vercel-projekt>.vercel.app/api/auth/login

curl -b /tmp/cookies.txt \
  https://<dein-vercel-projekt>.vercel.app/api/auth/me
# erwartet: {"authenticated":true,"principal":"admin","via":"cookie"}
```

### Roll-back

Vercel hält jeden Deploy als unveränderbares Snapshot. Im Dashboard
unter **Deployments** auf einen älteren Snapshot klicken, dann
**Promote to Production**. Kein Re-Build nötig, < 30 Sekunden Schwenk.

---

## Beide Pipelines parallel — wann ist was sichtbar?

| Stand                                           | Was Pages zeigt           | Was Vercel zeigt              |
| ----------------------------------------------- | ------------------------- | ----------------------------- |
| **Public-Site** (`/site/<slug>`)                | ✅ live                    | ✅ live (gleicher Code)        |
| **Marketing-Funnel** (`/`, `/pricing`, `/demo`) | ✅                         | ✅                             |
| **Dashboard-UI** (`/dashboard/<slug>/...`)      | ✅ aber Mock-only          | ✅ + Login + Live-Provider     |
| **Datenschutz / Impressum** (`/site/<slug>/...`) | ✅                        | ✅                             |
| **API-Routen** (`/api/auth/*`, `/api/ai/*`)     | ❌ 404 (Static-Build)      | ✅ Serverless Functions        |
| **Lead-Form**                                   | ✅ + localStorage          | ✅ + localStorage              |

**Faustregel**: was nur Lesen erfordert, läuft auf Pages. Was Server-
Logik braucht, läuft auf Vercel.

---

## Branch-Strategie

- `main` → Production auf beiden Pipelines.
- `claude/**` → Pages-Preview (überschreibt Production-Pages, da
  GitHub Pages nur eine Site pro Repo hat) **und** Vercel-Preview
  (eigene URL pro Branch, Production-Site bleibt unverändert).

Vercel-Preview-URLs haben das Format
`https://<projekt>-<hash>-<team>.vercel.app` und sind ideal für
PR-Reviews.

---

## Häufige Stolperfallen

**Pages: 404 auf Assets nach Deploy.** Fehlender `basePath`. Im
Workflow ist `NEXT_PUBLIC_BASE_PATH=/${{ github.event.repository.name }}`
gesetzt — passt sich automatisch bei Repo-Rename an.

**Pages: `/_next/...` 404.** `.nojekyll` fehlt. Workflow-Step
`touch out/.nojekyll` muss da sein.

**Vercel: Login funktioniert nicht (401 trotz richtigem Passwort).**
`LP_AI_PASSWORD` fehlt in der Vercel-ENV. Mit `vercel env ls`
prüfen.

**Vercel: 503 Service Not Configured.** Weder `LP_AI_API_KEY`
noch `LP_AI_SESSION_SECRET` gesetzt. Mindestens einen davon setzen.

**Vercel: Cookie kommt im Browser nicht an.** Browser-Konsole prüfen:
in Production muss `Secure` gesetzt sein, Domain muss HTTPS sein.
Wenn man eine Custom-Domain via HTTP testet, schlägt das fehl.

**Lokaler Static-Build crasht.** Erst `rm -rf .next out` ausführen,
dann `npm run build:static`. Manchmal bleibt ein Mischzustand zurück,
wenn vorher ein normaler `npm run build` lief.

**Vercel: Build sucht nach API-Routen, findet aber `route.ts` nicht.**
Die Static-Export-`pageExtensions`-Filterung greift nur, wenn
`STATIC_EXPORT=true` gesetzt ist. Auf Vercel ist das nicht der Fall —
Routen sollten gefunden werden. Wenn doch nicht: prüfen, ob Vercel
versehentlich die ENV gesetzt hat (Settings → Environment Variables).
