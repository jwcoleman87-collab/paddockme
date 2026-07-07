"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wheat, Truck } from "lucide-react";
import { CattleIcon } from "@/components/paddockme/AnimalIcons";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const roles = [
  {
    id: "livestock-owner",
    label: "Livestock Owner",
    accountType: "Livestock Owner",
    detail: "I need feed",
    icon: CattleIcon,
    next: "/requests/new",
  },
  {
    id: "landowner",
    label: "Landowner",
    accountType: "Landowner",
    detail: "I have feed",
    icon: Wheat,
    next: "/landowner/requests/1023",
  },
  {
    id: "transport",
    label: "Transport Provider",
    accountType: "Transport Provider",
    detail: "I transport",
    icon: Truck,
    next: "/transport/quotes/1023",
  },
];

export function RegisterCard() {
  const router = useRouter();
  const [role, setRole] = useState("livestock-owner");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
      <h1 className="text-2xl font-extrabold text-pm-charcoal">
        Create Your Account
      </h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setNotice(null);

          const selectedRole =
            roles.find((candidate) => candidate.id === role) ?? roles[0];
          const target = selectedRole.next;

          if (!isSupabaseConfigured()) {
            router.push(target);
            return;
          }

          const formData = new FormData(e.currentTarget);
          const fullName = String(formData.get("fullName") ?? "").trim();
          const mobile = String(formData.get("mobile") ?? "").trim();
          const email = String(formData.get("email") ?? "").trim();
          const password = String(formData.get("password") ?? "");

          if (!fullName || !email || !password) {
            setError("Enter your name, email and password.");
            return;
          }

          setIsSubmitting(true);
          const supabase = createClient();
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                phone: mobile,
                account_types: [selectedRole.accountType],
              },
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                target,
              )}`,
            },
          });

          if (signUpError) {
            setIsSubmitting(false);
            setError(signUpError.message);
            return;
          }

          if (data.session && data.user) {
            await supabase.from("profiles").upsert(
              {
                id: data.user.id,
                full_name: fullName,
                phone: mobile || null,
                account_types: [selectedRole.accountType],
              },
              { onConflict: "id" },
            );
            setIsSubmitting(false);
            router.refresh();
            router.push(target);
            return;
          }

          setIsSubmitting(false);
          setNotice("Check your email to finish creating your account.");
        }}
      >
        <FormField
          label="Full Name"
          name="fullName"
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />
        <FormField
          label="Mobile Number"
          name="mobile"
          type="tel"
          placeholder="0412 345 678"
          autoComplete="tel"
        />
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          minLength={6}
          required
        />

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-pm-charcoal">
            I am a:
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {roles.map(({ id, label, detail, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={role === id}
                onClick={() => setRole(id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition-colors cursor-pointer",
                  role === id
                    ? "border-pm-green-900 bg-pm-green-900 text-white"
                    : "border-pm-border bg-white text-pm-charcoal hover:border-pm-green-700",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="text-xs font-bold leading-tight">{label}</span>
                <span
                  className={cn(
                    "text-[10px]",
                    role === id ? "text-white/75" : "text-pm-muted",
                  )}
                >
                  {detail}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-pm-cream-100 px-3 py-2 text-sm font-medium text-pm-green-900">
            {notice}
          </p>
        )}

        <PmButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Continue"}
        </PmButton>
      </form>
      <p className="mt-4 text-center text-sm text-pm-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-pm-green-900 underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
