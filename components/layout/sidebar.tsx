import Link from "next/link";
import type { Route } from "next";

import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/constants/nav";

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link
          href={"/inbox" as Route}
          className="text-base font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors"
        >
          Aethel
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarNavItem
                href={item.href}
                label={item.label}
                iconKey={item.iconKey}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings pinned to bottom */}
      <div className="border-t border-border px-3 py-3">
        <SidebarNavItem
          href={SETTINGS_ITEM.href}
          label={SETTINGS_ITEM.label}
          iconKey={SETTINGS_ITEM.iconKey}
        />
      </div>
    </aside>
  );
}
