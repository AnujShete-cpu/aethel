"use client";

import type { ReactNode } from "react";

import { SaveModalProvider } from "@/providers/save-modal-provider";

type AppProvidersProps = Readonly<{
  children: ReactNode;
}>;

export function AppProviders({ children }: AppProvidersProps) {
  return <SaveModalProvider>{children}</SaveModalProvider>;
}
