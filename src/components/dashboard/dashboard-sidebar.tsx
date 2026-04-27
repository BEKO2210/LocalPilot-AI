import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  DASHBOARD_NAV,
  dashboardHref,
  type DashboardNavKey,
} from "./nav-config";
import type { Business } from "@/types/business";

type DashboardSidebarProps = {
  business: Business;
  active: DashboardNavKey;
};

/**
 * Persistente Sidebar für Desktop. Mobile-Nav lebt in einer eigenen
 * Komponente, damit beide unabhängig optimiert werden können.
 */
export function DashboardSidebar({ business, active }: DashboardSidebarProps) {
  return (
    <nav aria-label="Dashboard-Navigation">
      <ul className="space-y-1">
        {DASHBOARD_NAV.map((item) => {
          const Icon = item.icon;
          const href = dashboardHref(business.slug, item.key);
          const isActive = item.key === active;
          const isStub = typeof item.comingInSession === "number";

          return (
            <li key={item.key}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-brand-600 text-white shadow-soft"
                    : "text-ink-700 hover:bg-ink-100",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 flex-none",
                    isActive ? "text-white" : "text-ink-500 group-hover:text-ink-700",
                  )}
                  aria-hidden
                />
                <span className="flex-1 truncate font-medium">{item.label}</span>
                {isStub ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-ink-100 text-ink-500",
                    )}
                    title={`Folgt in Session ${item.comingInSession}`}
                  >
                    <Lock className="h-2.5 w-2.5" aria-hidden />
                    Vorschau
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
