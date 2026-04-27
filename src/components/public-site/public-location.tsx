import { ArrowUpRight, MapPin } from "lucide-react";
import { PublicSection } from "./public-section";
import type { Address, ContactDetails } from "@/types/business";

type PublicLocationProps = {
  address: Address;
  contact: ContactDetails;
};

export function PublicLocation({ address, contact }: PublicLocationProps) {
  return (
    <PublicSection id="standort" eyebrow="Standort" title="So finden Sie uns.">
      <div
        className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-theme-card border p-6 text-center"
        style={{
          borderColor: "rgb(var(--theme-border))",
          backgroundColor: "rgb(var(--theme-background))",
        }}
      >
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-theme-button"
          style={{
            backgroundColor: "rgb(var(--theme-primary) / 0.12)",
            color: "rgb(var(--theme-primary))",
          }}
        >
          <MapPin className="h-5 w-5" aria-hidden />
        </span>
        <address className="not-italic">
          <p className="font-medium">{address.street}</p>
          <p style={{ color: "rgb(var(--theme-muted-fg))" }}>
            {address.postalCode} {address.city}
          </p>
        </address>

        {contact.googleMapsUrl && (
          <a
            href={contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-theme-button border px-4 py-2 text-sm font-medium"
            style={{
              borderColor: "rgb(var(--theme-border))",
              color: "rgb(var(--theme-foreground))",
            }}
          >
            Auf Google Maps öffnen
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
    </PublicSection>
  );
}
