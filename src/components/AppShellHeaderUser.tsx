"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { farmers } from "@/lib/dummyData";

/**
 * Tiny client-only component for the AppShell header.
 *
 * Renders the avatar + name for whichever main persona the prototype is
 * currently showing.
 * Falls back to the generic User icon when no persona is selected yet.
 */
export function AppShellHeaderUser() {
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);

  useEffect(() => {
    function read(): string | null {
      try {
        return (
          window.localStorage.getItem("paddockme.agreements.persona") ??
          window.localStorage.getItem("paddockme.profile.persona") ??
          farmers[0]?.id ??
          null
        );
      } catch {
        return farmers[0]?.id ?? null;
      }
    }

    setActivePersonaId(read());

    function onPersonaChange() {
      setActivePersonaId(read());
    }
    function onStorage(event: StorageEvent) {
      if (
        event.key === "paddockme.agreements.persona" ||
        event.key === "paddockme.profile.persona"
      ) {
        setActivePersonaId(event.newValue ?? farmers[0]?.id ?? null);
      }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("paddockme:persona-change", onPersonaChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("paddockme:persona-change", onPersonaChange);
    };
  }, []);

  const persona = activePersonaId
    ? farmers.find((f) => f.id === activePersonaId)
    : undefined;

  if (persona) {
    return (
      <>
        <Avatar
          name={persona.name}
          src={persona.avatarUrl}
          size="sm"
          className="shrink-0"
        />
        <span className="hidden max-w-[8rem] truncate text-xs font-semibold sm:inline">
          {persona.name.split(" ")[0]}
        </span>
      </>
    );
  }

  return (
    <>
      <User className="h-5 w-5" aria-hidden />
    </>
  );
}
