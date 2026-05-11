"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Email confirmations may be off — if a session exists immediately, send to /home.
    if (data.session) {
      router.push("/home");
      router.refresh();
      return;
    }
    setEmailSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-display italic text-3xl text-sage-deep block mb-8"
        >
          PaddockME
        </Link>
        <h1 className="font-display italic text-3xl text-sage-deep mb-2">
          Make a new account.
        </h1>
        <p className="text-bark/70 mb-8">
          One account covers livestock, paddocks, and transport.
        </p>

        {emailSent ? (
          <div className="rounded-2xl bg-sage-mist border border-sage-glow p-6">
            <div className="flex items-center gap-3 text-sage-deep font-medium mb-2">
              <Mail className="h-5 w-5" />
              Confirm your email
            </div>
            <p className="text-bark/80 text-sm">
              We sent a confirmation link to {email}. Click it and you&rsquo;ll
              land back on the app.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bark mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-mist bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
                placeholder="Pat Murphy"
              />
            </div>
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-mist bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
                placeholder="At least 8 characters"
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
              Create account
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-bark/70">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-sage-deep underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
