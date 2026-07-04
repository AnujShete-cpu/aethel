"use client";

import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { SaveModalProvider } from "@/providers/save-modal-provider";
import { ToastProvider } from "@/providers/toast-provider";

type AppProvidersProps = Readonly<{ children: ReactNode }>;

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ToastProvider>
        <SaveModalProvider>{children}</SaveModalProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
