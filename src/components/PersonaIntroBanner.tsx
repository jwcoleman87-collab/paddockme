"use client";

import { useEffect, useState } from "react";
import { Sprout, Tractor, Truck } from "lucide-react";
import { featuredFarmers, type Farmer } from "@/lib/dummyData";
import { cn } from "@/lib/utils";

type Page =
  | "listings"
  | "capacity"
  | "transport-portal"
  | "runs"
  | "map"
  | "requests";

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
      body: "These are listings already on the market. Use \"Create listing\" to publish yours, or open /requests to see livestock owners looking for paddocks right now.",
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
  "transport-portal": {
    "Livestock Owner": {
      body: "Browse drivers via the capacity board, or open your transport room from the agreement workspace.",
      tone: "muted",
    },
    Landowner: {
      body: "Transport coordination lives inside your agreement workspace. The portal below is a driver-side workbench.",
      tone: "muted",
    },
    "Transport Provider": {
      body: "Quick links to available jobs, your calendar, and earnings. Use /runs for the full pipeline view.",
    },
  },
  runs: {
    "Livestock Owner": {
      body: "This is the driver's pipeline view. As a livestock owner, you'll see transport status inside each agreement workspace.",
      tone: "muted",
    },
    Landowner: {
      body: "This is the driver's pipeline view. Landowners don't see driver earnings or rate detail by design.",
      tone: "muted",
    },
    "Transport Provider": {
      body: "Your live work, top to bottom: next run, three-bucket pipeline, jobs, and the capacity you've posted.",
    },
  },
  map: {
    "Livestock Owner": {
      body: "Switch modes to follow your agreement geography, or trace a driver's route. Layers stack so you can compare supply and demand at a glance.",
    },
    Landowner: {
      body: "Your paddocks sit in the regional view. Switch to Agreement mode to see the route a confirmed transport job is running.",
    },
    "Transport Provider": {
      body: "Driver mode traces your run from pickup to delivery. Regional layers show feed pressure and incoming demand for return-leg planning.",
    },
  },
  requests: {
    "Livestock Owner": {
      body: "These are open inquiries from other livestock owners. Your own requests live here too - landowners see them and can offer paddocks.",
      tone: "muted",
    },
    Landowner: {
      body: "Open inquiries from livestock owners. Tap \"Offer a paddock\" to start a workspace with the requester, or list a new paddock that fits.",
    },
    "Transport Provider": {
      body: "Livestock owners post requests here. Drivers don't appear in this loop until an agreement reaches the transport step.",
      tone: "muted",
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
