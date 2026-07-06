"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "left" | "right";

export function SplitWorkspace({
  leftLabel = "Agreement",
  rightLabel = "Chat",
  left,
  right,
}: {
  leftLabel?: string;
  rightLabel?: string;
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  const [active, setActive] = useState<Tab>("left");

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 rounded-lg border border-mist bg-cream p-1 md:hidden">
        <TabButton active={active === "left"} onClick={() => setActive("left")}>
          {leftLabel}
        </TabButton>
        <TabButton active={active === "right"} onClick={() => setActive("right")}>
          {rightLabel}
        </TabButton>
      </div>

      {/* The chat column deliberately has no self-start: it stretches to the
          row height so the sticky, viewport-capped ChatPanel inside it can
          stay in view while the agreement column scrolls. */}
      <div className="grid gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:gap-6">
        <div
          className={cn(
            active === "left" ? "block" : "hidden",
            "min-w-0 md:block md:self-start"
          )}
        >
          {left}
        </div>
        <div
          className={cn(
            active === "right" ? "block" : "hidden",
            "min-w-0 md:block"
          )}
        >
          {right}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-md px-4 py-2 text-sm font-semibold transition",
        active ? "bg-sage-deep text-cream" : "text-bark/85",
        "cursor-pointer"
      )}
    >
      {children}
    </button>
  );
}
