# Domain + Email-Setup – LocalPilot AI

Schritt-für-Schritt-Anleitung für die Production-Domain und
ein DSGVO-konformes Email-Postfach. **Operative Doku** —
einmal Schritt 1 bis 9 abgearbeitet, läuft die echte
Marketing-/Pilotkunden-Domain.

> **Stand:** Code-Session 87 (Phase 3, Sessions 85–100 →
> Verkaufsreife). Wird in S94 (Production-Deploy-Pipeline)
> kalt-getestet und in S100 final geprüft.

---

## Status

- ❌ Domain registriert
- ❌ Vercel-Deployment auf Custom-Domain
- ❌ Email-Postfach `kontakt@<domain>` aktiv
- ❌ Magic-Link-Auth-Smoketest auf Production-Domain bestanden

Jeder Punkt wird in `docs/PRODUCT_STATUS.md` auf ✅ gesetzt,
sobald er durchgeführt ist.

---

## Empfohlene Wahl

| Komponente            | Empfehlung                        | Warum                                                |
| --------------------- | --------------------------------- | ---------------------------------------------------- |
| **Domain-Registrar**  | INWX, Hetzner, Cloudflare-Domains | Deutsche Registrar oder günstige Cloudflare-Preise   |
| **Domain-TLD**        | `.de` oder `.ai` oder `.eu`       | `.de` für lokalen B2B-Betrieb am vertrauenswürdigsten |
| **Hosting (App)**     | Vercel                            | bereits konfiguriert, SSL automatisch                |
| **Email-Hosting**     | **mailbox.org** (DSGVO, deutsch)  | 1 €/Monat/Postfach, deutscher Anbieter, BDSG+GDPR    |
| **Alternativ Email**  | Fastmail (USD 3/m) oder Google Workspace (€7/m) | wenn Office-Suite gebraucht wird |

Begründung mailbox.org: Pilotkunden in DE achten auf
DSGVO-Standort. Ein deutscher Anbieter im Footer-Impressum
ist Vertrauenssignal — Google-Workspace-Email kann Skepsis
auslösen bei Friseur/Werkstatt-/Reinigungsfirma-Kunden.

---

## Schritt 1 — Domain registrieren

**Vorschlag:** `localpilot.ai` (matcht das Brand-Wordmark
aus `docs/BRAND.md`). Falls nicht verfügbar:
`localpilot.de`, `local-pilot.ai`, `localpilot-ai.com`.

1. Bei einem Registrar einen Account anlegen.
   - INWX (https://www.inwx.de) — deutsch, ~15 €/Jahr für
     `.de`, ~70 €/Jahr für `.ai`
   - Hetzner Domains — wenn du eh schon Hetzner-Kunde bist
   - Cloudflare-Registrar — At-cost-Pricing, aber nur wenn
     du die DNS bei Cloudflare hosten willst
2. Domain prüfen + registrieren. **WHOIS-Privacy** aktivieren
   (sonst stehen deine Adressdaten öffentlich).
3. **TODO**: Domain-Name + Registrar in
   `docs/PRODUCT_STATUS.md` Sektion „Domain" eintragen.

## Schritt 2 — Vercel-Projekt verbinden

Voraussetzung: Repo ist bereits via Vercel-GitHub-App
verbunden (siehe `docs/DEPLOYMENT.md` Teil B).

1. Im Vercel-Dashboard: **Project → Settings → Domains**.
2. Custom-Domain hinzufügen:
   - Apex: `localpilot.ai` (z. B.)
   - WWW-Subdomain: `www.localpilot.ai` (per Redirect zur
     Apex-Variante).
3. Vercel zeigt jetzt:
   - **A-Record** für die Apex-Domain (eine Anycast-IP wie
     `76.76.21.21`).
   - **CNAME** für `www`-Subdomain (eindeutiger Wert wie
     `cname.vercel-dns.com.`).

Quelle: [Vercel – Adding a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

## Schritt 3 — DNS-Records beim Registrar setzen

Im DNS-Panel des Registrars:

| Typ      | Name      | Wert                                      | TTL     |
| -------- | --------- | ----------------------------------------- | ------- |
| `A`      | `@`       | `76.76.21.21` (Vercel-IP, exakt aus Schritt 2) | 3600    |
| `CNAME`  | `www`     | `cname.vercel-dns.com.` (Punkt am Ende!) | 3600    |
| `CAA`    | `@`       | `0 issue "letsencrypt.org"`               | 3600    |
| `CAA`    | `@`       | `0 issue "globalsign.com"` (Vercel-Backup) | 3600    |

**Wichtig**: Bei CNAME-Werten den **finalen Punkt** setzen
(absolut qualifizierter Name).

`CAA`-Records sind optional, aber gute Praxis (verhindern,
dass Dritte SSL-Zertifikate für deine Domain ausstellen).

## Schritt 4 — DNS-Propagation prüfen

Nach 5–60 Minuten:

```bash
dig localpilot.ai +short        # → 76.76.21.21
dig www.localpilot.ai +short    # → cname.vercel-dns.com. + Anycast-IP
dig CAA localpilot.ai           # → letsencrypt + globalsign
```

Auf macOS/Linux. Auf Windows: `nslookup localpilot.ai`.

In Vercel-Dashboard wird der Domain-Status nach erfolgreicher
Verifikation auf grünes Häkchen umspringen, SSL wird
automatisch via Let's Encrypt provisioniert (~5 Min).

## Schritt 5 — Production-ENV aktualisieren

In Vercel-Dashboard: **Settings → Environment Variables**:

```bash
NEXT_PUBLIC_APP_URL="https://localpilot.ai"
NEXT_PUBLIC_BASE_PATH=""               # leer für Production (nur Pages braucht Base-Path)
NEXT_PUBLIC_ALLOWED_ORIGINS="https://localpilot.ai,https://www.localpilot.ai"
```

Die `NEXT_PUBLIC_ALLOWED_ORIGINS`-Variable wird vom
CSRF-Schutz (`src/lib/csrf.ts` aus S66) gelesen — ohne sie
würden mutating-Requests von der Production-Domain blockiert.

Nach Speichern: **Redeploy** triggern (oder per
`git commit --allow-empty -m "ci: redeploy with new envs"`).

## Schritt 6 — Email-Postfach einrichten (mailbox.org)

1. Bei https://mailbox.org einen Business-Account anlegen.
   Tarif „Standard" 3 €/Monat reicht (mit Custom-Domain-
   Hosting, IMAP/SMTP, WebMail, Office-Suite).
2. **Domain hinzufügen**: `localpilot.ai`.
3. Mailbox.org zeigt dir die nötigen DNS-Records:
   - **MX-Records** (Priorität 10 + 20)
   - **SPF-Record** (TXT) — verhindert Email-Spoofing
   - **DKIM-Record** (TXT) — Email-Signierung
   - **DMARC-Record** (TXT) — Reporting + Policy

Eintragen ins Registrar-DNS:

| Typ     | Name         | Wert                                                       | Prio |
| ------- | ------------ | ---------------------------------------------------------- | ---- |
| `MX`    | `@`          | `mxext1.mailbox.org.`                                      | 10   |
| `MX`    | `@`          | `mxext2.mailbox.org.`                                      | 20   |
| `MX`    | `@`          | `mxext3.mailbox.org.`                                      | 30   |
| `TXT`   | `@`          | `v=spf1 include:mailbox.org ~all`                          | –    |
| `TXT`   | `mbo0001._domainkey` | `<DKIM-Public-Key aus mailbox.org-Setup>`         | –    |
| `TXT`   | `_dmarc`     | `v=DMARC1; p=quarantine; rua=mailto:dmarc@localpilot.ai`   | –    |

(Exakte Werte zeigt dir mailbox.org im Setup-Wizard.)

4. **Postfach anlegen**: `kontakt@localpilot.ai`.
5. Aliase einrichten:
   - `hello@` → `kontakt@`
   - `support@` → `kontakt@` (für S97 Support-Workflow)
   - `dpa@` → `kontakt@` (DSGVO-Anfragen)

## Schritt 7 — Email-Empfang testen

```bash
# Aus einer anderen Email-Adresse:
echo "Test" | mail -s "Test S87" kontakt@localpilot.ai
```

Oder einfach via WebMail eine Email von Privatadresse
verschicken. Mailbox.org WebMail (https://office.mailbox.org)
sollte sie binnen 30 Sek empfangen.

## Schritt 8 — Magic-Link-Auth-Smoketest auf Production

Mit Production-Domain + Email-Postfach lassen sich jetzt
echte Auth-Smoketests fahren:

1. https://localpilot.ai/login öffnen.
2. Email-Adresse eingeben (z. B. private Adresse für Test).
3. „Magic-Link senden" klicken.
4. Email checken — Link sollte aus
   `noreply@<supabase-domain>.supabase.co` kommen oder vom
   konfigurierten SMTP-Sender.
5. Link klicken → Redirect auf
   `https://localpilot.ai/api/auth/callback?...`.
6. Cookie wird gesetzt, User landet auf `/account`.

**Falls Schritt 5 fehlschlägt** (Cookie nicht gesetzt /
CSRF-Reject): `NEXT_PUBLIC_ALLOWED_ORIGINS` aus Schritt 5
prüfen.

**Falls Email nicht ankommt**: Supabase-Project-Settings →
Auth → Email-Templates checken. SMTP-Provider muss DKIM-
signiert sein, sonst landet die Email im Spam. Empfehlung:
Resend (https://resend.com) als Supabase-SMTP-Provider —
free-Tier reicht für Pilotwelle.

## Schritt 9 — Sales-Material aktualisieren

Sobald Domain + Email aktiv sind:

1. `src/components/marketing/cta-contact.tsx`: Demo-Hinweis
   entfernen, echte Email + Telefonnummer eintragen
   (oder `kontakt@`-Mailto-Link aktivieren).
2. `README.md` Kontakt-Sektion: „Hinweis Phase 3"-Block
   entfernen, echte Email rein.
3. `docs/SALES_PLAYBOOK.md` §3 Outbound-Template:
   Absender-Email auf `kontakt@localpilot.ai` setzen.
4. `docs/PRODUCT_STATUS.md` Sektion „Domain": alle 4
   Punkte ✅ setzen.
5. CTA-Contact-Sub-Hint „Hotline ab Session 87 (Domain-
   Setup)" entfernen.

## Troubleshooting

### „This site can't be reached" nach DNS-Setup

- DNS-TTL noch nicht abgelaufen: 1–24 h warten.
- Browser-DNS-Cache: `chrome://net-internals/#dns` → Clear.
- macOS: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`

### Vercel zeigt „Misconfigured Domain"

- A-Record-Wert exakt mit dem aus Vercel-Dashboard
  abgleichen — Anycast-IPs ändern sich gelegentlich.
- CNAME-Wert MIT abschließendem Punkt eingegeben?
- Quelle: [Vercel – Troubleshooting Domains](https://vercel.com/docs/domains/troubleshooting).

### Email landet im Spam

- SPF/DKIM/DMARC-Records in dieser Reihenfolge prüfen:
  `mxtoolbox.com/SuperTool.aspx`.
- DMARC-Policy `p=none` für die ersten 2 Wochen
  (Monitoring-Phase), dann auf `p=quarantine` hochziehen.

### `kontakt@`-Postfach erhält Test-Mails nicht

- Greylisting bei mailbox.org: kann 5–15 Min dauern.
- Tarif zu klein? „Lite"-Tarif hat keine Custom-Domain,
  „Standard"-Tarif ja.

---

## Cross-Reference

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Vercel + GitHub Pages
  Setup (vor diesem Doc abarbeiten)
- [`SALES_PLAYBOOK.md`](./SALES_PLAYBOOK.md) Schritt 9 nach
  Domain-Setup aktualisieren
- [`PRODUCT_STATUS.md`](./PRODUCT_STATUS.md) Domain-Status-
  Tabelle nach Schritt 9 aktualisieren
- [`SUPABASE_SCHEMA.md`](./SUPABASE_SCHEMA.md) — falls
  Magic-Link-Setup-Probleme

## Quellen (2026-Stand)

- [Vercel – Adding a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Vercel – Managing DNS Records](https://vercel.com/docs/domains/managing-dns-records)
- [Vercel – A-Record + CAA](https://vercel.com/kb/guide/a-record-and-caa-with-vercel)
- [Vercel – Troubleshooting Domains](https://vercel.com/docs/domains/troubleshooting)
- [mailbox.org Business-Tarife](https://mailbox.org/en/business/)
- [European Purpose – mailbox.org Review 2026](https://europeanpurpose.com/tool/mailbox-org)
