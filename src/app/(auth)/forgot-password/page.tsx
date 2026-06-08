"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    setLoading(false);

    if (error) {
      setError("We could not send that email right now. Please try again.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-5 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-7 inline-flex min-h-11 items-center font-display text-3xl text-sage-deep sm:mb-8"
        >
          PaddockME
        </Link>
        <h1 className="mb-2 font-display text-3xl text-sage-deep">
          Reset your password.
        </h1>
        <p className="mb-8 text-bark/85">
          Enter your account email and we&apos;ll send a secure reset link.
        </p>

        {sent ? (
          <div className="rounded-2xl border border-sage-glow bg-sage-mist p-6">
            <div className="mb-2 flex items-center gap-3 font-medium text-sage-deep">
              <Mail className="h-5 w-5" />
              Check your email
            </div>
            <p className="text-sm text-bark/80">
              If an account exists for that address, a reset link will arrive shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-password-email"
                className="mb-1 block text-sm font-medium text-bark"
              >
                Email
              </label>
              <input
                id="forgot-password-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-mist bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
                placeholder="you@farm.com.au"
              />
            </div>

            {error && (
              <p className="text-sm text-terra" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sage-deep px-5 py-3 font-medium text-cream transition hover:bg-sage-dark disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-bark/85">
          Remembered it?{" "}
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center text-sage-deep underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
