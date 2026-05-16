"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { FlashMessage, type FlashTone } from "@/components/FlashMessage";

type FlashEntry = {
  id: number;
  message: string;
  tone: FlashTone;
};

type FlashContextValue = {
  flash: (message: string, tone?: FlashTone) => void;
};

const FlashContext = createContext<FlashContextValue | null>(null);

export function FlashProvider({ children }: { children: React.ReactNode }) {
  const [entry, setEntry] = useState<FlashEntry | null>(null);

  const flash = useCallback((message: string, tone: FlashTone = "info") => {
    setEntry({ id: Date.now(), message, tone });
  }, []);

  const value = useMemo(() => ({ flash }), [flash]);

  return (
    <FlashContext.Provider value={value}>
      {children}
      {entry && (
        <FlashMessage
          key={entry.id}
          message={entry.message}
          tone={entry.tone}
          onDismiss={() => setEntry(null)}
        />
      )}
    </FlashContext.Provider>
  );
}

/**
 * Dispatch a transient flash message from any descendant of FlashProvider.
 * If no provider is mounted (e.g., during SSR), this is a no-op so the
 * consumer doesn't blow up.
 */
export function useFlash() {
  const ctx = useContext(FlashContext);
  return ctx?.flash ?? (() => {});
}
