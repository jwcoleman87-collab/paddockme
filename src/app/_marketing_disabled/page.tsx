import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Marketing landing page.
 * Dark sage hero — "Reduce agricultural coordination friction" as the H1
 * (Fraunces italic, inherited from globals.css default for h1).
 */
export default function MarketingHome() {
  return (
    <>
      <section className="bg-sage-deep text-cream">
        <div className="mx-auto max-w-6xl px-6 pt-40 pb-32">
          <p className="mb-6 text-sm tracking-widest uppercase text-sage-glow/80">
            Australian agistment marketplace
          </p>
          <h1 className="font-display italic font-bold text-5xl md:text-7xl leading-[1.05] max-w-4xl text-warm-white">
            Reduce agricultural coordination friction.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-sage-glow max-w-2xl leading-relaxed">
            Match livestock with feed, paddocks with stock, and trucks with
            routes — without the phone tag, the saleyard hand-shakes, or the
            Facebook posts.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-ochre px-6 py-3 font-medium text-sage-deep hover:bg-ochre-light transition"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-full border border-sage-glow/40 px-6 py-3 font-medium text-cream hover:bg-sage-dark transition"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-warm-white">
        <div className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="font-display italic text-2xl text-sage-deep mb-3">
              Tap, don&rsquo;t type.
            </h2>
            <p className="text-bark/80 leading-relaxed">
              Sliders and chips, not text fields. Every screen removes a step,
              never adds one.
            </p>
          </div>
          <div>
            <h2 className="font-display italic text-2xl text-sage-deep mb-3">
              One workspace, all parties.
            </h2>
            <p className="text-bark/80 leading-relaxed">
              Agreement on the left, chat on the right. Alignment Engine ticks
              off matches and flags mismatches.
            </p>
          </div>
          <div>
            <h2 className="font-display italic text-2xl text-sage-deep mb-3">
              Successful matches only.
            </h2>
            <p className="text-bark/80 leading-relaxed">
              We don&rsquo;t care about listings or impressions. We care about
              livestock landing safely on green grass.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
