# Research-Index (zentrale Quellen-Bibliothek)

> Zentraler Speicher aller Recherche-Quellen, die in Code-Sessions
> verwendet wurden. Spart Tokens: zukünftige RUN_LOG-Einträge
> referenzieren hier statt Quellen erneut zu zitieren.
>
> **Pflege**: jede Session, die WebSearch macht, ergänzt am Ende
> ihrer Implementierung **neue** Quellen unten unter dem passenden
> Track. Bestehende Quellen werden **nicht** dupliziert.
>
> Format pro Eintrag: `- [Titel](URL) — kurzer Kontext (Code-Session N)`.

## Track A · AI-Provider & Strukturierte Outputs

### Rate-Limit-UX (Code-Session 30)
- [UptimeSignal – HTTP 429: How to Handle Rate Limiting (2026)](https://uptimesignal.io/http-status/429) — Standard-Headers `X-RateLimit-*` + `Retry-After` (30).
- [GetKnit – API Rate Limiting Best Practices (2026)](https://www.getknit.dev/blog/10-best-practices-for-api-rate-limiting-and-throttling) (30).
- [NousResearch hermes-agent #1826 – User-friendly 429 message](https://github.com/NousResearch/hermes-agent/issues/1826) — Countdown-Pattern (30).
- [LaoZhang – Gemini API Rate Limits 2026](https://blog.laozhang.ai/en/posts/gemini-api-rate-limits-guide) (30).

### Token-Pricing (Code-Session 29)
- [LLM API Pricing 2026: OpenAI vs Anthropic vs Gemini Live Comparison](https://www.cloudidr.com/llm-pricing) — aktueller Preisvergleich (29).
- [IntuitionLabs – AI API Pricing Comparison 2026](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude) (29).
- [Price Per Token – LLM API Pricing 2026](https://pricepertoken.com/) (29).
- [TLDL – LLM API Pricing 2026 GPT-5/Claude 4/Gemini 2.5](https://www.tldl.io/resources/llm-api-pricing-2026) (29).
- [AI Cost Check – Gemini API Pricing 2026](https://aicostcheck.com/blog/google-gemini-pricing-guide-2026) (29).
- [Metacto – Claude API Pricing 2026 Full Breakdown](https://www.metacto.com/blogs/anthropic-api-pricing-a-full-breakdown-of-costs-and-integration) (29).

### OpenAI (Code-Session 21–22)
- [OpenAI – Structured model outputs (Guides)](https://developers.openai.com/api/docs/guides/structured-outputs) — `zodResponseFormat`-Pattern, strict JSON-Schema (Code-Session 21).
- [OpenAI – Introducing Structured Outputs in the API](https://openai.com/index/introducing-structured-outputs-in-the-api/) — Hintergrund, Konzept (21).
- [OpenAI – Prompt Caching (Guides)](https://developers.openai.com/api/docs/guides/prompt-caching) — automatisches Caching ab 1024 Tokens, `prompt_cache_key` (21).
- [OpenAI – Prompt Caching 201 (Cookbook)](https://developers.openai.com/cookbook/examples/prompt_caching_201) — Static-First-Pattern (21).
- [OpenAI – How to handle rate limits (Cookbook)](https://developers.openai.com/cookbook/examples/how_to_handle_rate_limits) — 429 + exponential backoff (21).
- [OpenAI – Error codes (Guides)](https://developers.openai.com/api/docs/guides/error-codes) — APIError-Subklassen-Mapping (21).
- [TokenMix – Prompt Caching Guide 2026](https://tokenmix.ai/blog/prompt-caching-guide) — 90 % Token-Rabatt-Faustregel (21).

### Anthropic (Code-Session 24–25)
- [Anthropic – Tool use with Claude (Overview)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) — Tool-Use als Strukturierungs-Workaround (24).
- [Anthropic – Structured outputs (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) — neueres `output_config.format` (25, Migration auf Roadmap).
- [Anthropic – Prompt Caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — `cache_control: ephemeral`, 5 min TTL, 90 % Rabatt (24).
- [Anthropic – Introducing advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use) — Tool-Use-Patterns 2026 (24).
- [Markaicode – Cut Anthropic API Costs 90 % with Prompt Caching 2026](https://markaicode.com/anthropic-prompt-caching-reduce-api-costs/) (24).
- [Towards Data Science – Hands-On with Anthropic's New Structured Output](https://towardsdatascience.com/hands-on-with-anthropics-new-structured-output-capabilities/) (25).
- [Anthropic – Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) — `claude-sonnet-4-5` als Default (24).
- [Anthropic – TypeScript SDK on GitHub](https://github.com/anthropics/anthropic-sdk-typescript) (24).

### Gemini (Code-Session 26)
- [Google AI for Developers – Structured outputs (Gemini API)](https://ai.google.dev/gemini-api/docs/structured-output) — `responseJsonSchema` + `responseMimeType` (26).
- [Google Cloud – Structured output (Vertex AI)](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/control-generated-output) — `propertyOrdering`-Empfehlung (26).
- [DEV Community – How To Generate Structured Output (JSON, YAML) in Gemini AI](https://dev.to/shrsv/how-to-generate-structured-output-json-yaml-in-gemini-ai-2ok0) (26).
- [GitHub – googleapis/js-genai](https://github.com/googleapis/js-genai) — `@google/genai`-SDK (26).

## Track B · Local-Marketing & Copy-Patterns

### Mock-Provider-Recherche (Code-Sessions 14–20)
- [Smashing Magazine – Writing Hero & About Copy for Local Service Sites](https://www.smashingmagazine.com/2025/10/local-service-website-copy-patterns/) — Hero-Patterns (14).
- [Nielsen Norman – Above-the-Fold Content for Small-Business Sites](https://www.nngroup.com/articles/above-the-fold/) (14).
- [Firstep – SEO Best Practices for a Small Business (2026 Guide)](https://firstepbusiness.com/blog/seo-best-practices-for-a-small-business-2026-guide) — 250-Wort-GBP, lokale Keywords (15).
- [The Brand Hopper – Local SEO: GBP Best Practices for 2026](https://thebrandhopper.com/learning-resources/local-seo-google-business-profile-best-practices-for-2026/) (15).
- [Search Engine Land – Local SEO sprints 2026](https://searchengineland.com/local-seo-sprints-a-90-day-plan-for-service-businesses-in-2026-469059) (15).
- [Stackmatix – Structured Data AI Search: Schema Markup Guide (2026)](https://www.stackmatix.com/blog/structured-data-ai-search) — FAQ-Schema (16).
- [Zumeirah – How To Optimize FAQ Schema For AI Overviews & LLMs in 2026](https://zumeirah.com/optimize-faq-schema-for-ai-overviews/) — AEO-Patterns (16).
- [Frase.io – Are FAQ Schemas Important for AI Search, GEO & AEO?](https://www.frase.io/blog/faq-schema-ai-search-geo-aeo) (16).
- [Time To Reply – Customer Service Emails 2026](https://timetoreply.com/blog/customer-service-emails/) — Tone-Patterns (17).
- [Gladly – Tone of Voice in Customer Service](https://www.gladly.ai/blog/customer-service-tone-tips/) (17).
- [Greenmoov – Best Review Request Message Templates for 2026](https://greenmoov.app/articles/en/best-review-request-message-templates-for-2026-50-free-examples-to-boost-your-ratings) — Channel-Conversion-Daten (18).
- [Wiserreview – 20 Review Request Message Templates](https://wiserreview.com/blog/review-request-message/) (18).
- [Born Social – Best Hashtags for Instagram Growth in 2026](https://www.bornsocial.co/post/best-hashtags-for-business-growth) — IG 3–5 Hashtags (19).
- [Borala Agency – Hashtag Strategies for 2026](https://www.boralagency.com/hashtags-strategies/) (19).
- [SocialRails – Best LinkedIn Hashtags 2026](https://socialrails.com/blog/best-hashtags-for-linkedin) (19).
- [LocaliQ – Limited-Time Offers: Tips, Templates & Examples](https://localiq.com/blog/limited-time-offers/) — Echte Knappheit, klare Deadline (20).
- [Engagelab – How to Leverage the Power of the LTO Strategy](https://www.engagelab.com/blog/limited-time-offers) (20).

## Track C · Methodik & DX

- [Sitepoint – AI Agent Testing Automation: Developer Workflows for 2026](https://www.sitepoint.com/ai-agent-testing-automation-developer-workflows-for-2026/) — Test-Automation-Trends (16).
- [CopilotKit/llmock – Deterministic mock LLM server](https://github.com/CopilotKit/llmock) — Mock-Pattern (14, 16).
- [LangChain – FakeListLLM & Deterministic Test Doubles](https://python.langchain.com/docs/integrations/llms/fake) (14).
- [DeepEval – Building Deterministic Eval Cases for LLM Apps](https://www.deepeval.com/blog/deterministic-evals-for-llm-apps) (14).
- [DEV Community – MockLLM, a simulated LLM API for testing](https://dev.to/lukehinds/mockllm-a-simulated-large-language-model-api-for-development-and-testing-2d53) (14).
- [Inogic – CRM Data Deduplication: 2026 FAQ Guide](https://www.inogic.com/blog/2026/02/beyond-deduplication-a-2026-faq-guide-to-clean-unified-ai-ready-crm-data/) — Fuzzy-Matching für Dedupe (16).
- [Latitude – Template Syntax Basics for LLM Prompts](https://latitude.so/blog/template-syntax-basics-for-llm-prompts) (22).
- [Karen Boyd, PhD – Simple prompt templates for better LLM results](https://drkarenboyd.com/blog/simple-prompt-templates-for-better-llm-results-today) (22).
- [Smashing Magazine – Building Dynamic Forms In React And Next.js](https://www.smashingmagazine.com/2026/03/building-dynamic-forms-react-next-js/) — schema-driven UI Pattern (27).
- [Formisch – Choosing a React Form Library in 2026](https://formisch.dev/blog/react-form-library-comparison/) — Discriminated Unions in Forms (27).
- [Next.js – Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports) — `pageExtensions`-Filter (28).
- [Next.js – API Routes in Static Export Warning](https://nextjs.org/docs/messages/api-routes-static-export) (28).
- [Next.js – Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) (28).

## Track D · Security & Sanitization

### Sanitization & Prompt-Injection (Code-Session 31)
- [DOMPurify (cure53)](https://github.com/cure53/DOMPurify) — XSS-Sanitizer für HTML/SVG/MathML mit Whitelist-Modus (31).
- [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify) — Server+Client-Wrapper über DOMPurify, Vorbedingung für HTML-Render-Pfad (31).
- [CVE-2026-25802 – Prompt Injection to Stored XSS](https://cvereports.com/reports/CVE-2026-25802) — Real-World-Beleg, dass LLM-Output unsanitiert in `dangerouslySetInnerHTML` reicht (31).
- [Focused.io – LLM Output Sanitization (OWASP LLM05)](https://focused.io/lab/improper-ai-output-handling---owasp-llm05) — OWASP-LLM-Top-10-Kontext (31).
- [PkgPulse – sanitize-html vs DOMPurify vs xss 2026](https://www.pkgpulse.com/guides/sanitize-html-vs-dompurify-vs-xss-xss-prevention-2026) — Library-Vergleich (31).
- [Medium / Piotr Korowicki – Dynamic HTML Injection in Next.js](https://medium.com/@piotrkorowicki/dynamic-html-injection-and-sanitization-in-next-js-applications-3e336caa2e6f) (31).

---

> **Hinweis**: Wenn ein Eintrag in mehreren Sessions verwendet wird,
> stehen alle Session-Nummern in Klammern hinten. Neue Sessions
> ergänzen unten oder im passenden Track.
