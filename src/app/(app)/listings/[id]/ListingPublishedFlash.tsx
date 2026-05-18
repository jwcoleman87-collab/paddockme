"use client";

import { useEffect } from "react";
import { useFlash } from "@/components/FlashProvider";

export function ListingPublishedFlash({ show }: { show: boolean }) {
  const flash = useFlash();

  useEffect(() => {
    if (!show) return;
    flash("Listing published - visible to livestock owners.", "success");
  }, [flash, show]);

  return null;
}
