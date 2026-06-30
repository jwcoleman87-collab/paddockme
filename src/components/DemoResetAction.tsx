"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Button";
import { isDemoMode } from "@/lib/demoMode";
import { runDemoReset } from "@/lib/demoReset";

/**
 * Inline "Reset demo" action that sits in the end-of-workflow button row,
 * alongside the existing next-step actions (Open transport room, Agreements,
 * RFT board, ...). It blends in as just another action button rather than a
 * banner or callout - the presenter finishes the workflow and resets in place.
 *
 * Rendered only when the build is running in demo mode, so it never reaches
 * real users in production. Styling comes straight from the shared Button
 * component, so it matches the primary/secondary actions used app-wide.
 */
export function DemoResetAction({
  variant = "secondary",
  className,
}: {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  if (!isDemoMode()) return null;

  async function resetDemo() {
    if (loading) return;
    const confirmed = window.confirm(
      "Reset the demo? This clears the demo data created during this session and starts the next run-through fresh."
    );
    if (!confirmed) return;
    setLoading(true);
    await runDemoReset();
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={resetDemo}
      disabled={loading}
      className={className}
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
      {loading ? "Resetting…" : "Reset demo"}
    </Button>
  );
}
