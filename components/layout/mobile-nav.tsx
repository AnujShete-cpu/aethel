"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { SaveButton } from "@/components/saves/save-button";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/constants/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger trigger — only visible on mobile */}
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-nav-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link
            href={"/inbox" as Route}
            className="text-base font-semibold tracking-tight text-foreground"
            onClick={close}
          >
            Aethel
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={close}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
          <ul className="space-y-0.5" role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <SidebarNavItem
                  href={item.href}
                  label={item.label}
                  iconKey={item.iconKey}
                  onClick={close}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: Save + Settings */}
        <div className="border-t border-border px-3 py-3 space-y-0.5">
          <SaveButton variant="mobile" />
          <SidebarNavItem
            href={SETTINGS_ITEM.href}
            label={SETTINGS_ITEM.label}
            iconKey={SETTINGS_ITEM.iconKey}
            onClick={close}
          />
        </div>
      </div>
    </>
  );
}
