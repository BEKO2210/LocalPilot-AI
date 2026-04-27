import { z } from "zod";
import {
  IdSchema,
  IsoDateSchema,
  ReviewSourceSchema,
} from "./common.schema";

export const ReviewSchema = z.object({
  id: IdSchema,
  businessId: IdSchema,
  authorName: z.string().min(2).max(80),
  rating: z
    .number()
    .int("Sterne als ganze Zahlen 1–5")
    .min(1, "Mindestens 1 Stern")
    .max(5, "Maximal 5 Sterne"),
  text: z.string().min(1).max(2000),
  source: ReviewSourceSchema.default("internal"),
  createdAt: IsoDateSchema,
  isPublished: z.boolean().default(true),
});
export type Review = z.infer<typeof ReviewSchema>;
