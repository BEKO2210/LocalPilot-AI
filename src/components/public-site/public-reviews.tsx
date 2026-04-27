import { Star } from "lucide-react";
import { PublicSection } from "./public-section";
import type { Review } from "@/types/review";

type PublicReviewsProps = {
  reviews: readonly Review[];
  averageRating: number;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          aria-hidden
          style={{
            color:
              i < rating
                ? "rgb(var(--theme-accent))"
                : "rgb(var(--theme-border))",
            fill:
              i < rating
                ? "rgb(var(--theme-accent))"
                : "transparent",
          }}
        />
      ))}
    </div>
  );
}

const FORMATTER = new Intl.DateTimeFormat("de-DE", {
  year: "numeric",
  month: "long",
});

function formatDate(iso: string): string {
  try {
    return FORMATTER.format(new Date(iso));
  } catch {
    return "";
  }
}

export function PublicReviews({ reviews, averageRating }: PublicReviewsProps) {
  const visible = reviews.filter((r) => r.isPublished);
  if (visible.length === 0) return null;

  return (
    <PublicSection
      id="bewertungen"
      eyebrow="Bewertungen"
      title={`${averageRating.toFixed(1)} von 5 · ${visible.length} Stimmen`}
      intro="Echte Rückmeldungen unserer Kundinnen und Kunden."
      surface="muted"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {visible.slice(0, 6).map((review) => (
          <article
            key={review.id}
            className="rounded-theme-card border p-5"
            style={{
              borderColor: "rgb(var(--theme-border))",
              backgroundColor: "rgb(var(--theme-background))",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <StarRow rating={review.rating} />
              <span
                className="text-xs"
                style={{ color: "rgb(var(--theme-muted-fg))" }}
              >
                {formatDate(review.createdAt)}
              </span>
            </div>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "rgb(var(--theme-foreground))" }}
            >
              {`„${review.text}"`}
            </p>
            <p
              className="mt-3 text-xs"
              style={{ color: "rgb(var(--theme-muted-fg))" }}
            >
              {review.authorName}
              {review.source && review.source !== "internal" ? ` · via ${review.source}` : null}
            </p>
          </article>
        ))}
      </div>
    </PublicSection>
  );
}
