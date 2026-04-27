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

## Track D · Security & Sanitization / Compliance

### generateStaticParams + dynamicParams (Code-Session 47)
- [Next.js – generateStaticParams Functions Reference](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) — partielles Prerendern, Memoization (47).
- [Next.js – Dynamic Routes (file-conventions)](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) — `dynamicParams=true`-Default-Verhalten (47).
- [Next.js Discussion #81155 – dynamicParams not working with Next 15/16](https://github.com/vercel/next.js/discussions/81155) — Caveats bei Cache-Components (47).
- [Next.js – Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports) — Pflicht-Slug-Liste fürs Static-Export (47).
- [Next.js – Empty generateStaticParams with Cache Components](https://nextjs.org/docs/messages/empty-generate-static-params) — leere Arrays brechen den Build (47).

### Supabase-js v2 FK-Embed Type-Inferenz (Code-Session 46)
- [Supabase Docs – Querying Joins and Nested tables](https://supabase.com/docs/guides/database/joins-and-nesting) — `!inner`-Modifier, Single-vs-Array-Verhalten je FK-Richtung (46).
- [Supabase JS API – select](https://supabase.com/docs/reference/javascript/select) — Embed-Syntax, conservative Array-Typing-Default (46).
- [Supabase Discussion #6550 – Inner join from public table](https://github.com/orgs/supabase/discussions/6550) — many-to-one liefert single object, SDK typisiert konservativ als Array (46).
- [Supabase Troubleshooting – RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — Index-Empfehlungen für `auth.uid() = user_id`-Policies (46).

### Service-Role + Onboarding-Pattern (Code-Session 45)
- [Supabase Discussion #30739 – Using Service Role with Supabase in Next.js Backend](https://github.com/orgs/supabase/discussions/30739) — Server-only, persistSession off, Sicherheitsbetrachtung (45).
- [Adrian Murage – How to Use the Supabase Service Role Secret Key in Next.js Routes](https://adrianmurage.com/posts/supabase-service-role-secret-key/) — `server-only`-Import-Pattern (45).
- [Dev.to – Multi-Tenant SaaS Auth + Billing with Supabase RLS](https://dev.to/diven_rastdus_c5af27d68f3/how-i-built-multi-tenant-saas-auth-billing-with-supabase-rls-and-stripe-connect-3h08) — Onboarding-Sequenz Owner→Tenant (45).
- [Supabase Discussion #3919 – Service Role Key in createClient](https://github.com/orgs/supabase/discussions/3919) — Konfig-Optionen für Server-Client (45).

### Form-Submit + Offline-Fallback (Code-Session 44)
- [Next.js Discussion #82498 – Building an Offline-First Next.js 15 App](https://github.com/vercel/next.js/discussions/82498) — Pattern-Diskussion, Service-Worker vs. localStorage-Backup (44).
- [Next.js Components – Form](https://nextjs.org/docs/app/api-reference/components/form) — Progressive-Enhancement-Form (44).
- [Next.js Discussion #73329 – Offline Fallback Handler](https://github.com/vercel/next.js/discussions/73329) — Custom-Service-Worker-Strategien (44).
- [Next.js Discussion #60292 – Server Actions + Form Reset](https://github.com/vercel/next.js/discussions/60292) — Reset-Pattern bei Server-Action-Submits (44).

### Magic-Link UX + a11y (Code-Session 43)
- [Scalekit – Magic Link login in Next.js 15](https://www.scalekit.com/blog/passwordless-authentication-next-js) — Status-Feedback-Patterns (43).
- [Next.js – Architecture: Accessibility](https://nextjs.org/docs/architecture/accessibility) — `aria-live`, `aria-atomic` Empfehlungen (43).
- [Next.js Learn – App Router: Improving Accessibility](https://nextjs.org/learn/dashboard-app/improving-accessibility) — Status-Region-Pattern für Forms (43).
- [Vercel Engineering – Improving the accessibility of our Next.js site](https://vercel.com/blog/improving-the-accessibility-of-our-nextjs-site) — Vercel-eigene a11y-Lessons-Learned (43).

### @supabase/ssr + Next.js 15 Magic-Link (Code-Session 42)
- [Supabase Docs – Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — `createServerClient` + `createBrowserClient`-Pattern (42).
- [Supabase Docs – Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — Cookie-Handler, `getUser()` statt `getSession()` (42).
- [Supabase Docs – Server-Side Auth Advanced Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide) — PKCE-Flow, Token-Refresh in Middleware (42).
- [Akos Komuves – Magic-Link Sign-In with Next.js + Supabase](https://akoskm.com/how-to-build-a-simple-magic-link-sign-in-with-nextjs-supabase-and-sendgrid/) — `signInWithOtp` + Callback-Pattern (42).
- [Ryan Katayi – Server-Side Auth Setup](https://www.ryankatayi.com/blog/server-side-auth-in-next-js-with-supabase-my-setup) — Production-Setup-Beispiel (42).

### Supabase Multi-Tenant-Owner + Helper-Functions (Code-Session 41)
- [Supabase Docs – RLS auth.uid() & auth.jwt()](https://supabase.com/docs/guides/database/postgres/row-level-security) — Built-in JWT-Helper (41).
- [Supabase Docs – AI Prompt: Database RLS Policies](https://supabase.com/docs/guides/getting-started/ai-prompts/database-rls-policies) — Idiomatische Policy-Vorlagen (41).
- [Medium / JigsDev – Supabase RLS Explained With Real Examples](https://medium.com/@jigsz6391/supabase-row-level-security-explained-with-real-examples-6d06ce8d221c) — Owner-Junction-Pattern (41).
- [Dev.to – Mastering Supabase RLS as a Beginner](https://dev.to/asheeshh/mastering-supabase-rls-row-level-security-as-a-beginner-5175) — security-definer Helper-Functions (41).
- [Dev.to – LockIn Multi-Tenant Architecture mit Supabase RLS](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2) — Performance-Hinweise + Recursion-Vermeidung (41).

### Supabase Insert + RLS-Falle (Code-Session 40)
- [Supabase Issue #35368 – RLS Check Failing on INSERT Despite WITH CHECK true](https://github.com/supabase/supabase/issues/35368) — implizites SELECT nach INSERT erfordert SELECT-Policy (40).
- [Supabase Discussion #36619 – RLS Check Failing on INSERT](https://github.com/orgs/supabase/discussions/36619) — Workaround `returning: 'minimal'` bzw. ID client-side (40).
- [Bytebase – Postgres Error 23514 CHECK constraint violation](https://www.bytebase.com/reference/postgres/error/23514-check-constraint-violation/) — SQLSTATE-Mapping (40).
- [drdroid.io – Postgres 23502 NOT NULL violation](https://drdroid.io/stack-diagnosis/supabase-database-not-null-violation-error-when-trying-to-insert-a-null-value-into-a-column-with-a-not-null-constraint) — Error-Code-Tabellen (40).
- [Niko Fischer – „new row violates RLS policy" Workaround](https://nikofischer.com/supabase-error-row-level-security-policy) — Real-World-Beispiel (40).

### DSGVO Consent-Audit-Trail in Postgres (Code-Session 39)
- [Postgres Audit Logging Guide (Bytebase)](https://www.bytebase.com/blog/postgres-audit-logging/) — Audit-Tabellen-Schemata, JSONB-Pattern (39).
- [Audit logging using JSONB in Postgres (Elephas)](https://elephas.io/audit-logging-using-jsonb-in-postgres/) — Schema-änderungs-freier Audit-Pfad (39).
- [pgMemento – Audit trail with schema versioning for PostgreSQL](https://github.com/pgMemento/pgMemento) — Versionierungs-Idee als Inspiration (39).
- [PostgreSQL Compliance: GDPR, SOC 2, Data Privacy & Security (EnterpriseDB)](https://www.enterprisedb.com/postgresql-compliance-gdpr-soc-2-data-privacy-security) — DSGVO-Mapping auf Postgres-Features (39).

### Supabase FK-Embedding / nested select (Code-Session 38)
- [Supabase Docs – Querying Joins and Nested Tables](https://supabase.com/docs/guides/database/joins-and-nesting) — `select=*, services(*)`-Pattern (38).
- [Supabase Docs – JavaScript API: select](https://supabase.com/docs/reference/javascript/select) — Embed-Syntax + RLS-Verhalten pro Embed (38).
- [Supabase Discussion #4680 – joining on a foreign key](https://github.com/orgs/supabase/discussions/4680) — Best-practice für Two-Hop-Joins (38).
- [postgrest-js #197 – !inner für Filter über Embed](https://github.com/supabase/postgrest-js/issues/197) — Inner-Join-Modifier (38).

### Supabase Multi-Tenant-Schema + RLS (Code-Session 37)
- [Supabase Docs – Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — Pflicht-Aktivierung pro Tabelle (37).
- [Supabase – Authorization via Row Level Security](https://supabase.com/features/row-level-security) — Pattern-Referenz (37).
- [MakerKit – Supabase RLS Best Practices 2026](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — Production-Patterns + Performance-Tipps (37).
- [DesignRevision – Supabase RLS Guide: Policies That Actually Work](https://designrevision.com/blog/supabase-row-level-security) — Häufige Fallen (37).
- [AntStack – Multi-Tenant Applications with RLS on Supabase](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/) — `tenant_id`-Spalte + Policy-Setup (37).
- [Logto – Multi-tenancy implementation with PostgreSQL](https://blog.logto.io/implement-multi-tenancy) — Schema-vs-Row-basiert (37).

### § 5 DDG / Impressum-Pflichtangaben (Code-Session 36)
- [IHK Chemnitz – Impressumspflicht (TMG/DDG)](https://www.ihk.de/chemnitz/recht-und-steuern/rechtsinformationen/internetrecht/pflichtangaben-im-internet-die-impressumspflicht-4401580) — Pflichtfelder + Zwei-Klick-Vorgabe (36).
- [Rickert.law – Impressumspflicht nach § 5 TMG](https://rickert.law/impressumspflicht-nach-%C2%A7-5-tmg/) — Übergang TMG→DDG zum 14.05.2024 (36).
- [it-recht-kanzlei.de – Impressum nach TMG/DDG](https://www.it-recht-kanzlei.de/Thema/impressum-tmg.html) — Mustertexte + Sonderfälle (36).
- [firma.de – Impressum Einzelunternehmen (Muster PDF)](https://www.firma.de/firmengruendung/impressum-einzelunternehmen-sollten-auf-diese-angaben-achten-mit-muster-pdf/) — Pflichtangaben für Einzelunternehmer (36).
- [Proliance – Impressum nach TMG: Was Website-Betreiber beachten müssen](https://www.proliance.ai/blog/impressum-nach-tmg-das-mussen-website-betreiber-beachten) (36).

### Supabase-Health-Patterns (Code-Session 35)
- [Supabase – Use Supabase with Next.js (Quickstart)](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — `@supabase/ssr` + `@supabase/supabase-js` (35).
- [Supabase – Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — Server Component / Route Handler Pattern (35).
- [Supabase Discussion #21908 – How can I ping the database?](https://github.com/orgs/supabase/discussions/21908) — Lightweight Health-Check via REST-Endpoint (35).
- [Supabase Docs – Database Timeouts](https://supabase.com/docs/guides/database/postgres/timeouts) — 60s max-Query-Timeout (35).
- [Supabase Status](https://status.supabase.com) — externe Status-Quelle für Cross-Check (35).

### Vercel-Deployment (Code-Session 34)
- [Vercel – Next.js on Vercel (Framework Docs)](https://vercel.com/docs/frameworks/full-stack/nextjs) (34).
- [Vercel – Configuring a Build](https://vercel.com/docs/builds/configure-a-build) (34).
- [Vercel – Project Configuration](https://vercel.com/docs/project-configuration) (34).
- [Vercel – Configuring Regions for Functions](https://vercel.com/docs/functions/configuring-functions/region) (34).
- [Vercel – Environment Variables](https://vercel.com/docs/environment-variables) (34).
- [Vercel – Sensitive Environment Variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables) (34).

### Cookie/JWT-Auth (Code-Session 33)
- [Next.js – Authentication Guide (Cookies, Sessions)](https://nextjs.org/docs/app/guides/authentication) (33).
- [Wisp CMS – HttpOnly-Cookie-JWT-Auth-Best-Practices](https://www.wisp.blog/blog/ultimate-guide-to-securing-jwt-authentication-with-httponly-cookies) (33).
- [Authgear – Next.js Session Management 2026](https://www.authgear.com/post/nextjs-session-management) (33).
- [Wisp – Robust Cookie Management for Next.js](https://www.wisp.blog/blog/implementing-robust-cookie-management-for-nextjs-applications) (33).
- [Max Schmitt – Next.js HTTP-Only Cookies for Secure Auth](https://maxschmitt.me/posts/next-js-http-only-cookie-auth-tokens) (33).
- [Leapcell Medium – JWT Middleware in Next.js](https://leapcell.medium.com/implementing-jwt-middleware-in-next-js-a-complete-guide-to-auth-300d9c7fcae2) (33).



### DSGVO / Lead-Einwilligung (Code-Session 32)
- [LeadGenApp – DSGVO-Formular: Einholung der Einwilligung mit Online-Formularen](https://leadgenapp.io/de/DSGVO-Formular/) — Aktiver Opt-In (32).
- [LeadScraper – Lead Generierung DSGVO-konform 2026 + Checkliste](https://www.leadscraper.de/blog/lead-generieren-dsgvo) — Storage-Duration + Pflichtangaben (32).
- [CMS Hasche Sigle – EuGH: Einwilligung muss aktiv erklärt werden](https://www.cmshs-bloggt.de/tmc/datenschutzrecht/dsgvo-einwilligung-checkbox-erklarung/) — Cookie-Pre-Check verboten (32).
- [Webcellent – DSGVO-Datenschutz-Checkbox-Pflicht für Kontaktformulare](https://www.webcellent.com/blog/eu-dsgvo-datenschutz-checkbox-pflicht-fuer-kontaktformulare/) (32).
- [datenschutz-janolaw – Freiwillige Einwilligung mit Checkbox](https://www.datenschutz-janolaw.de/info-faq/informationen/dsgvo/einwilligung.html) (32).
- [it-daily – 6 Tipps für datenschutzkonforme Lead-Generierung](https://www.it-daily.net/it-sicherheit/datenschutz-grc/6-tipps-fuer-die-datenschutzkonforme-lead-generierung) (32).



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
