"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  KeyRound,
  Loader2,
  MessageSquare,
  Phone,
  Send,
  Server,
  Sparkles,
  User,
} from "lucide-react";
import { mockProvider } from "@/core/ai/providers/mock-provider";
import { getPresetOrFallback } from "@/core/industries";
import {
  AI_TOKEN_STORAGE_KEY,
  callAIGenerate,
  userMessageForResult as userMessageForAIResult,
} from "@/lib/ai-client";
import {
  buildChannelSendUrl,
  channelLabel,
  substitutePlaceholders,
  toneLabel,
} from "@/lib/review-request-template";
import type { Business } from "@/types/business";
import type { AIProviderKey, ReviewRequestChannel } from "@/types/common";

/**
 * Reviews-Request-Panel (Code-Session 53, Live-Provider in 61).
 *
 * Zielgerichteter Bewertungs-Booster:
 *   1. Owner gibt Kunden-Name + Empfänger (Telefon/E-Mail) ein.
 *   2. Wählt Kanal (WhatsApp/SMS/E-Mail/Persönlich), Tonalität
 *      (Kurz/Freundlich/Follow-Up) und Provider (Mock / OpenAI /
 *      Anthropic / Gemini).
 *   3. Klick auf „Vorlagen generieren" → Mock-Provider direkt
 *      im Browser oder Live-Provider via `/api/ai/generate`
 *      mit Auth-Bearer / Cookie-Session.
 *   4. Pro Variante: Copy-Button + (außer in_person) Direkt-Send-
 *      Button mit `wa.me`/`sms:`/`mailto:`.
 *
 * Substituiert wird **nach** der KI-Generierung — der Provider
 * (egal ob Mock oder Live) liefert Templates mit `{{...}}`-
 * Platzhaltern, der User sieht die Substitution im UI live,
 * wenn er den Namen tippt.
 */

const PROVIDER_OPTIONS: readonly {
  readonly value: AIProviderKey;
  readonly label: string;
}[] = [
  { value: "mock", label: "Mock" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Gemini" },
];

interface ResolvedVariant {
  readonly channel: Channel;
  readonly tone: Tone;
  readonly body: string;
}

type Channel = ReviewRequestChannel;
type Tone = "short" | "friendly" | "follow_up";

type GenerateState =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "ready";
      variants: ReadonlyArray<{ channel: Channel; tone: Tone; body: string }>;
    }
  | { kind: "error"; message: string };

const CHANNELS: readonly Channel[] = [
  "whatsapp",
  "sms",
  "email",
  "in_person",
];
const TONES: readonly Tone[] = ["short", "friendly", "follow_up"];

export function ReviewsRequestPanel({
  business,
}: {
  readonly business: Business;
}) {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [tone, setTone] = useState<Tone>("friendly");
  const [customerName, setCustomerName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [providerKey, setProviderKey] = useState<AIProviderKey>("mock");
  const [apiToken, setApiToken] = useState("");
  const [state, setState] = useState<GenerateState>({ kind: "idle" });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Token aus localStorage hydrieren — geteilt mit AIPlayground,
  // damit der Owner ihn nur einmal eingeben muss. Privat-Modus /
  // gesperrtes localStorage → bleibt Session-only.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AI_TOKEN_STORAGE_KEY);
      if (stored) setApiToken(stored);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      if (apiToken.trim().length > 0) {
        window.localStorage.setItem(AI_TOKEN_STORAGE_KEY, apiToken.trim());
      } else {
        window.localStorage.removeItem(AI_TOKEN_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [apiToken]);

  const reviewLink = business.contact.googleReviewUrl?.trim() ?? "";
  const linkMissing = reviewLink.length === 0;

  const preset = useMemo(
    () => getPresetOrFallback(business.industryKey),
    [business.industryKey],
  );

  // Default-Recipient: bei whatsapp/sms zieh die Telefonnummer aus
  // dem Business; bei email die Mail. Solange der User noch nichts
  // getippt hat, automatisch nachpflegen.
  useEffect(() => {
    if (recipient.length > 0) return;
    if (channel === "email" && business.contact.email) {
      setRecipient(business.contact.email);
    }
    if (
      (channel === "whatsapp" || channel === "sms") &&
      business.contact.whatsapp
    ) {
      setRecipient(business.contact.whatsapp);
    } else if (
      (channel === "whatsapp" || channel === "sms") &&
      business.contact.phone
    ) {
      setRecipient(business.contact.phone);
    }
    // recipient bewusst nicht in deps — wir wollen NICHT re-triggern
    // bei jedem Tippen. eslint-disable-next-line ist hier richtig.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  async function handleGenerate() {
    setState({ kind: "loading" });
    setCopiedIdx(null);

    const input = {
      context: {
        businessName: business.name,
        industryKey: business.industryKey,
        packageTier: business.packageTier,
        language: (business.locale === "en" ? "en" : "de") as "de" | "en",
        city: business.address.city,
        toneOfVoice: [...(preset.toneOfVoice ?? [])],
        uniqueSellingPoints: [] as string[],
      },
      channel,
      tone,
      ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
      ...(reviewLink ? { reviewLink } : {}),
    };

    const finalize = (
      rawVariants: ReadonlyArray<{
        channel?: string;
        tone?: string;
        body?: string;
      }>,
    ): readonly ResolvedVariant[] =>
      rawVariants.map((v) => ({
        channel: ((v.channel as Channel | undefined) ?? channel) as Channel,
        tone: ((v.tone as Tone | undefined) ?? tone) as Tone,
        body: substitutePlaceholders(v.body ?? "", {
          customerName,
          reviewLink,
          businessName: business.name,
        }),
      }));

    if (providerKey === "mock") {
      try {
        const output = await mockProvider.generateReviewRequest(input);
        setState({ kind: "ready", variants: finalize(output.variants) });
      } catch (err) {
        setState({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Konnte keine Vorlage generieren.",
        });
      }
      return;
    }

    // Live-Provider: Aufruf via API-Route. Auth über Bearer-Token
    // (in Token-Feld eingegeben) oder die Cookie-Session des
    // eingeloggten Owners. Static-Build hat keine API-Route → 404
    // → Helper liefert `static-build`-Result, UI-Hint bittet zum
    // Mock-Switch.
    const result = await callAIGenerate({
      method: "generateReviewRequest",
      providerKey,
      input,
      apiToken,
    });
    if (result.kind === "server") {
      const output = result.output as {
        variants?: ReadonlyArray<{
          channel?: string;
          tone?: string;
          body?: string;
        }>;
      } | null;
      const variants = finalize(output?.variants ?? []);
      if (variants.length === 0) {
        setState({
          kind: "error",
          message: "Server hat keine Varianten geliefert. Bitte erneut versuchen oder Mock nutzen.",
        });
        return;
      }
      setState({ kind: "ready", variants });
      return;
    }

    setState({
      kind: "error",
      message:
        userMessageForAIResult(result) ??
        "Live-Generierung fehlgeschlagen. Bitte erneut versuchen oder Mock nutzen.",
    });
  }

  async function copyToClipboard(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(
        () => setCopiedIdx((current) => (current === idx ? null : current)),
        1500,
      );
    } catch {
      // ignore — manche Browser blockieren navigator.clipboard ohne https
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
          Bewertungs-Booster
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          Bewertungs-Anfrage erstellen
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-600">
          KI generiert Vorlagen pro Kanal und Tonalität. Platzhalter
          werden live mit deinen Werten gefüllt. Direkt versenden via
          WhatsApp, SMS oder E-Mail — oder Text kopieren und persönlich
          übergeben.
        </p>
      </header>

      {linkMissing ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          <div>
            <p className="font-semibold">Kein Bewertungs-Link hinterlegt</p>
            <p className="mt-1">
              Im Tab &bdquo;Betrieb&ldquo; &rarr; &bdquo;Kontakt&ldquo;
              &rarr; &bdquo;Google-Bewertungslink&ldquo; eintragen.
              Solange der Link fehlt, zeigt die Vorlage einen klar
              markierten Platzhalter &mdash; der Empf&auml;nger
              m&uuml;sste ihn dann h&auml;ndisch erfragen.
            </p>
          </div>
        </div>
      ) : null}

      {/* Eingaben */}
      <section className="space-y-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <ChannelTabs channel={channel} onChange={setChannel} />
        <ToneTabs tone={tone} onChange={setTone} />
        <ProviderTabs
          provider={providerKey}
          onChange={(v) => {
            setProviderKey(v);
            // Bei Wechsel auf Live: alten Idle-State behalten,
            // damit kein veraltetes Mock-Result stehen bleibt.
            if (v !== "mock" && state.kind === "ready") {
              setState({ kind: "idle" });
            }
          }}
        />
        {providerKey !== "mock" ? (
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-3">
            <label
              htmlFor="ai-api-token"
              className="mb-1 flex items-center gap-1.5 text-sm font-medium text-ink-800"
            >
              <KeyRound className="h-3.5 w-3.5 text-ink-500" aria-hidden />
              API-Token (optional)
            </label>
            <input
              id="ai-api-token"
              type="password"
              autoComplete="off"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Bearer-Token oder leer lassen (Cookie-Session reicht)"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-soft outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
              <Server className="h-3 w-3" aria-hidden />
              Live-Provider laufen über{" "}
              <code className="rounded bg-white px-1 py-0.5 text-[10.5px] text-ink-700">
                /api/ai/generate
              </code>
              . Token wird in deinem Browser gespeichert (geteilt mit
              Playground). Im Static-Export-Build (GitHub Pages)
              gibt es keine API-Route — dort bleibt nur Mock.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWithIcon
            id="customer-name"
            icon={User}
            label="Kunden-Name (optional)"
            value={customerName}
            onChange={setCustomerName}
            placeholder="z. B. Anja Schmidt"
            description="Persönliche Anrede erhöht die Antwortrate spürbar."
          />
          <FieldWithIcon
            id="recipient"
            icon={channel === "email" ? MessageSquare : Phone}
            label={
              channel === "email"
                ? "E-Mail-Empfänger"
                : channel === "in_person"
                  ? "Empfänger (informativ)"
                  : "Telefonnummer"
            }
            value={recipient}
            onChange={setRecipient}
            placeholder={
              channel === "email"
                ? "kunde@example.com"
                : "+49 176 12345678"
            }
            description={
              channel === "in_person"
                ? "Wird nicht verschickt — nur als Notiz."
                : channel === "email"
                  ? "Default kommt aus den Betriebs-Kontaktdaten."
                  : "International mit + und Vorwahl: +49 …"
            }
          />
        </div>

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={state.kind === "loading"}
          className="lp-focus-ring inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state.kind === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Generiere Vorlagen …
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden />
              Vorlagen generieren
            </>
          )}
        </button>
      </section>

      {/* Output */}
      {state.kind === "error" ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {state.message}
        </div>
      ) : null}

      {state.kind === "ready" ? (
        <ul className="space-y-4">
          {state.variants.map((variant, idx) => {
            const send = buildChannelSendUrl({
              channel: variant.channel,
              body: variant.body,
              recipient,
            });
            return (
              <li
                key={`${variant.channel}-${variant.tone}-${idx}`}
                className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                    {channelLabel(variant.channel)}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800">
                    {toneLabel(variant.tone)}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap break-words rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm text-ink-800">
                  {variant.body}
                </pre>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(variant.body, idx)}
                    className="lp-focus-ring inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                        Kopiert
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                        Text kopieren
                      </>
                    )}
                  </button>
                  {send.url ? (
                    <a
                      href={send.url}
                      target="_blank"
                      rel="noreferrer"
                      className="lp-focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden />
                      {variant.channel === "email"
                        ? "Im Mail-Client öffnen"
                        : variant.channel === "sms"
                          ? "Per SMS senden"
                          : "Per WhatsApp senden"}
                    </a>
                  ) : null}
                </div>
                {send.hint ? (
                  <p className="text-xs italic text-ink-500">{send.hint}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Komponenten
// ---------------------------------------------------------------------------

function ChannelTabs({
  channel,
  onChange,
}: {
  channel: Channel;
  onChange: (next: Channel) => void;
}) {
  return (
    <div role="tablist" aria-label="Kanal" className="flex flex-wrap gap-2">
      {CHANNELS.map((c) => {
        const active = c === channel;
        return (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c)}
            className={`lp-focus-ring rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
            }`}
          >
            {channelLabel(c)}
          </button>
        );
      })}
    </div>
  );
}

function ProviderTabs({
  provider,
  onChange,
}: {
  provider: AIProviderKey;
  onChange: (next: AIProviderKey) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Provider" className="flex flex-wrap gap-2">
      {PROVIDER_OPTIONS.map((opt) => {
        const active = opt.value === provider;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`lp-focus-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ToneTabs({
  tone,
  onChange,
}: {
  tone: Tone;
  onChange: (next: Tone) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Tonalität" className="flex flex-wrap gap-2">
      {TONES.map((t) => {
        const active = t === tone;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t)}
            className={`lp-focus-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            }`}
          >
            {toneLabel(t)}
          </button>
        );
      })}
    </div>
  );
}

function FieldWithIcon({
  id,
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  description,
}: {
  id: string;
  icon: typeof User;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  description: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 flex items-center gap-1.5 text-sm font-medium text-ink-800">
        <Icon className="h-3.5 w-3.5 text-ink-500" aria-hidden />
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
