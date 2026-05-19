"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/Button";

/**
 * Trigger window.print() from a real click handler. Avoids the
 * `javascript:` URL pattern which trips CSP and modern accessibility tooling.
 */
export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      className="print:hidden"
    >
      <Download className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
