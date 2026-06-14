import type { Metadata } from "next";
import { RegisterCard } from "./RegisterCard";
import { paddockmeImages } from "@/lib/paddockmeImages";

export const metadata: Metadata = {
  title: "Create Your Account — PaddockME",
};

/** Screen 2 — Registration / role selection over a full farming backdrop. */
export default function RegisterPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-10"
      style={{
        backgroundImage: `url(${paddockmeImages.registrationBackground})`,
      }}
    >
      <div className="absolute inset-0 bg-pm-green-900/40" aria-hidden />
      <RegisterCard />
    </main>
  );
}
