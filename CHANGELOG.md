# Changelog

Alle nennenswerten Änderungen am Projekt werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung an [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- Session 2: Core-Typen und Datenmodelle (Business, Service, Lead, Review, FAQ, IndustryPreset, Theme, PricingTier, AI-Typen, Zod-Schemas).
- Session 3: Pricing-System (Bronze/Silber/Gold) als Code-Konfiguration mit Feature-Locks.
- Session 4+: Branchen-Presets, Themes, Mock-Daten, Public Site Generator, Dashboard, KI-Provider, Bewertungs-Booster, Social-Media-Generator, Supabase-Vorbereitung, Polish, Deployment.

## [0.1.0] – Session 1 – 2026-04-27

### Added
- Next.js 15 (App Router), TypeScript strict, Tailwind CSS, ESLint Setup.
- Root-Layout mit deutschsprachigen Metadaten und Open-Graph-Defaults.
- Globale Styles, Tailwind-Theme (Brand- und Ink-Farbpaletten, Container, Schatten, Radius).
- UI-Primitive: `Container`, `Section`, `Button`, `LinkButton`.
- Layout-Komponenten: `SiteHeader`, `SiteFooter`.
- Marketing-Landingpage (`/`) mit Sektionen Hero, Problem, Lösung, Branchen, Pakete (Teaser), Vorteile, FAQ, Kontakt-CTA.
- Ordnerstruktur für `src/app`, `src/components`, `src/core`, `src/data`, `src/lib`, `src/types`, `src/tests`, `docs/`.
- Dokumentation: `README.md`, `CHANGELOG.md`, `.env.example`, `docs/PRODUCT_STRATEGY.md`, `docs/TECHNICAL_NOTES.md`, `docs/RUN_LOG.md`.
- `.gitignore` für Next.js-Standardartefakte.

### Notes
- Pricing-Karten auf der Marketing-Seite sind aktuell statische Teaser. Die echte Produkt-Logik (Feature-Locks, `hasFeature`, Limits) folgt in Session 3.
- KI-Provider, Branchen-Presets, Themes, Mock-Daten, Dashboard und Public Sites sind in der Ordnerstruktur vorbereitet, aber bewusst noch nicht implementiert.
