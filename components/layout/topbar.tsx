"use client";

import { UserButton } from "@clerk/nextjs";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SaveButton } from "@/components/saves/save-button";

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      {/* Left: mobile nav trigger + logo (mobile only) */}
      <div className="flex items-center gap-3">
        <MobileNav />
        {/* Logo visible only on mobile — hidden on md+ where sidebar shows it */}
        <span className="text-base font-semibold tracking-tight text-foreground md:hidden">
          Aethel
        </span>
      </div>

      {/* Right: Save button + Clerk user menu */}
      <div className="flex items-center gap-3">
        {/* Save button — hidden on mobile (shown inside drawer instead) */}
        <div className="hidden md:block">
          <SaveButton />
        </div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8"
            }
          }}
        />
      </div>
    </header>
  );
}
