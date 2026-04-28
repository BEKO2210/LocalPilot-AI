import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  DASHBOARD_NAV,
  dashboardHref,
  type DashboardNavKey,
} from "./nav-config";

type DashboardMobileNavProps = {
  slug: string;
  active: DashboardNavKey;
};

/**
 * Horizontaler Scroll-Nav-Strip für Mobile. Pure CSS, kein Drawer-State.
 */
export function DashboardMobileNav({ slug, active }: DashboardMobileNavProps) {
  return (
    <nav
      aria-label="Dashboard-Navigation (mobil)"
      className="md:hidden border-b border-ink-200 bg-white"
    >
      <ul className="flex gap-1 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none]">
        {DASHBOARD_NAV.map((item) => {
          const Icon = item.icon;
          const href = dashboardHref(slug, item.key);
          const isActive = item.key === active;
          return (
            <li key={item.key} className="flex-none">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "lp-focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "bg-ink-100 text-ink-700",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
