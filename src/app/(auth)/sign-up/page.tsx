"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/redirect";
import { Loader2, Mail } from "lucide-react";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = getSafeIntent(searchParams.get("intent"));
  const next = getSafeRedirectPath(searchParams.get("next"), "/agreements");
  const onboardingHref = onboardingPath(intent, next);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(onboardingHref)}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Email confirmations may be off — if a session exists immediately,
    // send the new user straight into the onboarding wizard so their
    // profile gets populated before they land on /agreements.
    if (data.session) {
      router.push(onboardingHref);
      router.refresh();
      return;
    }
    setEmailSent(true);
  }

  async function handleResendConfirmation() {
    setResending(true);
    setError(null);
    setResendMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(onboardingHref)}`,
      },
    });
    setResending(false);

    if (error) {
      setError("We could not resend the confirmation email right now.");
      return;
    }

    setResendMessage("Confirmation email resent. Check your inbox and spam folder.");
  }

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
          Make a new account.
        </h1>
        <p className="mb-8 font-medium text-stone">
          One account covers livestock, paddocks, and transport.
        </p>

        {emailSent ? (
          <div className="rounded-[8px] border border-sage-deep/10 bg-sage-mist p-6">
            <div className="flex items-center gap-3 text-sage-deep font-medium mb-2">
              <Mail className="h-5 w-5" />
              Confirm your email
            </div>
            <p className="text-bark/80 text-sm leading-relaxed">
              We sent a confirmation link to {email}. Click it and you&rsquo;ll
              land back on the app.
            </p>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-sage-deep/20 px-5 py-2.5 text-sm font-bold text-sage-deep transition hover:bg-warm-white disabled:opacity-60"
            >
              {resending && <Loader2 className="h-4 w-4 animate-spin" />}
              Resend confirmation email
            </button>
            {resendMessage && (
              <p className="mt-3 text-sm text-sage-deep" role="status">
                {resendMessage}
              </p>
            )}
            {error && (
              <p className="mt-3 text-sm text-terra" role="alert">
                {error}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="sign-up-name" className="mb-1 block text-sm font-medium text-bark">
                Full name
              </label>
              <input
                id="sign-up-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-[8px] border border-sage-deep/15 bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
                placeholder="Pat Murphy"
              />
            </div>
            <div>
              <label htmlFor="sign-up-email" className="mb-1 block text-sm font-medium text-bark">
                Email
              </label>
              <input
                id="sign-up-email"
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
              <label htmlFor="sign-up-password" className="mb-1 block text-sm font-medium text-bark">
                Password
              </label>
              <input
                id="sign-up-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[8px] border border-sage-deep/15 bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="sign-up-confirm-password" className="mb-1 block text-sm font-medium text-bark">
                Re-enter password
              </label>
              <input
                id="sign-up-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-[8px] border border-sage-deep/15 bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
                placeholder="Type it again"
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
              Create account
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-bark/85">
          Already have an account?{" "}
          <Link href="/sign-in" className="inline-flex min-h-11 min-w-11 items-center justify-center text-sage-deep underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function onboardingPath(intent: string | null, next: string): string {
  const params = new URLSearchParams({ next });
  if (intent) params.set("intent", intent);
  return `/onboarding?${params.toString()}`;
}

function getSafeIntent(value: string | null): string | null {
  if (value === "livestock" || value === "landowner" || value === "transport") {
    return value;
  }
  return null;
}
