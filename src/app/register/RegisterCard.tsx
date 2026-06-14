"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wheat, Truck } from "lucide-react";
import { CattleIcon } from "@/components/paddockme/AnimalIcons";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";

const roles = [
  {
    id: "livestock-owner",
    label: "Livestock Owner",
    detail: "I need feed",
    icon: CattleIcon,
    next: "/requests/new",
  },
  {
    id: "landowner",
    label: "Landowner",
    detail: "I have feed",
    icon: Wheat,
    next: "/landowner/requests/1023",
  },
  {
    id: "transport",
    label: "Transport Provider",
    detail: "I transport",
    icon: Truck,
    next: "/transport/quotes/1023",
  },
];

/**
 * Role selection is local state for now (per the brief: don't let auth
 * wiring block the visual workflow). Continue routes by chosen role.
 */
export function RegisterCard() {
  const router = useRouter();
  const [role, setRole] = useState("livestock-owner");

  return (
    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
      <h1 className="text-2xl font-extrabold text-pm-charcoal">
        Create Your Account
      </h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const target = roles.find((r) => r.id === role)?.next ?? "/requests/new";
          router.push(target);
        }}
      >
        <FormField label="Full Name" name="fullName" placeholder="Enter your full name" autoComplete="name" />
        <FormField label="Mobile Number" name="mobile" type="tel" placeholder="0412 345 678" autoComplete="tel" />
        <FormField label="Email Address" name="email" type="email" placeholder="you@example.com" autoComplete="email" />

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

        <PmButton type="submit" className="w-full">
          Continue
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
