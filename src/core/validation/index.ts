/**
 * Barrel-Export aller Zod-Schemas.
 *
 * Verwendung in Code:
 *   import { BusinessSchema, type Business } from "@/core/validation";
 *
 * Wenn nur die Typen gewünscht sind, lieber `@/types` importieren.
 */
export * from "./common.schema";
export * from "./service.schema";
export * from "./review.schema";
export * from "./faq.schema";
export * from "./lead.schema";
export * from "./theme.schema";
export * from "./pricing.schema";
export * from "./industry.schema";
export * from "./business.schema";
export * from "./ai.schema";
