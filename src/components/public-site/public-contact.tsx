import { Mail, MessageCircle, Phone } from "lucide-react";
import { PublicSection } from "./public-section";
import { PublicLeadForm } from "./public-lead-form";
import {
  formatPhoneDisplay,
  mailtoLink,
  telLink,
  whatsappLink,
} from "@/lib/contact-links";
import type { Business } from "@/types/business";
import type { LeadFormField } from "@/types/lead";

type PublicContactProps = {
  business: Business;
  leadFormFields: readonly LeadFormField[];
};

/**
 * Kontakt-Sektion mit funktionierenden Direkt-Links und einer
 * Vorschau des branchenspezifischen Anfrageformulars.
 *
 * Die echte Formular-Submission folgt in Session 12 (Lead-System) –
 * heute sind die Felder optisch da, aber `disabled`. Die direkten
 * Kontaktwege (Telefon, WhatsApp, E-Mail) funktionieren.
 */
export function PublicContact({ business, leadFormFields }: PublicContactProps) {
  const phone = business.contact.phone;
  const whatsapp = business.contact.whatsapp;
  const email = business.contact.email;

  return (
    <PublicSection
      id="kontakt"
      eyebrow="Kontakt"
      title="Schreiben oder anrufen."
      intro="Sie erreichen uns über die Wege, die Ihnen am liebsten sind."
      surface="muted"
    >
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        {/* Direktkontakt */}
        <div
          className="rounded-theme-card border p-6"
          style={{
            borderColor: "rgb(var(--theme-border))",
            backgroundColor: "rgb(var(--theme-background))",
          }}
        >
          <h3 className="lp-theme-heading text-lg">Direktkontakt</h3>
          <p
            className="mt-1 text-sm"
            style={{ color: "rgb(var(--theme-muted-fg))" }}
          >
            Tippen Sie auf einen Eintrag, um direkt zu reagieren.
          </p>
          <ul className="mt-5 space-y-3">
            {phone && (
              <li>
                <a
                  href={telLink(phone)}
                  className="flex items-center gap-3 rounded-theme-button border p-3 text-sm font-medium transition-colors"
                  style={{
                    borderColor: "rgb(var(--theme-border))",
                    color: "rgb(var(--theme-foreground))",
                  }}
                >
                  <span
                    className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "rgb(var(--theme-primary) / 0.12)",
                      color: "rgb(var(--theme-primary))",
                    }}
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                  </span>
                  <span>{formatPhoneDisplay(phone)}</span>
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={whatsappLink(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-theme-button border p-3 text-sm font-medium transition-colors"
                  style={{
                    borderColor: "rgb(var(--theme-border))",
                    color: "rgb(var(--theme-foreground))",
                  }}
                >
                  <span
                    className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "rgb(var(--theme-accent) / 0.18)",
                      color: "rgb(var(--theme-accent))",
                    }}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                  </span>
                  <span>WhatsApp · {formatPhoneDisplay(whatsapp)}</span>
                </a>
              </li>
            )}
            {email && (
              <li>
                <a
                  href={mailtoLink(email, `Anfrage über ${business.name}`)}
                  className="flex items-center gap-3 rounded-theme-button border p-3 text-sm font-medium transition-colors"
                  style={{
                    borderColor: "rgb(var(--theme-border))",
                    color: "rgb(var(--theme-foreground))",
                  }}
                >
                  <span
                    className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "rgb(var(--theme-secondary) / 0.12)",
                      color: "rgb(var(--theme-secondary))",
                    }}
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="truncate">{email}</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Anfrageformular (Session 12: interaktiv, client-only Mock-Persistenz) */}
        <div
          className="rounded-theme-card border p-6"
          style={{
            borderColor: "rgb(var(--theme-border))",
            backgroundColor: "rgb(var(--theme-background))",
          }}
        >
          <h3 className="lp-theme-heading text-lg">Anfrageformular</h3>
          <p
            className="mt-1 text-sm"
            style={{ color: "rgb(var(--theme-muted-fg))" }}
          >
            Felder passen sich an die Branche an – nur das Wichtigste,
            ohne Schnickschnack.
          </p>
          <div className="mt-5">
            <PublicLeadForm business={business} fields={leadFormFields} />
          </div>
        </div>
      </div>
    </PublicSection>
  );
}
