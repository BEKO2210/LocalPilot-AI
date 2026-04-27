import { Calendar, MessageCircle, Phone } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/contact-links";
import type { Business } from "@/types/business";

type PublicMobileCtaBarProps = {
  business: Business;
};

/**
 * Sticky-Bar nur auf Mobile (< md).
 * Drei zentrale Aktionen: Anrufen, WhatsApp, Anfrage. Optionen blenden sich
 * aus, wenn der Betrieb sie nicht hinterlegt hat.
 */
export function PublicMobileCtaBar({ business }: PublicMobileCtaBarProps) {
  const phone = business.contact.phone;
  const whatsapp = business.contact.whatsapp;

  const buttons: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    primary?: boolean;
    external?: boolean;
  }> = [];

  if (phone) {
    buttons.push({
      href: telLink(phone),
      label: "Anrufen",
      icon: Phone,
    });
  }
  if (whatsapp) {
    buttons.push({
      href: whatsappLink(whatsapp),
      label: "WhatsApp",
      icon: MessageCircle,
      external: true,
    });
  }
  buttons.push({
    href: "#kontakt",
    label: "Anfrage",
    icon: Calendar,
    primary: true,
  });

  if (buttons.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t shadow-theme md:hidden"
      style={{
        borderColor: "rgb(var(--theme-border))",
        backgroundColor: "rgb(var(--theme-background) / 0.96)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="lp-container flex items-stretch gap-2 py-2">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <a
              key={btn.label}
              href={btn.href}
              target={btn.external ? "_blank" : undefined}
              rel={btn.external ? "noopener noreferrer" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-theme-button py-2 text-[11px] font-medium"
              style={
                btn.primary
                  ? {
                      backgroundColor: "rgb(var(--theme-primary))",
                      color: "rgb(var(--theme-primary-fg))",
                    }
                  : {
                      borderWidth: 1,
                      borderColor: "rgb(var(--theme-border))",
                      color: "rgb(var(--theme-foreground))",
                    }
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{btn.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
