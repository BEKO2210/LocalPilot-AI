import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";

export type DashboardNavKey =
  | "overview"
  | "business"
  | "services"
  | "leads"
  | "ai"
  | "reviews"
  | "social"
  | "settings";

export type DashboardNavItem = {
  key: DashboardNavKey;
  /** Suffix nach `/dashboard/<slug>`. Leer für die Übersicht. */
  pathSuffix: string;
  label: string;
  icon: LucideIcon;
  /** Falls noch nicht voll umgesetzt: Session, in der das kommt. */
  comingInSession?: number;
};

/**
 * Single Source of Truth für die Dashboard-Navigation.
 * Sidebar (Desktop), Mobile-Nav-Strip und Übersichts-Quickactions
 * lesen alle aus dieser Liste.
 */
export const DASHBOARD_NAV: readonly DashboardNavItem[] = [
  {
    key: "overview",
    pathSuffix: "",
    label: "Übersicht",
    icon: LayoutDashboard,
  },
  {
    key: "business",
    pathSuffix: "/business",
    label: "Betriebsdaten",
    icon: Building2,
  },
  {
    key: "services",
    pathSuffix: "/services",
    label: "Leistungen",
    icon: Briefcase,
  },
  {
    key: "leads",
    pathSuffix: "/leads",
    label: "Anfragen",
    icon: Inbox,
  },
  {
    key: "ai",
    pathSuffix: "/ai",
    label: "KI-Assistent",
    icon: Sparkles,
  },
  {
    key: "reviews",
    pathSuffix: "/reviews",
    label: "Bewertungen",
    icon: Star,
  },
  {
    key: "social",
    pathSuffix: "/social",
    label: "Social Media",
    icon: Megaphone,
  },
  {
    key: "settings",
    pathSuffix: "/settings",
    label: "Einstellungen",
    icon: Settings,
  },
];

export function dashboardHref(slug: string, key: DashboardNavKey): string {
  const item = DASHBOARD_NAV.find((i) => i.key === key);
  if (!item) return `/dashboard/${slug}`;
  return `/dashboard/${slug}${item.pathSuffix}`;
}
