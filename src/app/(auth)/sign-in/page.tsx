"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/redirect";
import { Loader2, Mail } from "lucide-react";

/**
 * Sign-in page.
 * useSearchParams must live inside a Suspense boundary so Next.js can
 * prerender the surrounding shell. The actual form lives in SignInForm
 * below; the outer page just wraps it.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-transparent px-5 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-[8px] border border-sage-deep/10 bg-warm-white p-6 shadow-[0_18px_48px_rgba(31,42,36,0.08)] sm:p-8">
        <Link
          href="/"
          className="mb-7 inline-flex min-h-11 items-center text-2xl font-extrabold text-bark sm:mb-8"
        >
          PaddockME
        </Link>
        <h1 className="mb-2 text-3xl font-extrabold text-bark">
          Welcome back.
        </h1>

        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>

        <p className="mt-8 text-center text-sm text-bark/85">
          New here?{" "}
          <Link href="/sign-up" className="inline-flex min-h-11 items-center text-sage-deep underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignInSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 rounded-[8px] bg-mist" />
      <div className="h-12 rounded-[8px] bg-mist" />
      <div className="h-12 rounded-[8px] bg-mist" />
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = getSafeRedirectPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMagicSent(true);
  }

  if (magicSent) {
    return (
      <div className="rounded-[8px] border border-sage-deep/10 bg-sage-mist p-6">
        <div className="flex items-center gap-3 text-sage-deep font-medium mb-2">
          <Mail className="h-5 w-5" />
          Magic link sent
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handlePassword} className="space-y-4">
      <div>
        <label htmlFor="sign-in-email" className="mb-1 block text-sm font-medium text-bark">
          Email
        </label>
        <input
          id="sign-in-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[8px] border border-sage-deep/15 bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
          placeholder="you@farm.com.au"
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-3">
          <label htmlFor="sign-in-password" className="block text-sm font-medium text-bark">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="inline-flex min-h-8 items-center text-sm text-sage-deep underline"
          >
            Forgot?
          </Link>
        </div>
        <input
          id="sign-in-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-[8px] border border-sage-deep/15 bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
        />
      </div>

      {error && (
        <p className="text-terra text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-sage-deep px-5 py-3 font-bold text-warm-white transition hover:bg-sage-dark disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </button>

      <div className="relative my-6 text-center text-sm font-medium text-bark/80">
        <span className="relative z-10 bg-warm-white px-3">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-mist" />
      </div>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-sage-deep/20 px-5 py-3 font-bold text-sage-deep transition hover:bg-sage-mist disabled:opacity-60"
      >
        <Mail className="h-4 w-4" />
        Send me a magic link
      </button>
    </form>
  );
}
