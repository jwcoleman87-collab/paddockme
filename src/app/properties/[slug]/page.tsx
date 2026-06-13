import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Wheat,
  Droplets,
  Fence,
  Truck,
  LandPlot,
} from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { PropertyFactCard, OwnerCard, Rating } from "@/components/paddockme/PmCards";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { demoPropertyDetail } from "@/lib/paddockmeDemoData";

export const metadata: Metadata = {
  title: "Green Hills Farm — PaddockME",
};

const factIcons: Record<string, React.ReactNode> = {
  wheat: <Wheat className="h-5 w-5" />,
  droplets: <Droplets className="h-5 w-5" />,
  fence: <Fence className="h-5 w-5" />,
  truck: <Truck className="h-5 w-5" />,
  landPlot: <LandPlot className="h-5 w-5" />,
};

/** Screen 6 — Property Detail: review before requesting a discussion. */
export default function PropertyDetailPage() {
  const p = demoPropertyDetail;
  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/requests/matches"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to results
          </Link>
          <PaddockMeLogo variant="dark" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold text-pm-charcoal">
              {p.name}
            </h1>
            <p className="text-sm text-pm-muted">{p.location}</p>
          </div>
          <Rating value={p.rating} />
        </div>

        {/* Gallery */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.mainImage}
          alt={`${p.name} main paddock view`}
          className="mt-5 h-64 w-full rounded-2xl object-cover sm:h-80"
        />
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {p.gallery.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`${p.name} photo ${i + 2}`}
              className="h-20 w-full rounded-lg object-cover"
            />
          ))}
          <div className="hidden h-20 items-center justify-center rounded-lg bg-pm-green-900 text-sm font-bold text-white sm:flex">
            +{p.extraPhotoCount}
          </div>
        </div>

        {/* Facts */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {p.facts.map((f) => (
            <PropertyFactCard
              key={f.label}
              icon={factIcons[f.icon]}
              label={f.label}
              value={f.value}
            />
          ))}
        </div>

        {/* Owner + CTA */}
        <div className="mt-8">
          <OwnerCard
            name={p.owner.name}
            memberSince={p.owner.memberSince}
            rating={p.owner.rating}
            action={
              <PmButton href="/requests/sent">Request Discussion</PmButton>
            }
          />
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
