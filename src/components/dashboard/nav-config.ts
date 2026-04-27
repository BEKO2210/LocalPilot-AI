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
    comingInSession: 10,
  },
  {
    key: "services",
    pathSuffix: "/services",
    label: "Leistungen",
    icon: Briefcase,
    comingInSession: 11,
  },
  {
    key: "leads",
    pathSuffix: "/leads",
    label: "Anfragen",
    icon: Inbox,
    comingInSession: 12,
  },
  {
    key: "ai",
    pathSuffix: "/ai",
    label: "KI-Assistent",
    icon: Sparkles,
    comingInSession: 13,
  },
  {
    key: "reviews",
    pathSuffix: "/reviews",
    label: "Bewertungen",
    icon: Star,
    comingInSession: 16,
  },
  {
    key: "social",
    pathSuffix: "/social",
    label: "Social Media",
    icon: Megaphone,
    comingInSession: 17,
  },
  {
    key: "settings",
    pathSuffix: "/settings",
    label: "Einstellungen",
    icon: Settings,
    comingInSession: 18,
  },
];

export function dashboardHref(slug: string, key: DashboardNavKey): string {
  const item = DASHBOARD_NAV.find((i) => i.key === key);
  if (!item) return `/dashboard/${slug}`;
  return `/dashboard/${slug}${item.pathSuffix}`;
}
