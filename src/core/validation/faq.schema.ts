import { z } from "zod";
import { IdSchema } from "./common.schema";

export const FAQSchema = z.object({
  id: IdSchema,
  question: z.string().min(3).max(240),
  answer: z.string().min(1).max(2000),
  category: z.string().max(80).optional(),
  sortOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});
export type FAQ = z.infer<typeof FAQSchema>;
