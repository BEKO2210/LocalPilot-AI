import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LocalPilot AI – Websites, Leads und KI-Texte für lokale Betriebe",
    template: "%s · LocalPilot AI",
  },
  description:
    "LocalPilot AI ist das universelle KI-Website-, Lead- und Automationssystem für lokale Betriebe – von Friseur bis Werkstatt, vom Kosmetikstudio bis zur Reinigungsfirma.",
  applicationName: "LocalPilot AI",
  authors: [{ name: "LocalPilot AI" }],
  keywords: [
    "Website für lokale Betriebe",
    "KI für kleine Unternehmen",
    "Leadformular",
    "Bewertungs-Booster",
    "Social Media Generator",
    "SaaS für Handwerk",
    "Friseur Website",
    "Werkstatt Website",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    title: "LocalPilot AI – Websites & KI für lokale Betriebe",
    description:
      "Moderne Websites, Anfragen, Bewertungen und Social-Media-Inhalte – KI-gestützt und passend zu jeder Branche.",
    siteName: "LocalPilot AI",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f47d6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-white text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
