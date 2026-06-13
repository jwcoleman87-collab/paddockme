import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PropertyResultCard } from "@/components/paddockme/PropertyResultCard";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { demoProperties } from "@/lib/paddockmeDemoData";

export const metadata: Metadata = {
  title: "Matches Found — PaddockME",
};

/** Screen 5 — Matches Found: real-estate style property results. */
export default function MatchesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <PaddockMeLogo variant="dark" />
          <Link
            href="/requests/new/requirements"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Refine Search
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold text-pm-charcoal">
          12 Suitable Properties Found
        </h1>
        <p className="mt-1 text-sm text-pm-muted">Based on your requirements</p>

        <div className="mt-6 space-y-4">
          {demoProperties.map((p) => (
            <PropertyResultCard key={p.slug} property={p} />
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-pm-muted">
          Showing the 2 closest matches. 10 more available within 300 km.
        </p>
      </main>

      <AppBottomNav />
    </div>
  );
}
