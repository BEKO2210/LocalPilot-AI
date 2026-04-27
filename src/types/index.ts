/**
 * Barrel-Export der Domänentypen.
 *
 * Empfohlene Verwendung:
 *   import type { Business, Service, IndustryPreset } from "@/types";
 *
 * Für Zod-Schemas (Validierung zur Laufzeit) lieber `@/core/validation`.
 */
export * from "./common";
export type * from "./business";
export type * from "./service";
export type * from "./lead";
export type * from "./review";
export type * from "./faq";
export type * from "./industry";
export type * from "./theme";
export type * from "./pricing";
export * from "./ai";
