import { Mail, MessageCircle, Phone } from "lucide-react";
import { PublicSection } from "./public-section";
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

        {/* Formular-Vorschau (Session 12 macht es interaktiv) */}
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
            Das Formular wird in Kürze interaktiv. Diese Felder werden dabei abgefragt:
          </p>
          <form
            className="mt-5 space-y-4"
            aria-label="Anfrageformular (Vorschau)"
            action="#kontakt"
          >
            {leadFormFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label
                  htmlFor={`preview-${field.key}`}
                  className="block text-xs font-medium uppercase tracking-wide"
                  style={{ color: "rgb(var(--theme-muted-fg))" }}
                >
                  {field.label}
                  {field.required ? " *" : null}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={`preview-${field.key}`}
                    disabled
                    aria-disabled
                    placeholder={field.placeholder}
                    className="w-full resize-none rounded-theme-button border p-3 text-sm opacity-70"
                    style={{
                      borderColor: "rgb(var(--theme-border))",
                      backgroundColor: "rgb(var(--theme-muted))",
                      color: "rgb(var(--theme-foreground))",
                    }}
                    rows={3}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={`preview-${field.key}`}
                    disabled
                    aria-disabled
                    className="w-full rounded-theme-button border p-3 text-sm opacity-70"
                    style={{
                      borderColor: "rgb(var(--theme-border))",
                      backgroundColor: "rgb(var(--theme-muted))",
                      color: "rgb(var(--theme-foreground))",
                    }}
                  >
                    <option>Bitte wählen…</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`preview-${field.key}`}
                    type={
                      field.type === "phone"
                        ? "tel"
                        : field.type === "number"
                          ? "number"
                          : field.type === "date"
                            ? "date"
                            : field.type === "time"
                              ? "time"
                              : field.type === "email"
                                ? "email"
                                : "text"
                    }
                    placeholder={field.placeholder}
                    disabled
                    aria-disabled
                    className="w-full rounded-theme-button border p-3 text-sm opacity-70"
                    style={{
                      borderColor: "rgb(var(--theme-border))",
                      backgroundColor: "rgb(var(--theme-muted))",
                      color: "rgb(var(--theme-foreground))",
                    }}
                  />
                )}
                {field.helperText && (
                  <p
                    className="text-xs"
                    style={{ color: "rgb(var(--theme-muted-fg))" }}
                  >
                    {field.helperText}
                  </p>
                )}
              </div>
            ))}

            <p
              className="rounded-theme-button border p-3 text-xs"
              style={{
                borderColor: "rgb(var(--theme-border))",
                color: "rgb(var(--theme-muted-fg))",
                backgroundColor: "rgb(var(--theme-muted))",
              }}
            >
              Das interaktive Formular folgt im nächsten Update. Bis dahin nutzen Sie bitte den Direktkontakt links.
            </p>
          </form>
        </div>
      </div>
    </PublicSection>
  );
}
