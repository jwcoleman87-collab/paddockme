"use client";

import { useEffect, useState } from "react";
import { Sprout, Tractor, Truck } from "lucide-react";
import { featuredFarmers, type Farmer } from "@/lib/dummyData";
import { cn } from "@/lib/utils";

type Page = "listings" | "capacity";

type Copy = {
  body: string;
  /** Optional tone override - default is "info" (sage). "muted" if the surface
   * isn't built for this persona. */
  tone?: "info" | "muted";
};

const COPY: Record<Page, Record<Farmer["role"], Copy>> = {
  listings: {
    "Livestock Owner": {
      body: "Browse paddocks open for agistment. Tap a card to start a workspace with the landowner.",
    },
    Landowner: {
      body: "These are listings already on the market. Use \"Create listing\" above to publish yours.",
    },
    "Transport Provider": {
      body: "Landowners use this surface. As a driver, browse /transport/available for backloads.",
      tone: "muted",
    },
  },
  capacity: {
    "Livestock Owner": {
      body: "Drivers post empty legs here. Tap a card to start a quote with the driver - your transport rate stays private from the landowner.",
    },
    Landowner: {
      body: "Drivers post empty legs here. Transport rate is hidden from landowners by design - you'll see the agreed logistics in the workspace.",
      tone: "muted",
    },
    "Transport Provider": {
      body: "Your own posted runs sit at the top. Use \"Post a run\" to advertise an empty leg, or open /runs to manage what's already moving.",
    },
  },
};

const roleIcon: Record<Farmer["role"], typeof Sprout> = {
  "Livestock Owner": Sprout,
  Landowner: Tractor,
  "Transport Provider": Truck,
};

/**
 * Per-persona orientation banner. Renders a single sentence telling the
 * active persona what this page does for them. Falls silent when there's no
 * persona context (server render, fresh browser) so the page never shows a
 * stale "as Dale" message to the wrong person.
 */
export function PersonaIntroBanner({ page }: { page: Page }) {
  const [personaId, setPersonaId] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    function read() {
      try {
        return (
          window.localStorage.getItem("paddockme.agreements.persona") ??
          window.localStorage.getItem("paddockme.profile.persona") ??
          undefined
        );
      } catch {
        return undefined;
      }
    }
    setPersonaId(read());
    function onChange() {
      setPersonaId(read());
    }
    window.addEventListener("paddockme:persona-change", onChange);
    return () =>
      window.removeEventListener("paddockme:persona-change", onChange);
  }, []);

  if (!personaId) return null;
  const persona = featuredFarmers.find((f) => f.id === personaId);
  if (!persona) return null;

  const copy = COPY[page][persona.role];
  if (!copy) return null;

  const Icon = roleIcon[persona.role];
  const muted = copy.tone === "muted";

  return (
    <section
      aria-label={`Page intro for ${persona.role}`}
      className={cn(
        "mb-4 flex items-start gap-3 rounded-2xl border p-3.5",
        muted
          ? "border-amber/40 bg-amber-light/55"
          : "border-sage-deep/15 bg-sage-mist/45"
      )}
    >
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          muted ? "bg-amber text-cream" : "bg-sage-deep text-cream"
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-bark">
          Viewing as {persona.name.split(" ")[0]} ({persona.role})
        </p>
        <p className="mt-0.5 text-sm leading-snug text-bark/85">{copy.body}</p>
      </div>
    </section>
  );
}
