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
    <div className="flex min-h-dvh bg-cream">
      {/* Form column */}
      <div className="flex w-full flex-col items-center justify-center px-5 py-10 sm:px-6 sm:py-14 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-7 inline-flex min-h-11 items-center font-display text-2xl sm:mb-8"
          >
            <span className="text-bark">Paddock</span>
            <span className="text-ochre">ME</span>
          </Link>
          <h1 className="mb-2 text-3xl font-extrabold text-bark">
            Create your account.
          </h1>
          <p className="mb-6 text-sm text-bark/70">
            Join PaddockME to find feed, list land, or move livestock.
          </p>

          {emailSent ? (
            <div className="rounded-[8px] border border-sage-deep/10 bg-sage-mist p-6">
              <div className="flex items-center gap-3 text-sage-deep font-medium mb-2">
                <Mail className="h-5 w-5" aria-hidden />
                Confirm your email
              </div>
              <p className="text-sm leading-relaxed text-bark/75">
                Open the confirmation link we sent to {email}. It will return
                you to PaddockME to finish your role setup.
              </p>
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-sage-deep/20 px-5 py-2.5 text-sm font-bold text-sage-deep transition hover:bg-warm-white disabled:opacity-60"
              >
                {resending && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
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
            <form onSubmit={handleSignUp} className="space-y-4 rounded-[8px] border border-sage-deep/10 bg-warm-white p-6 shadow-[0_18px_48px_rgba(31,42,36,0.06)] sm:p-7">
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
                <p className="rounded-[8px] border border-terra/35 bg-terra-light/50 px-3 py-2 text-sm text-bark" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ochre px-5 py-3 font-bold text-bark transition hover:bg-ochre/90 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
                Continue
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

      {/* Image column */}
      <div
        className="relative hidden w-1/2 bg-sage-deep bg-cover bg-center lg:block"
        style={{ backgroundImage: "url(/images/paddockme/registration-cattle.jpg)" }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-t from-sage-deep/80 via-sage-deep/10 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="text-2xl font-bold leading-snug text-warm-white">
            Australia&apos;s trusted platform for agistment and livestock
            transport.
          </p>
        </div>
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
