import type { Metadata } from "next";
import { LoginCard } from "./LoginCard";
import { paddockmeImages } from "@/lib/paddockmeImages";

export const metadata: Metadata = {
  title: "Log In — PaddockME",
};

/** Log In — same backdrop treatment as the registration screen. */
export default function LoginPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-10"
      style={{
        backgroundImage: `url(${paddockmeImages.registrationBackground})`,
      }}
    >
      <div className="absolute inset-0 bg-pm-green-900/40" aria-hidden />
      <LoginCard />
    </main>
  );
}
