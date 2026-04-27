import { BusinessHeader } from "./business-header";
import { DashboardMobileNav } from "./dashboard-mobile-nav";
import { DashboardSidebar } from "./dashboard-sidebar";
import type { DashboardNavKey } from "./nav-config";
import type { Business } from "@/types/business";

type DashboardShellProps = {
  business: Business;
  active: DashboardNavKey;
  children: React.ReactNode;
};

/**
 * Layout-Hülle für jede Dashboard-Seite. Sticky-BusinessHeader oben,
 * Sidebar links auf Desktop, horizontaler Nav-Strip auf Mobile,
 * Content rechts/unten.
 */
export function DashboardShell({
  business,
  active,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-ink-50">
      <BusinessHeader business={business} />
      <DashboardMobileNav slug={business.slug} active={active} />
      <div className="lp-container flex gap-8 py-6 lg:py-8">
        <aside className="hidden w-60 flex-none md:block">
          <DashboardSidebar business={business} active={active} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
