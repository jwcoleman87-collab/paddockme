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
    <div className="min-h-screen flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-display text-3xl text-sage-deep block mb-8"
        >
          PaddockME
        </Link>
        <h1 className="font-display text-3xl text-sage-deep mb-2">
          Welcome back.
        </h1>
        <p className="text-bark/70 mb-8">
          Sign in to your account to keep coordinating.
        </p>

        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>

        <p className="mt-8 text-center text-sm text-bark/70">
          New here?{" "}
          <Link href="/sign-up" className="text-sage-deep underline">
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
      <div className="h-12 rounded-xl bg-mist" />
      <div className="h-12 rounded-xl bg-mist" />
      <div className="h-12 rounded-full bg-mist" />
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
      <div className="rounded-2xl bg-sage-mist border border-sage-glow p-6">
        <div className="flex items-center gap-3 text-sage-deep font-medium mb-2">
          <Mail className="h-5 w-5" />
          Magic link sent
        </div>
        <p className="text-bark/80 text-sm">
          Check {email} for a sign-in link. You can close this tab.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePassword} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-bark mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-mist bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
          placeholder="you@farm.com.au"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-bark mb-1">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-mist bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
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
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-sage-deep px-5 py-3 font-medium text-cream hover:bg-sage-dark transition disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </button>

      <div className="relative my-6 text-center text-sm text-stone">
        <span className="bg-cream px-3 relative z-10">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-mist" />
      </div>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-sage-deep/30 px-5 py-3 font-medium text-sage-deep hover:bg-sage-mist transition disabled:opacity-60"
      >
        <Mail className="h-4 w-4" />
        Send me a magic link
      </button>
    </form>
  );
}
