/**
 * Barrel-Export des AI-Moduls.
 *
 * Verwendung:
 *   import { getAIProvider } from "@/core/ai";
 *   const provider = getAIProvider();
 *   const text = await provider.generateWebsiteCopy(input);
 */

export {
  getAIProvider,
  describeActiveProvider,
  AI_PROVIDERS,
  type ResolveProviderOptions,
} from "./ai-client";

export { mockProvider } from "./providers/mock-provider";
export { openaiProvider } from "./providers/openai-provider";
export { anthropicProvider } from "./providers/anthropic-provider";
export { geminiProvider } from "./providers/gemini-provider";
