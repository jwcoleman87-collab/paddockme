"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { featuredFarmers } from "@/lib/dummyData";
import { createClient } from "@/lib/supabase/client";

/**
 * Tiny client-only component for the AppShell header.
 *
 * Prefers the signed-in Supabase user. The prototype persona remains as a
 * fallback so the demo routes still make sense when no account is active.
 */
type SignedInUser = {
  name: string;
  email: string | null;
};

export function AppShellHeaderUser() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [signedInUser, setSignedInUser] = useState<SignedInUser | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function loadSignedInUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setSignedInUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      const metaName =
        (user.user_metadata as { full_name?: string } | null)?.full_name ??
        null;
      const name = profile?.full_name ?? metaName ?? user.email ?? "Account";
      setSignedInUser({ name, email: user.email ?? null });
    }

    void loadSignedInUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadSignedInUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function read(): string | null {
      try {
        const stored =
          window.localStorage.getItem("paddockme.agreements.persona") ??
          window.localStorage.getItem("paddockme.profile.persona");
        if (stored) return stored;
      } catch {
        // ignore
      }
      const cookiePersona = readPersonaCookie();
      if (cookiePersona) return cookiePersona;
      const routePersona = personaForRoute(pathname, searchParams);
      if (routePersona) return routePersona;
      return featuredFarmers[0]?.id ?? null;
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
        setActivePersonaId(event.newValue ?? featuredFarmers[0]?.id ?? null);
      }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("paddockme:persona-change", onPersonaChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("paddockme:persona-change", onPersonaChange);
    };
  }, [pathname, searchParams]);

  if (signedInUser) {
    const firstName = signedInUser.name.trim().split(/\s+/)[0] ?? "Account";
    const initials = initialsForName(signedInUser.name);
    return (
      <>
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ochre/40 bg-ochre-light text-xs font-bold text-sage-deep"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate text-xs font-semibold sm:inline">
          {firstName}
        </span>
      </>
    );
  }

  const persona = activePersonaId
    ? featuredFarmers.find((f) => f.id === activePersonaId)
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

function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PM";
  const first = parts[0]?.[0] ?? "P";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return `${first}${second ?? ""}`.toUpperCase();
}

function readPersonaCookie(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith("paddockme_persona="));
  return entry ? decodeURIComponent(entry.split("=")[1] ?? "") : null;
}

function personaForRoute(
  pathname: string | null,
  searchParams: ReturnType<typeof useSearchParams>
): string | null {
  if (!pathname) return null;
  const viewAs = searchParams?.get("as");

  if (
    pathname === "/landowner" ||
    pathname === "/listings/new" ||
    viewAs === "landowner"
  ) {
    return "farmer-b";
  }

  if (pathname.startsWith("/transport")) {
    if (viewAs === "landowner") return "farmer-b";
    if (viewAs === "farmerA") return "farmer-a";
    return "driver-1";
  }

  if (pathname === "/request/new" || pathname.startsWith("/matches")) {
    return "farmer-a";
  }

  return null;
}
