/**
 * Business-Typen werden aus dem Zod-Schema abgeleitet, damit Schema und Typ
 * nicht auseinanderlaufen können.
 */
export type {
  Business,
  Address,
  ContactDetails,
  TeamMember,
} from "@/core/validation/business.schema";
