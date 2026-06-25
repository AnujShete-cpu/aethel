import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type AppLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}

// All routes inside the app shell are authenticated and dynamic.
// Static prerendering is not applicable — user data is session-dependent.
export const dynamic = "force-dynamic";
