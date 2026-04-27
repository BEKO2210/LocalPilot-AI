"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Hash,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { mockProvider } from "@/core/ai/providers/mock-provider";
import { getPresetOrFallback } from "@/core/industries";
import {
  adviseHashtagCount,
  assessLength,
  composeFinalPost,
  goalLabel,
  lengthLabel,
  platformLabel,
  platformLimits,
  type LengthAssessment,
} from "@/lib/social-post-format";
import type { Business } from "@/types/business";
import type {
  PostLength,
  SocialPlatform,
  SocialPostGoal,
} from "@/types/common";
import type { SocialPostOutput } from "@/types/ai";

/**
 * Social-Post-Panel (Code-Session 54).
 *
 * Symmetrisch zum Reviews-Panel aus Session 53:
 *   - Plattform-Tabs (5: Instagram / Facebook / GBP / LinkedIn /
 *     WhatsApp-Status).
 *   - Goal-Pills (8 Goals).
 *   - Length-Toggle (Kurz / Mittel / Lang).
 *   - Topic-Input + Hashtags-On/Off.
 *   - Mock-Provider liefert: shortPost, longPost, hashtags,
 *     imageIdea, cta — alles mit eigenem Copy-Button.
 *   - Plattform-spezifische Char-Counter mit Truncation-Warnung
 *     und Hashtag-Empfehlungs-Status.
 *
 * Direkt-Posten zu Buffer/Hootsuite/Meta-Graph kommt in einer
 * späteren Session (Plan-Item).
 */

const PLATFORMS: readonly SocialPlatform[] = [
  "instagram",
  "facebook",
  "google_business",
  "linkedin",
  "whatsapp_status",
];
const GOALS: readonly SocialPostGoal[] = [
  "more_appointments",
  "promote_offer",
  "new_service",
  "collect_review",
  "seasonal",
  "before_after",
  "trust_building",
  "team_intro",
];
const LENGTHS: readonly PostLength[] = ["short", "medium", "long"];

type GenState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; output: SocialPostOutput }
  | { kind: "error"; message: string };

export function SocialPostPanel({
  business,
}: {
  readonly business: Business;
}) {
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [goal, setGoal] = useState<SocialPostGoal>("more_appointments");
  const [length, setLength] = useState<PostLength>("medium");
  const [topic, setTopic] = useState("");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [state, setState] = useState<GenState>({ kind: "idle" });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const preset = useMemo(
    () => getPresetOrFallback(business.industryKey),
    [business.industryKey],
  );

  // Default-Topic-Vorschlag aus Goal × Branche.
  const topicPlaceholder = `z. B. "Heute spontan Termine frei" oder "Neue Behandlung — was bringt sie?"`;

  async function handleGenerate() {
    if (topic.trim().length === 0) {
      setState({
        kind: "error",
        message: "Bitte ein Thema/Stichwort für den Post eintragen.",
      });
      return;
    }
    setState({ kind: "loading" });
    setCopiedKey(null);
    try {
      const output = await mockProvider.generateSocialPost({
        context: {
          businessName: business.name,
          industryKey: business.industryKey,
          packageTier: business.packageTier,
          language: business.locale === "en" ? "en" : "de",
          city: business.address.city,
          toneOfVoice: preset.toneOfVoice ?? [],
          uniqueSellingPoints: [],
        },
        platform,
        goal,
        topic: topic.trim(),
        length,
        includeHashtags,
      });
      setState({ kind: "ready", output });
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Konnte keinen Post generieren.",
      });
    }
  }

  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(
        () => setCopiedKey((c) => (c === key ? null : c)),
        1500,
      );
    } catch {
      /* ignore */
    }
  }

  const limits = platformLimits(platform);
  const hashtagAdvice = adviseHashtagCount(
    state.kind === "ready" ? state.output.hashtags.length : 0,
    platform,
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
          Social-Media-Generator
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          Post erstellen
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-600">
          Plattform, Ziel und Tonalit&auml;t w&auml;hlen, kurz das Thema
          eintragen &mdash; KI liefert kurzen Post, langen Post,
          Hashtags, Bildidee und CTA. Direkt-Posten zu Buffer / Meta /
          Hootsuite folgt in einer sp&auml;teren Session.
        </p>
      </header>

      {/* Eingaben */}
      <section className="space-y-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <PlatformTabs platform={platform} onChange={setPlatform} />
        <GoalPills goal={goal} onChange={setGoal} />

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field
            id="social-topic"
            label="Thema / Stichwort"
            value={topic}
            onChange={setTopic}
            placeholder={topicPlaceholder}
            description="Kurz und konkret. Was soll im Mittelpunkt stehen?"
          />
          <LengthPicker length={length} onChange={setLength} />
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeHashtags}
            onChange={(e) => setIncludeHashtags(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
          />
          <span className="text-ink-700">
            Hashtags vorschlagen (Empfehlung pro Plattform: <strong>{limits.recommendedHashtags.low}&ndash;{limits.recommendedHashtags.high}</strong>)
          </span>
        </label>

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={state.kind === "loading"}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state.kind === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Generiere Post &hellip;
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden />
              Post generieren
            </>
          )}
        </button>
      </section>

      {/* Output */}
      {state.kind === "error" ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {state.message}
        </div>
      ) : null}

      {state.kind === "ready" ? (
        <div className="space-y-4">
          {/* Kurzer Post */}
          <PostCard
            title="Kurzer Post"
            body={composeFinalPost({
              body: state.output.shortPost,
              hashtags: state.output.hashtags,
              includeHashtags,
            })}
            assessment={assessLength(
              composeFinalPost({
                body: state.output.shortPost,
                hashtags: state.output.hashtags,
                includeHashtags,
              }),
              platform,
            )}
            copyKey="short"
            copiedKey={copiedKey}
            onCopy={(t, k) => void copyToClipboard(t, k)}
          />

          {/* Langer Post */}
          <PostCard
            title="Langer Post"
            body={composeFinalPost({
              body: state.output.longPost,
              hashtags: state.output.hashtags,
              includeHashtags,
            })}
            assessment={assessLength(
              composeFinalPost({
                body: state.output.longPost,
                hashtags: state.output.hashtags,
                includeHashtags,
              }),
              platform,
            )}
            copyKey="long"
            copiedKey={copiedKey}
            onCopy={(t, k) => void copyToClipboard(t, k)}
          />

          {/* Hashtags */}
          {state.output.hashtags.length > 0 ? (
            <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-ink-500" aria-hidden />
                <h3 className="text-sm font-semibold text-ink-900">
                  Hashtags ({state.output.hashtags.length})
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    void copyToClipboard(state.output.hashtags.join(" "), "hashtags")
                  }
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
                >
                  {copiedKey === "hashtags" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Kopiert
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden /> Kopieren
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 break-words text-sm text-ink-700">
                {state.output.hashtags.join(" ")}
              </p>
              <p
                className={`mt-2 text-xs ${
                  hashtagAdvice.status === "ok"
                    ? "text-emerald-700"
                    : hashtagAdvice.status === "discouraged"
                      ? "text-amber-700"
                      : "text-amber-700"
                }`}
              >
                {hashtagAdvice.hint}
              </p>
            </div>
          ) : null}

          {/* Bildidee */}
          <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-ink-500" aria-hidden />
              <h3 className="text-sm font-semibold text-ink-900">Bildidee</h3>
              <button
                type="button"
                onClick={() => void copyToClipboard(state.output.imageIdea, "image")}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                {copiedKey === "image" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Kopiert
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Kopieren
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-700">{state.output.imageIdea}</p>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-ink-500" aria-hidden />
              <h3 className="text-sm font-semibold text-ink-900">Call-to-Action</h3>
              <button
                type="button"
                onClick={() => void copyToClipboard(state.output.cta, "cta")}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                {copiedKey === "cta" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Kopiert
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Kopieren
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-700">{state.output.cta}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Komponenten
// ---------------------------------------------------------------------------

function PlatformTabs({
  platform,
  onChange,
}: {
  platform: SocialPlatform;
  onChange: (next: SocialPlatform) => void;
}) {
  return (
    <div role="tablist" aria-label="Plattform" className="flex flex-wrap gap-2">
      {PLATFORMS.map((p) => {
        const active = p === platform;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
            }`}
          >
            {platformLabel(p)}
          </button>
        );
      })}
    </div>
  );
}

function GoalPills({
  goal,
  onChange,
}: {
  goal: SocialPostGoal;
  onChange: (next: SocialPostGoal) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Ziel" className="flex flex-wrap gap-2">
      {GOALS.map((g) => {
        const active = g === goal;
        return (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(g)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            }`}
          >
            {goalLabel(g)}
          </button>
        );
      })}
    </div>
  );
}

function LengthPicker({
  length,
  onChange,
}: {
  length: PostLength;
  onChange: (next: PostLength) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-ink-800">Länge</p>
      <div role="radiogroup" aria-label="Länge" className="flex gap-2">
        {LENGTHS.map((l) => {
          const active = l === length;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(l)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
              }`}
            >
              {lengthLabel(l)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  description,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  description: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink-800">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-soft outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
      <p className="mt-1 text-xs text-ink-500">{description}</p>
    </div>
  );
}

function PostCard({
  title,
  body,
  assessment,
  copyKey,
  copiedKey,
  onCopy,
}: {
  title: string;
  body: string;
  assessment: LengthAssessment;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const statusColor =
    assessment.status === "ok"
      ? "text-emerald-700"
      : assessment.status === "truncated"
        ? "text-amber-700"
        : "text-rose-700";
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        <span className={`text-xs font-medium ${statusColor}`}>
          {assessment.chars}{" "}
          {assessment.chars === 1 ? "Zeichen" : "Zeichen"}
        </span>
        <button
          type="button"
          onClick={() => onCopy(body, copyKey)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
        >
          {copiedKey === copyKey ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Kopiert
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden /> Kopieren
            </>
          )}
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm text-ink-800">
        {body}
      </pre>
      <p className={`mt-2 inline-flex items-start gap-1.5 text-xs ${statusColor}`}>
        {assessment.status !== "ok" ? (
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
        ) : null}
        {assessment.hint}
      </p>
    </article>
  );
}
