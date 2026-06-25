"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

type SaveModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const SaveModalContext = createContext<SaveModalContextValue | null>(null);

export function useSaveModal() {
  const ctx = useContext(SaveModalContext);
  if (!ctx) {
    throw new Error("useSaveModal must be used within SaveModalProvider");
  }
  return ctx;
}

type SaveModalProviderProps = Readonly<{ children: ReactNode }>;

export function SaveModalProvider({ children }: SaveModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SaveModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </SaveModalContext.Provider>
  );
}
