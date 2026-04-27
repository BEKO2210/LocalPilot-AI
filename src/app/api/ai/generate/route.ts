/**
 * API-Route für KI-Generierungen (Code-Session 28).
 *
 * POST /api/ai/generate
 * Body: { method, providerKey, input }
 *
 * Dispatched über `getAIProvider({ providerKey })` an den passenden
 * Provider (mock / openai / anthropic / gemini). Auth-Stub: einfacher
 * Bearer-Token-Check via `LP_AI_API_KEY` ENV. Echte Auth (JWT/Cookie)
 * folgt mit dem Backend-Meilenstein 4.
 *
 * **Static-Export-Hinweis**: diese Route ist POST-basiert und damit
 * nicht im `output: "export"`-Build enthaltbar. Damit unser
 * GitHub-Pages-Static-Export trotzdem grün bleibt, kommt die Route
 * über `STATIC_EXPORT=true`-Pfad in `next.config.mjs` per
 * `excludePathsFromBuild`-Trick draussen vor — siehe dort. Echte
 * Live-Calls erfordern einen SSR-Deploy (Vercel / Cloudflare Pages).
 *
 * Im Browser-Bundle landet **nichts** von hier, weil Route-Handlers
 * server-only sind. Damit bleiben API-Keys sicher serverseitig.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CustomerReplyInputSchema,
  FaqGenerationInputSchema,
  OfferCampaignInputSchema,
  ReviewRequestInputSchema,
  ServiceDescriptionInputSchema,
  SocialPostInputSchema,
  WebsiteCopyInputSchema,
} from "@/core/validation/ai.schema";
import { AI_PROVIDER_KEYS } from "@/types/common";
import { getAIProvider } from "@/core/ai";
import { AIProviderError } from "@/types/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RequestSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("generateWebsiteCopy"),
    providerKey: z.enum(AI_PROVIDER_KEYS).optional(),
    input: WebsiteCopyInputSchema,
  }),
  z.object({
    method: z.literal("improveServiceDescription"),
    providerKey: z.enum(AI_PROVIDER_KEYS).optional(),
    input: ServiceDescriptionInputSchema,
  }),
  z.object({
    method: z.literal("generateFaqs"),
    providerKey: z.enum(AI_PROVIDER_KEYS).optional(),
    input: FaqGenerationInputSchema,
  }),
  z.object({
    method: z.literal("generateCustomerReply"),
    providerKey: z.enum(AI_PROVIDER_KEYS).optional(),
    input: CustomerReplyInputSchema,
  }),
  z.object({
    method: z.literal("generateReviewRequest"),
    providerKey: z.enum(AI_PROVIDER_KEYS).optional(),
    input: ReviewRequestInputSchema,
  }),
  z.object({
    method: z.literal("generateSocialPost"),
    providerKey: z.enum(AI_PROVIDER_KEYS).optional(),
    input: SocialPostInputSchema,
  }),
  z.object({
    method: z.literal("generateOfferCampaign"),
    providerKey: z.enum(AI_PROVIDER_KEYS).optional(),
    input: OfferCampaignInputSchema,
  }),
]);

/**
 * Auth-Stub: prüft `Authorization: Bearer <token>` gegen
 * `LP_AI_API_KEY` ENV. Wenn `LP_AI_API_KEY` nicht gesetzt ist,
 * wird die Route komplett abgewiesen — verhindert versehentliche
 * Open-Endpoints in Production.
 *
 * Echtes JWT/Cookie-Auth folgt mit Meilenstein 4.
 */
function checkAuth(req: Request): { ok: true } | { ok: false; status: number; message: string } {
  const expected = process.env["LP_AI_API_KEY"]?.trim();
  if (!expected || expected.length === 0) {
    return {
      ok: false,
      status: 503,
      message:
        "API ist nicht aktiviert. Setze LP_AI_API_KEY in der Server-ENV, um die Route freizuschalten.",
    };
  }
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match || match[1]?.trim() !== expected) {
    return {
      ok: false,
      status: 401,
      message: "Ungültiger oder fehlender Bearer-Token.",
    };
  }
  return { ok: true };
}

export async function POST(req: Request): Promise<Response> {
  // 1. Auth-Stub
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "unauthorized", message: auth.message },
      { status: auth.status },
    );
  }

  // 2. Body lesen + validieren
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_input", message: "Body ist kein gültiges JSON." },
      { status: 400 },
    );
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: parsed.error.message,
      },
      { status: 400 },
    );
  }

  // 3. Provider auflösen + dispatchen
  const { method, providerKey, input } = parsed.data;
  const provider = getAIProvider(providerKey ? { providerKey } : undefined);

  try {
    let output: unknown;
    switch (method) {
      case "generateWebsiteCopy":
        output = await provider.generateWebsiteCopy(input);
        break;
      case "improveServiceDescription":
        output = await provider.improveServiceDescription(input);
        break;
      case "generateFaqs":
        output = await provider.generateFaqs(input);
        break;
      case "generateCustomerReply":
        output = await provider.generateCustomerReply(input);
        break;
      case "generateReviewRequest":
        output = await provider.generateReviewRequest(input);
        break;
      case "generateSocialPost":
        output = await provider.generateSocialPost(input);
        break;
      case "generateOfferCampaign":
        output = await provider.generateOfferCampaign(input);
        break;
    }
    return NextResponse.json({
      ok: true,
      provider: provider.key,
      method,
      output,
    });
  } catch (err) {
    if (err instanceof AIProviderError) {
      const status =
        err.code === "no_api_key" ? 503 :
        err.code === "rate_limited" ? 429 :
        err.code === "invalid_input" ? 400 :
        err.code === "provider_unavailable" ? 503 :
        500;
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status },
      );
    }
    return NextResponse.json(
      {
        error: "unknown",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

/**
 * Health-Check für SSR-Deploys. Im Static-Export wird auch das
 * unterdrückt (siehe `next.config.mjs`).
 */
export async function GET(): Promise<Response> {
  return NextResponse.json({
    ok: true,
    service: "lp-ai-generate",
    note: "POST mit Authorization: Bearer <LP_AI_API_KEY> + Body { method, providerKey?, input }",
  });
}
