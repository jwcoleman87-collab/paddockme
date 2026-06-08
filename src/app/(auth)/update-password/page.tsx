"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tracks whether the visitor arrived with a valid recovery session.
  // Without this guard, a stranger landing on /update-password directly
  // would just be told "This reset link has expired" - misleading. We
  // detect "no session at all" and route them back to /forgot-password
  // with a clearer message.
  const [sessionState, setSessionState] = useState<
    "checking" | "ok" | "missing"
  >("checking");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setSessionState(data.user ? "ok" : "missing");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("This reset link has expired or is no longer valid.");
      return;
    }

    setUpdated(true);
    router.refresh();
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
          Choose a new password.
        </h1>
        <p className="mb-8 text-bark/85">
          Set a fresh password for your account.
        </p>

        {sessionState === "checking" ? (
          <div
            className="rounded-2xl border border-mist bg-warm-white p-6 text-sm text-bark/75"
            role="status"
          >
            <Loader2 className="mb-2 h-4 w-4 animate-spin" />
            Checking your reset link…
          </div>
        ) : sessionState === "missing" ? (
          <div
            className="rounded-2xl border border-terra/40 bg-terra-light/40 p-6"
            role="alert"
          >
            <p className="font-semibold text-sage-deep">
              No active password reset.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-bark/80">
              You need to follow the link in the password-reset email we
              send before you can pick a new password. Request a fresh
              link to continue.
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-sage-deep px-4 text-sm font-semibold text-cream transition hover:bg-sage-dark"
            >
              Send a reset link
            </Link>
          </div>
        ) : updated ? (
          <div className="rounded-2xl border border-sage-glow bg-sage-mist p-6">
            <div className="mb-2 flex items-center gap-3 font-medium text-sage-deep">
              <Check className="h-5 w-5" />
              Password updated
            </div>
            <Link
              href="/agreements"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-sage-deep underline"
            >
              Continue to PaddockME
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="mb-1 block text-sm font-medium text-bark"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-mist bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-new-password"
                className="mb-1 block text-sm font-medium text-bark"
              >
                Confirm password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-mist bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
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
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
