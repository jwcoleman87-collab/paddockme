import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import { paddockmeImages } from "@/lib/paddockmeImages";

export const metadata: Metadata = {
  title: "Request Sent — PaddockME",
};

/** Screen 7 — Request Sent confirmation over a sunset paddock. */
export default function RequestSentPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${paddockmeImages.requestSentBackground})` }}
    >
      <div className="absolute inset-0 bg-pm-green-900/35" aria-hidden />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-9 text-center shadow-2xl">
        <CheckCircle2
          className="mx-auto h-16 w-16 text-pm-success"
          aria-hidden
        />
        <h1 className="mt-4 text-2xl font-extrabold text-pm-charcoal">
          Request Sent!
        </h1>
        <p className="mt-3 text-sm text-pm-muted">
          Your discussion request has been sent to John Smith.
        </p>
        <p className="mt-1 text-sm text-pm-muted">
          Good news — for this demo John has already said yes. Your shared
          workspace is ready.
        </p>
        <PmButton href="/workspaces/1023" className="mt-6 w-full">
          Go to My Workspace
        </PmButton>
      </div>
    </main>
  );
}
