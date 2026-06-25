// Nav item definitions using string icon keys.
// This file contains only plain serialisable data — no React components —
// so it is safe to import from both Server and Client Components.

export type NavIconKey = "inbox" | "library" | "search" | "message-square" | "settings";

export type NavItem = Readonly<{
  href: string;
  label: string;
  iconKey: NavIconKey;
}>;

export const NAV_ITEMS = [
  { href: "/inbox",       label: "Inbox",       iconKey: "inbox"          },
  { href: "/collections", label: "Collections", iconKey: "library"        },
  { href: "/search",      label: "Search",      iconKey: "search"         },
  { href: "/chat",        label: "Chat",        iconKey: "message-square" },
] as const satisfies readonly NavItem[];

export const SETTINGS_ITEM = {
  href: "/settings",
  label: "Settings",
  iconKey: "settings",
} as const satisfies NavItem;
