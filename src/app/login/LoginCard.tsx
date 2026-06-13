"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";

/**
 * Demo sign-in: no real auth, just routes straight back into the guided
 * workflow so the rest of the app can be explored from a logged-in state.
 */
export function LoginCard() {
  const router = useRouter();

  return (
    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
      <h1 className="text-2xl font-extrabold text-pm-charcoal">Log In</h1>
      <p className="mt-1 text-sm text-pm-muted">
        This is a demo — any details will get you in.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/requests/new");
        }}
      >
        <FormField
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <PmButton type="submit" className="w-full">
          Log In
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
