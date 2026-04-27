"use client";

import { useState } from "react";
import { Check, Coins, Copy, Sparkles } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import type { GenerationResult } from "./types";

interface ResultPanelProps {
  readonly result: GenerationResult;
}

/**
 * Discriminated-Union-Renderer für die 7 Output-Typen.
 * Jeder Block bekommt einen Copy-Button; einige Methoden zeigen
 * Listen (FAQs, Review-Variants), andere zusammengesetzte Texte
 * (Hashtags, Image-Idee).
 *
 * Wenn ein API-Aufruf hinter dem Ergebnis steckt, wird zusätzlich
 * eine Cost-Zeile angezeigt (Tokens + USD + Tagesbudget).
 */
export function ResultPanel({ result }: ResultPanelProps) {
  return (
    <DashboardCard
      title="Ergebnis"
      description={
        result.cost
          ? `${result.cost.provider} / ${result.cost.model} — Kosten und Budget unten.`
          : "Aus dem Mock-Provider, deterministisch (kostenlos)."
      }
      action={<Sparkles className="h-4 w-4 text-emerald-600" aria-hidden />}
    >
      <div className="space-y-3">
        {renderBody(result)}
        {result.cost ? <CostBar cost={result.cost} /> : null}
      </div>
    </DashboardCard>
  );
}

function CostBar({
  cost,
}: {
  cost: NonNullable<GenerationResult["cost"]>;
}) {
  const pct = cost.budget.capUsd > 0
    ? Math.min(100, (cost.budget.spentUsd / cost.budget.capUsd) * 100)
    : 0;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
      <div className="flex flex-wrap items-center gap-2 font-medium">
        <Coins className="h-3.5 w-3.5" aria-hidden />
        Geschätzte Kosten: <strong>{cost.costFormatted}</strong>
        <span className="text-amber-700">
          ({cost.inputTokensEst}+{cost.outputTokensEst} Tokens, ≈ 4 Zeichen/Token)
        </span>
      </div>
      <div className="mt-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-amber-200">
          <div
            className="h-full bg-amber-600"
            style={{ width: `${pct}%` }}
            aria-label={`${pct.toFixed(0)} % Tagesbudget verbraucht`}
          />
        </div>
        <p className="mt-1 text-amber-700">
          Tagesbudget: ${cost.budget.spentUsd.toFixed(4)} von ${cost.budget.capUsd.toFixed(2)} verbraucht
          ({pct.toFixed(0)} %).
        </p>
      </div>
    </div>
  );
}

function renderBody(result: GenerationResult) {
  switch (result.method) {
    case "website-copy":
      return (
        <div className="space-y-3">
          <Field label="Hero-Titel" text={result.output.heroTitle} />
          <Field label="Hero-Untertitel" text={result.output.heroSubtitle} />
          <Field label="Über-uns-Text" text={result.output.aboutText} multiline />
        </div>
      );
    case "service-description":
      return (
        <div className="space-y-3">
          <Field
            label="Kurzversion (≤ 240 Zeichen)"
            text={result.output.shortDescription}
          />
          <Field
            label="Langversion (≤ 2000 Zeichen)"
            text={result.output.longDescription}
            multiline
          />
        </div>
      );
    case "faqs":
      return (
        <div className="space-y-3">
          {result.output.faqs.map((qa, i) => (
            <div
              key={`${i}-${qa.question}`}
              className="rounded-lg border border-ink-200 bg-white p-3"
            >
              <p className="text-sm font-semibold text-ink-900">{qa.question}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-700">
                {qa.answer}
              </p>
              <CopyButton
                text={`${qa.question}\n\n${qa.answer}`}
                label="Q&A kopieren"
                size="xs"
              />
            </div>
          ))}
        </div>
      );
    case "customer-reply":
      return (
        <div className="space-y-3">
          <Field label="Antwort" text={result.output.reply} multiline />
        </div>
      );
    case "review-request":
      return (
        <div className="space-y-3">
          {result.output.variants.map((v, i) => (
            <div
              key={`${i}-${v.tone}`}
              className="rounded-lg border border-ink-200 bg-white p-3"
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-500">
                <span className="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5">
                  {v.channel}
                </span>
                <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-brand-700">
                  {v.tone}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm text-ink-700">{v.body}</p>
              <CopyButton text={v.body} label="Variante kopieren" size="xs" />
            </div>
          ))}
        </div>
      );
    case "social-post":
      return (
        <div className="space-y-3">
          <Field label="Kurzpost (≤ 280 Zeichen)" text={result.output.shortPost} />
          <Field label="Langpost" text={result.output.longPost} multiline />
          {result.output.hashtags.length > 0 ? (
            <Field
              label={`Hashtags (${result.output.hashtags.length})`}
              text={result.output.hashtags.join(" ")}
            />
          ) : (
            <p className="text-xs italic text-ink-500">
              {`Keine Hashtags für diese Plattform (oder „Hashtags einfügen" deaktiviert).`}
            </p>
          )}
          <Field label="Bildidee" text={result.output.imageIdea} />
          <Field label="CTA" text={result.output.cta} />
        </div>
      );
    case "offer-campaign":
      return (
        <div className="space-y-3">
          <Field label="Headline" text={result.output.headline} />
          <Field label="Subline" text={result.output.subline} />
          <Field label="Body" text={result.output.bodyText} multiline />
          <Field label="CTA" text={result.output.cta} />
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Field({
  label,
  text,
  multiline,
}: {
  label: string;
  text: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
          {label}
        </p>
        <CopyButton text={text} size="xs" />
      </div>
      <p
        className={`mt-1 text-sm text-ink-900 ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function CopyButton({
  text,
  label = "Kopieren",
  size = "sm",
}: {
  text: string;
  label?: string;
  size?: "xs" | "sm";
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      // navigator.clipboard ist auf https und localhost verfügbar; auf
      // GitHub Pages https — also ok. Fallback bleibt bewusst weg.
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Stille Fallback-Lücke — selektieren + Cmd/Ctrl+C bleibt eine
      // valide Backup-Geste.
    }
  }

  const sizeClass =
    size === "xs"
      ? "mt-1 inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-0.5 text-[11px] font-medium text-ink-700 hover:bg-ink-50"
      : "inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50";

  return (
    <button type="button" onClick={handleClick} className={sizeClass}>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-600" aria-hidden />
      ) : (
        <Copy className="h-3 w-3" aria-hidden />
      )}
      {copied ? "Kopiert" : label}
    </button>
  );
}
