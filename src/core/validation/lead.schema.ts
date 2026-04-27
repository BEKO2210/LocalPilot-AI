import { z } from "zod";
import {
  EmailSchema,
  IdSchema,
  IsoDateSchema,
  LeadFormFieldTypeSchema,
  LeadSourceSchema,
  LeadStatusSchema,
  PhoneSchema,
} from "./common.schema";

/**
 * Definition eines branchenspezifischen Formularfelds.
 * Wird im IndustryPreset hinterlegt und im Public-Site-Formular dynamisch gerendert.
 */
export const LeadFormFieldSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z][a-zA-Z0-9_]*$/, "Bitte camelCase / snake_case verwenden"),
  label: z.string().min(2).max(120),
  type: LeadFormFieldTypeSchema,
  required: z.boolean().default(false),
  placeholder: z.string().max(120).optional(),
  helperText: z.string().max(240).optional(),
  options: z
    .array(
      z.object({
        value: z.string().min(1).max(80),
        label: z.string().min(1).max(120),
      }),
    )
    .max(50)
    .optional(),
});
export type LeadFormField = z.infer<typeof LeadFormFieldSchema>;

/**
 * Lead = Kundenanfrage. Pflichtfelder sind absichtlich knapp gehalten:
 * Name + Telefon ODER E-Mail reichen für eine erste Kontaktaufnahme.
 * Branchenspezifische Zusatzfelder landen in `extraFields`.
 */
export const LeadSchema = z
  .object({
    id: IdSchema,
    businessId: IdSchema,
    source: LeadSourceSchema.default("website_form"),
    name: z.string().min(2).max(120),
    phone: PhoneSchema.optional(),
    email: EmailSchema.optional(),
    message: z.string().max(4000).default(""),
    requestedServiceId: IdSchema.optional(),
    preferredDate: z.string().max(40).optional(),
    preferredTime: z.string().max(40).optional(),
    extraFields: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .default({}),
    status: LeadStatusSchema.default("new"),
    notes: z.string().max(4000).default(""),
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
  })
  .refine(
    (lead) => Boolean(lead.phone) || Boolean(lead.email),
    {
      message: "Telefon oder E-Mail muss angegeben sein",
      path: ["phone"],
    },
  );
export type Lead = z.infer<typeof LeadSchema>;
