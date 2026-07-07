"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function LoginCard() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
      <h1 className="text-2xl font-extrabold text-pm-charcoal">Log In</h1>
      <p className="mt-1 text-sm text-pm-muted">
        Use your private beta account details.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);

          if (!isSupabaseConfigured()) {
            router.push("/requests/new");
            return;
          }

          const formData = new FormData(e.currentTarget);
          const email = String(formData.get("email") ?? "").trim();
          const password = String(formData.get("password") ?? "");

          if (!email || !password) {
            setError("Enter your email and password.");
            return;
          }

          setIsSubmitting(true);
          const supabase = createClient();
          const { error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          setIsSubmitting(false);
          if (signInError) {
            setError(signInError.message);
            return;
          }

          router.refresh();
          router.push("/account");
        }}
      >
        <FormField
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="********"
          autoComplete="current-password"
          required
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <PmButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </PmButton>
      </form>
      <p className="mt-4 text-center text-sm text-pm-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-pm-green-900 underline-offset-2 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
