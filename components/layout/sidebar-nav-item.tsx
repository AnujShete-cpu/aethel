"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Inbox, Library, Search, MessageSquare, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavIconKey } from "@/constants/nav";

// Icon map lives here — inside the Client Component boundary.
// Server Components pass a serialisable string key; this component
// resolves it to the icon. No function ever crosses the boundary.
const ICON_MAP: Record<NavIconKey, LucideIcon> = {
  "inbox":          Inbox,
  "library":        Library,
  "search":         Search,
  "message-square": MessageSquare,
  "settings":       Settings,
};

type SidebarNavItemProps = Readonly<{
  href: string;
  label: string;
  iconKey: NavIconKey;
  onClick?: () => void;
}>;

export function SidebarNavItem({ href, label, iconKey, onClick }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const Icon = ICON_MAP[iconKey];

  return (
    <Link
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
      href={href as Route}
      onClick={onClick}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}
